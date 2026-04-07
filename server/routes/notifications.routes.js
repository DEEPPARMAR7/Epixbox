const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { getRecentNotifications } = require('../services/realtime.service');

router.use(requireAuth);

router.get('/recent', (req, res) => {
  res.json({ items: getRecentNotifications(req.user.id) });
});

module.exports = router;
