const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/galleries', require('./gallery.routes'));
router.use('/photos', require('./photo.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/portfolio', require('./portfolio.routes'));
router.use('/proofing', require('./proofing.routes'));
router.use('/pricing', require('./pricing.routes'));
router.use('/orders', require('./order.routes'));
router.use('/settings', require('./settings.routes'));

module.exports = router;
