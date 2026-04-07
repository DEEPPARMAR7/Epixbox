const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const { resolveUserRole } = require('../utils/roles');

module.exports = async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me');
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'password_reset_token', 'password_reset_expires'] },
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = user;
    req.userRole = resolveUserRole(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
