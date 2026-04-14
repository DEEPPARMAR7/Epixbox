const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/galleries', require('./gallery.routes'));
router.use('/galleries', require('./gallerytheme.routes'));
router.use('/photos', require('./photo.routes'));
router.use('/photos/edit', require('./photoedit.routes'));
router.use('/photos', require('./photosearch.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/portfolio', require('./portfolio.routes'));
router.use('/proofing', require('./proofing.routes'));
router.use('/pricing', require('./pricing.routes'));
router.use('/coupons', require('./coupons.routes'));
router.use('/orders', require('./order.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/watermarks', require('./watermark.routes'));
router.use('/auth/2fa', require('./twofactor.routes'));
router.use('/themes', require('./themes.routes'));

module.exports = router;
