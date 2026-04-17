const router = require('express').Router();
const crypto = require('crypto');
const sharp = require('sharp');
const { ProofingSession, ProofingSelection, ProofingComment, ProofingDownload, Gallery, Photo, GalleryExpiry } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const proofingAccess = require('../middleware/proofingAccess.middleware');
const { sendProofingInvite } = require('../services/email.service');
const { getPublicUrl, getObjectBuffer } = require('../services/s3.service');
const { setPrivateNoStore } = require('../middleware/cache.middleware');
const { pushUserNotification } = require('../services/realtime.service');

function wantsWatermark(session, photo) {
  return session.download_mode === 'watermarked' && String(photo.mime_type || '').startsWith('image/');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
}

function watermarkSvg(label) {
  const escaped = String(label || 'EpixBox').replace(/[<&>"']/g, '');
  return Buffer.from(`
    <svg width="2200" height="2200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm { fill: rgba(255,255,255,0.26); font-size: 96px; font-family: Arial, sans-serif; font-weight: 700; }
      </style>
      <g transform="rotate(-24 1100 1100)">
        <text x="150" y="1000" class="wm">${escaped}</text>
        <text x="900" y="1450" class="wm">${escaped}</text>
        <text x="200" y="1900" class="wm">${escaped}</text>
      </g>
    </svg>
  `);
}

async function registerDownload(session, photo, mode, req) {
  await ProofingDownload.create({
    session_id: session.id,
    photo_id: photo.id,
    file_name: photo.filename_original || photo.title || photo.id,
    mime_type: photo.mime_type,
    mode,
    ip_address: getClientIp(req),
    user_agent: req.headers['user-agent'] || null,
  });

  await session.update({
    download_count: (session.download_count || 0) + 1,
    last_download_at: new Date(),
  });

  const expiry = await GalleryExpiry.findOne({ where: { gallery_id: session.gallery_id, is_enabled: true } });
  if (expiry && expiry.downloads_remaining !== null && expiry.downloads_remaining !== undefined) {
    const nextRemaining = Math.max(0, Number(expiry.downloads_remaining) - 1);
    await expiry.update({ downloads_remaining: nextRemaining });
  }
}

function ensureDownloadAllowed(session) {
  if (!session.allow_downloads) return 'Downloads are disabled for this session';
  if (session.max_download_count && (session.download_count || 0) >= session.max_download_count) {
    return 'Download limit reached for this session';
  }
  return null;
}

async function ensureGalleryExpiryAllowsDownload(session) {
  const expiry = await GalleryExpiry.findOne({ where: { gallery_id: session.gallery_id, is_enabled: true } });
  if (!expiry) return null;

  if (expiry.expires_at && new Date(expiry.expires_at).getTime() <= Date.now()) {
    return 'Gallery has expired';
  }

  if (expiry.downloads_remaining !== null && expiry.downloads_remaining !== undefined && Number(expiry.downloads_remaining) <= 0) {
    return 'Gallery download limit has been reached';
  }

  return null;
}

function getRequestOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

async function getSessionGalleryIds(session) {
  if (!session.include_subfolders) return [session.gallery_id];

  const galleries = await Gallery.findAll({
    where: { user_id: session.user_id },
    attributes: ['id', 'parent_id'],
  });

  const childrenMap = galleries.reduce((acc, g) => {
    const parentKey = g.parent_id || 'root';
    if (!acc[parentKey]) acc[parentKey] = [];
    acc[parentKey].push(g.id);
    return acc;
  }, {});

  const scoped = new Set([session.gallery_id]);
  const queue = [session.gallery_id];
  while (queue.length > 0) {
    const current = queue.shift();
    const children = childrenMap[current] || [];
    for (const childId of children) {
      if (!scoped.has(childId)) {
        scoped.add(childId);
        queue.push(childId);
      }
    }
  }

  return [...scoped];
}

async function findScopedPhoto(session, photoId) {
  const galleryIds = await getSessionGalleryIds(session);
  return Photo.findOne({
    where: {
      id: photoId,
      gallery_id: galleryIds,
      user_id: session.user_id,
    },
  });
}

// ── Photographer routes (auth required) ──────────────────────────────────────

// GET /api/proofing
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const sessions = await ProofingSession.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Gallery, attributes: ['id', 'title', 'slug'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(sessions);
  } catch (err) { next(err); }
});

