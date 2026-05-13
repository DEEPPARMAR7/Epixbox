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

// Phase 4: Products & Inventory
router.use('/products', require('./products.routes'));
router.use('/inventory', require('./inventory.routes'));

// Phase 5: Shipping
router.use('/shipping', require('./shipping.routes'));

// Phase 6: Analytics
router.use('/analytics', require('./analytics.routes'));

// Phase 7: Gallery Access Control
router.use('/galleries', require('./gallery-access.routes'));

// Phase 8: Advanced E-Commerce
router.use('/api-keys', require('./api-keys.routes'));
router.use('/gift-cards', require('./gift-cards.routes'));
router.use('/subscriptions', require('./subscriptions.routes'));
router.use('/payment-methods', require('./payment-methods.routes'));
router.use('/refunds', require('./refunds.routes'));
router.use('/checkout', require('./checkout.routes'));

module.exports = router;
