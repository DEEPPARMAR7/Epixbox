const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

// Dev-only debug login. Enabled by setting ENABLE_DEBUG_LOGIN=true in env.
router.post('/', async (req, res) => {
  if (String(process.env.ENABLE_DEBUG_LOGIN).toLowerCase() !== 'true') {
    return res.status(403).json({ error: 'Debug login not enabled on this server' });
  }

  try {
    const email = req.body?.email || process.env.DEBUG_LOGIN_EMAIL || 'debug+admin@example.com';
    const normalized = String(email).trim().toLowerCase();

    let user = await User.findOne({ where: { email: normalized } });
    if (!user) {
      // create a lightweight test user
      const username = `debug_${Math.floor(Math.random() * 9000) + 1000}`;
      const password_hash = await bcrypt.hash('password123', 10);
      user = await User.create({
        email: normalized,
        username,
        password_hash,
        first_name: 'Debug',
        last_name: 'User',
        is_active: true,
      });
    }

    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me';
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';
    const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    return res.json({
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
    return res.status(500).json({ error: 'Debug login failed', details: err.message });
  }
});

module.exports = router;