// GET /api/proofing/:id/downloads
router.get('/:id/downloads', requireAuth, async (req, res, next) => {
  try {
    const session = await ProofingSession.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const downloads = await ProofingDownload.findAll({
      where: { session_id: session.id },
      include: [{ model: Photo, attributes: ['id', 'title', 'filename_original'] }],
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    res.json({
      total: session.download_count || 0,
      last_download_at: session.last_download_at,
      max_download_count: session.max_download_count,
      downloads,
    });
  } catch (err) { next(err); }
});

// POST /api/proofing
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      gallery_id,
      client_name,
      client_email,
      message,
      expires_at,
      allow_comments,
      allow_selections,
      include_subfolders,
      allow_downloads,
      download_mode,
      max_download_count,
    } = req.body;
    if (!gallery_id) return res.status(400).json({ error: 'gallery_id is required' });

    const gallery = await Gallery.findOne({ where: { id: gallery_id, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const share_token = crypto.randomBytes(32).toString('hex');
    const session = await ProofingSession.create({
      gallery_id, user_id: req.user.id, share_token, client_name, client_email,
      message, expires_at: expires_at || null,
      allow_comments: allow_comments !== false,
      allow_selections: allow_selections !== false,
      include_subfolders: include_subfolders === true,
      allow_downloads: allow_downloads !== false,
      download_mode: download_mode === 'watermarked' ? 'watermarked' : 'original',
      max_download_count: max_download_count ? Number(max_download_count) : null,
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

// GET /api/proofing/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await ProofingSession.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Gallery, include: [{ model: Photo, attributes: ['id', 's3_key_thumb', 's3_key_medium', 'title'] }] },
        { model: ProofingSelection, include: [{ model: Photo, attributes: ['id', 'title', 's3_key_thumb'] }] },
        { model: ProofingComment },
      ],
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) { next(err); }
});

// PUT /api/proofing/:id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await ProofingSession.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const {
      client_name,
      client_email,
      message,
      expires_at,
      allow_comments,
      allow_selections,
      include_subfolders,
      allow_downloads,
      download_mode,
      max_download_count,
      is_active,
    } = req.body;
    await session.update({
      client_name,
      client_email,
      message,
      expires_at,
      allow_comments,
      allow_selections,
      include_subfolders,
      allow_downloads,
      download_mode: download_mode === 'watermarked' ? 'watermarked' : (download_mode === 'original' ? 'original' : session.download_mode),
      max_download_count: max_download_count === '' ? null : (max_download_count !== undefined ? Number(max_download_count) : session.max_download_count),
      is_active,
    });
    res.json(session);
  } catch (err) { next(err); }
});

// DELETE /api/proofing/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await ProofingSession.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    await session.destroy();
    res.json({ message: 'Session deleted' });
  } catch (err) { next(err); }
});

