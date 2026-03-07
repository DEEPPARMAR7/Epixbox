const router = require('express').Router();
const crypto = require('crypto');
const { ProofingSession, ProofingSelection, ProofingComment, Gallery, Photo } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const proofingAccess = require('../middleware/proofingAccess.middleware');
const { sendProofingInvite } = require('../services/email.service');

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

// POST /api/proofing
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { gallery_id, client_name, client_email, message, expires_at, allow_comments, allow_selections } = req.body;
    if (!gallery_id) return res.status(400).json({ error: 'gallery_id is required' });

    const gallery = await Gallery.findOne({ where: { id: gallery_id, user_id: req.user.id } });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const share_token = crypto.randomBytes(32).toString('hex');
    const session = await ProofingSession.create({
      gallery_id, user_id: req.user.id, share_token, client_name, client_email,
      message, expires_at: expires_at || null,
      allow_comments: allow_comments !== false,
      allow_selections: allow_selections !== false,
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
    const { client_name, client_email, message, expires_at, allow_comments, allow_selections, is_active } = req.body;
    await session.update({ client_name, client_email, message, expires_at, allow_comments, allow_selections, is_active });
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
router.get('/session/:token', proofingAccess, async (req, res, next) => {
  try {
    const session = req.proofingSession;
    const gallery = await Gallery.findByPk(session.gallery_id, {
      include: [{ model: Photo, order: [['sort_order', 'ASC']] }],
    });
    res.json({ session, gallery });
  } catch (err) { next(err); }
});

// POST /api/proofing/session/:token/select
router.post('/session/:token/select', proofingAccess, async (req, res, next) => {
  try {
    const { photoId, star_rating, is_selected } = req.body;
    const [selection, created] = await ProofingSelection.findOrCreate({
      where: { session_id: req.proofingSession.id, photo_id: photoId },
      defaults: { session_id: req.proofingSession.id, photo_id: photoId, star_rating: 0, is_selected: false },
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
    const { photoId, author_name, body } = req.body;
    if (!author_name || !body) return res.status(400).json({ error: 'author_name and body are required' });
    const comment = await ProofingComment.create({
      session_id: req.proofingSession.id,
      photo_id: photoId,
      author_name,
      body,
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
