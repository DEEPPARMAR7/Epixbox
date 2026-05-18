const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');
const { sendPasswordResetEmail } = require('../services/email.service');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { audit } = require('../middleware/audit.middleware');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';

function parseOrigins(value) {
  return String(value || '')
    .split(/[\s,]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

const allowedAuthOrigins = new Set([
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGINS),
  'https://epixbox.vercel.app',
]);

function isAllowedOrigin(origin) {
  return (
    allowedAuthOrigins.has(origin)
    || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin || '')
    || /^http:\/\/localhost:\d+$/.test(origin || '')
    || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || '')
  );
}

router.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

function collectGoogleClientIds() {
  const raw = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_CLIENT_IDS,
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[\s,]+/g))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(raw));
}

const GOOGLE_CLIENT_IDS = collectGoogleClientIds();
const googleClient = GOOGLE_CLIENT_IDS.length ? new OAuth2Client() : null;

if (!GOOGLE_CLIENT_IDS.length) {
  console.warn('[auth] Google login disabled: no GOOGLE_CLIENT_ID/GOOGLE_CLIENT_IDS configured');
}

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function normalizeUsernameSeed(value) {
  return String(value || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30) || 'user';
}

async function generateUniqueUsername(seed) {
  const base = normalizeUsernameSeed(seed);

  for (let i = 0; i < 10; i += 1) {
    const suffix = Math.floor(Math.random() * 900 + 100).toString();
    const candidate = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    const exists = await User.findOne({ where: { username: candidate } });
    if (!exists) return candidate;
  }

  return `${base.slice(0, 22)}${Date.now().toString().slice(-8)}`;
}

// POST /api/auth/register
router.post('/register', authLimiter, audit('auth.register'), async (req, res, next) => {
  try {
    const { email, password, username, first_name, last_name } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const existingUsername = await User.findOne({ where: { username: username.toLowerCase() } });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password_hash,
      username: username.toLowerCase(),
      first_name,
      last_name,
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        plan: user.plan,
        brand_color: user.brand_color,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, audit('auth.login'), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalizedEmail = String(email).trim().toLowerCase();

    // add non-sensitive debug logs to help diagnose login failures
    const logger = require('../config/logger');
    logger.info({ msg: 'auth.login attempt', email: normalizedEmail, ip: req.ip });

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      logger.info({ msg: 'auth.login failed - user not found', email: normalizedEmail });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Accounts created with social login may not have a local password set.
    if (!user.password_hash) {
      logger.info({ msg: 'auth.login failed - no password set for user', userId: user.id });
      return res.status(400).json({ error: 'This account uses social login. Please continue with Google or reset your password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logger.info({ msg: 'auth.login failed - bad password', userId: user.id });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      logger.info({ msg: 'auth.login failed - account deactivated', userId: user.id });
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    logger.info({ msg: 'auth.login success', userId: user.id });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        plan: user.plan,
        brand_color: user.brand_color,
        brand_name: user.brand_name,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/google
router.post('/google', authLimiter, audit('auth.google_login'), async (req, res, next) => {
  try {
    if (!googleClient || GOOGLE_CLIENT_IDS.length === 0) {
      return res.status(500).json({ error: 'Google login is not configured on the server' });
    }

    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    if (typeof idToken !== 'string' || idToken.split('.').length !== 3) {
      return res.status(401).json({ error: 'Google token is malformed' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_IDS,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.email_verified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    const normalizedEmail = String(payload.email).trim().toLowerCase();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      const username = await generateUniqueUsername(payload.name || normalizedEmail.split('@')[0]);
      const password_hash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      user = await User.create({
        email: normalizedEmail,
        password_hash,
        username,
        first_name: payload.given_name || payload.name || 'User',
        last_name: payload.family_name || '',
        avatar_url: payload.picture || null,
        email_verified: true,
      });
    } else {
      const updates = {};
      if (!user.email_verified) updates.email_verified = true;
      if (!user.avatar_url && payload.picture) updates.avatar_url = payload.picture;
      if (Object.keys(updates).length > 0) await user.update(updates);
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        plan: user.plan,
        brand_color: user.brand_color,
        brand_name: user.brand_name,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    const message = String(err?.message || '').toLowerCase();
    if (
      message.includes('wrong recipient') ||
      message.includes('audience') ||
      message.includes('token used too late') ||
      message.includes('invalid token signature') ||
      message.includes('no pem found') ||
      message.includes('jwt') ||
      message.includes('id token') ||
      message.includes('malformed') ||
      message.includes('expired') ||
      message.includes('wrong number of segments')
    ) {
      return res.status(401).json({ error: 'Google token is invalid or client ID does not match this origin' });
    }
    return next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/refresh
router.post('/refresh', authLimiter, audit('auth.refresh'), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid refresh token' });
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, audit('auth.forgot_password'), async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await user.update({ password_reset_token: token, password_reset_expires: expires });

    const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    
    console.log('Password reset request:', {
      email: normalizedEmail,
      baseUrl,
      resetLink,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
      hasClientUrl: !!process.env.CLIENT_URL,
    });
    
    try {
      await sendPasswordResetEmail({ to: normalizedEmail, resetLink });
      console.log('Password reset email sent successfully to:', normalizedEmail);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      console.error('Reset link that was attempted:', resetLink);
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, audit('auth.reset_password'), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await User.findOne({ where: { password_reset_token: token } });
    if (!user || !user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await user.update({ password_hash, password_reset_token: null, password_reset_expires: null });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