// POST /api/proofing/:id/send-invite
router.post('/:id/send-invite', requireAuth, async (req, res, next) => {
  try {
    const session = await ProofingSession.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.client_email) return res.status(400).json({ error: 'No client email set on this session' });

    const shareLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/proof/${session.share_token}`;
    await sendProofingInvite({
      to: session.client_email,
      clientName: session.client_name || 'Valued Client',
      photographerName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.username,
      shareLink,
      message: session.message,
    });
    res.json({ message: 'Invite sent' });
  } catch (err) { next(err); }
});

// ── Client routes (token-based) ───────────────────────────────────────────────

// GET /api/proofing/session/:token
router.get('/session/:token', setPrivateNoStore, proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const origin = getRequestOrigin(req);
    const gallery = await Gallery.findByPk(session.gallery_id);
    const scopedGalleryIds = await getSessionGalleryIds(session);
    const photos = await Photo.findAll({
      where: { gallery_id: scopedGalleryIds, user_id: session.user_id },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });

    const selections = await ProofingSelection.findAll({ where: { session_id: session.id } });
    const selectionMap = new Map(selections.map((s) => [s.photo_id, s]));

    const comments = await ProofingComment.findAll({ where: { session_id: session.id } });
    const commentsMap = comments.reduce((acc, c) => {
      const arr = acc[c.photo_id] || [];
      arr.push(c);
      acc[c.photo_id] = arr;
      return acc;
    }, {});

    const rawPhotos = photos.map((photo) => {
      const p = photo.toJSON ? photo.toJSON() : photo;
      const sel = selectionMap.get(p.id);
      return {
        ...p,
        preview_url: `${origin}/api/proofing/session/${session.share_token}/photos/${p.id}/preview`,
        thumb_url: getPublicUrl(p.s3_key_thumb),
        medium_url: getPublicUrl(p.s3_key_medium),
        large_url: getPublicUrl(p.s3_key_large),
        is_selected: sel ? !!sel.is_selected : false,
        star_rating: sel ? (sel.star_rating || 0) : 0,
        comments: commentsMap[p.id] || [],
      };
    });

    res.json({ session, gallery, photos: rawPhotos });
  } catch (err) { next(err); }
});

// GET /api/proofing/session/:token/photos/:photoId/preview
router.get('/session/:token/photos/:photoId/preview', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const photo = await findScopedPhoto(session, req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const key = photo.s3_key_medium || photo.s3_key_large || photo.s3_key_thumb || photo.s3_key_original;
    if (!key) return res.status(404).json({ error: 'No preview file found for this photo' });

    const isGeneratedImagePreview = key === photo.s3_key_medium || key === photo.s3_key_large || key === photo.s3_key_thumb;
    const contentType = isGeneratedImagePreview
      ? 'image/jpeg'
      : (photo.mime_type || 'application/octet-stream');
    const buffer = await getObjectBuffer(key);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.send(buffer);
  } catch (err) { next(err); }
});

// GET /api/proofing/session/:token/photos/:photoId/download-url
router.get('/session/:token/photos/:photoId/download-url', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const denyReason = ensureDownloadAllowed(session);
    if (denyReason) return res.status(403).json({ error: denyReason });

    const galleryDenyReason = await ensureGalleryExpiryAllowsDownload(session);
    if (galleryDenyReason) return res.status(403).json({ error: galleryDenyReason });

    const photo = await findScopedPhoto(session, req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const modeParam = req.query.mode === 'watermarked' ? 'watermarked' : session.download_mode;
    const mode = modeParam === 'watermarked' && wantsWatermark(session, photo) ? 'watermarked' : 'original';
    const url = `/api/proofing/session/${session.share_token}/photos/${photo.id}/download?mode=${mode}`;
    const filename = photo.filename_original || `${photo.title || photo.id}`;
    res.json({ url, filename, mode });
  } catch (err) { next(err); }
});

// GET /api/proofing/session/:token/photos/:photoId/download?mode=original|watermarked
router.get('/session/:token/photos/:photoId/download', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const denyReason = ensureDownloadAllowed(session);
    if (denyReason) return res.status(403).json({ error: denyReason });

    const galleryDenyReason = await ensureGalleryExpiryAllowsDownload(session);
    if (galleryDenyReason) return res.status(403).json({ error: galleryDenyReason });

    const photo = await findScopedPhoto(session, req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const requestedMode = req.query.mode === 'watermarked' ? 'watermarked' : session.download_mode;
    const useWatermark = requestedMode === 'watermarked' && wantsWatermark(session, photo);

    const key = photo.s3_key_original || photo.s3_key_large || photo.s3_key_medium || photo.s3_key_thumb;
    if (!key) return res.status(404).json({ error: 'No downloadable file found for this photo' });

    if (useWatermark) {
      const input = await getObjectBuffer(key);
      const output = await sharp(input)
        .composite([{ input: watermarkSvg(photo.title || 'EpixBox'), gravity: 'center' }])
        .jpeg({ quality: 90 })
        .toBuffer();

      const outName = `watermarked-${photo.filename_original || `${photo.id}.jpg`}`;
      await registerDownload(session, photo, 'watermarked', req);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${String(outName).replace(/"/g, '')}"`);
      return res.send(output);
    }

    const filename = photo.filename_original || `${photo.title || photo.id}`;
    const contentType = photo.mime_type || 'application/octet-stream';
    const buffer = await getObjectBuffer(key);
    await registerDownload(session, photo, 'original', req);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${String(filename).replace(/"/g, '')}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) { next(err); }
});

// GET /api/proofing/session/:token/download-urls?selectedOnly=true
router.get('/session/:token/download-urls', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const denyReason = ensureDownloadAllowed(session);
    if (denyReason) return res.status(403).json({ error: denyReason });

    const galleryDenyReason = await ensureGalleryExpiryAllowsDownload(session);
    if (galleryDenyReason) return res.status(403).json({ error: galleryDenyReason });

    const selectedOnly = String(req.query.selectedOnly || 'false') === 'true';

    let photoIds = null;
    if (selectedOnly) {
      const selected = await ProofingSelection.findAll({
        where: { session_id: session.id, is_selected: true },
        attributes: ['photo_id'],
      });
      photoIds = selected.map((s) => s.photo_id);
      if (photoIds.length === 0) return res.json([]);
    }

    const scopedGalleryIds = await getSessionGalleryIds(session);
    const where = { gallery_id: scopedGalleryIds, user_id: session.user_id };
    if (photoIds) where.id = photoIds;

    const photos = await Photo.findAll({ where, order: [['sort_order', 'ASC'], ['created_at', 'ASC']] });
    const remaining = session.max_download_count
      ? Math.max(0, Number(session.max_download_count) - Number(session.download_count || 0))
      : photos.length;
    const limitedPhotos = session.max_download_count ? photos.slice(0, remaining) : photos;

    const downloads = limitedPhotos.map((photo) => {
      const key = photo.s3_key_original || photo.s3_key_large || photo.s3_key_medium || photo.s3_key_thumb;
      if (!key) return null;
      const filename = photo.filename_original || `${photo.title || photo.id}`;
      const mode = session.download_mode === 'watermarked' && String(photo.mime_type || '').startsWith('image/')
        ? 'watermarked'
        : 'original';
      const url = `/api/proofing/session/${session.share_token}/photos/${photo.id}/download?mode=${mode}`;
      return { photo_id: photo.id, filename, url, mode };
    });

    res.json(downloads.filter(Boolean));
  } catch (err) { next(err); }
});

// POST /api/proofing/session/:token/select
router.post('/session/:token/select', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const photoId = req.body.photoId || req.body.photo_id;
    const { star_rating, is_selected } = req.body;
    if (!photoId) return res.status(400).json({ error: 'photoId is required' });
    const photo = await findScopedPhoto(session, photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found in this session' });
    const [selection, created] = await ProofingSelection.findOrCreate({
      where: { session_id: session.id, photo_id: photoId },
      defaults: { session_id: session.id, photo_id: photoId, star_rating: 0, is_selected: false },
    });
    if (star_rating !== undefined) selection.star_rating = star_rating;
    if (is_selected !== undefined) selection.is_selected = is_selected;
    await selection.save();
    res.json(selection);
  } catch (err) { next(err); }
});

// POST /api/proofing/session/:token/comment
router.post('/session/:token/comment', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const photoId = req.body.photoId || req.body.photo_id;
    const { author_name, body } = req.body;
    if (!author_name || !body) return res.status(400).json({ error: 'author_name and body are required' });
    if (!photoId) return res.status(400).json({ error: 'photoId is required' });
    const photo = await findScopedPhoto(session, photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found in this session' });
    const comment = await ProofingComment.create({
      session_id: session.id,
      photo_id: photoId,
      author_name,
      body,
    });

    pushUserNotification(session.user_id, {
      type: 'proofing.comment_added',
      title: 'New Proofing Comment',
      message: `${author_name} added a comment`,
      sessionId: session.id,
      photoId,
    });

    res.status(201).json(comment);
  } catch (err) { next(err); }
});

// GET /api/proofing/session/:token/summary
router.get('/session/:token/summary', proofingAccess, async (req, res, next) => {
  try {
    const selections = await ProofingSelection.findAll({
      where: { session_id: req.proofingSession.id },
      include: [{ model: Photo, attributes: ['id', 'title', 's3_key_thumb', 's3_key_medium'] }],
    });
    const comments = await ProofingComment.findAll({
      where: { session_id: req.proofingSession.id },
    });
    res.json({ selections, comments });
  } catch (err) { next(err); }
});

module.exports = router;
