const express = require('express');
const { body } = require('express-validator');
const { ShippingZone, ShippingRate } = require('../../models');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// CREATE shipping zone
router.post(
  '/zones',
  requireAuth,
  [
    body('name').notEmpty(),
    body('countries').isArray(),
  ],
  async (req, res, next) => {
    try {
      const zone = await ShippingZone.create({
        user_id: req.user.id,
        ...req.body,
      });
      res.status(201).json(zone);
    } catch (error) {
      next(error);
    }
  }
);

// GET all zones for user
router.get('/zones', requireAuth, async (req, res, next) => {
  try {
    const zones = await ShippingZone.findAll({
      where: { user_id: req.user.id },
      include: [{ model: ShippingRate }],
    });
    res.json(zones);
  } catch (error) {
    next(error);
  }
});

// GET single zone
router.get('/zones/:id', requireAuth, async (req, res, next) => {
  try {
    const zone = await ShippingZone.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: ShippingRate }],
    });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

// UPDATE zone
router.put('/zones/:id', requireAuth, async (req, res, next) => {
  try {
    const zone = await ShippingZone.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.update(req.body);
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

// DELETE zone
router.delete('/zones/:id', requireAuth, async (req, res, next) => {
  try {
    const zone = await ShippingZone.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    await zone.destroy();
    res.json({ message: 'Zone deleted' });
  } catch (error) {
    next(error);
  }
});

// CREATE shipping rate
router.post(
  '/rates',
  requireAuth,
  [
    body('zone_id').isInt(),
    body('name').notEmpty(),
    body('carrier').notEmpty(),
    body('base_price_cents').isInt(),
  ],
  async (req, res, next) => {
    try {
      // Verify zone ownership
      const zone = await ShippingZone.findOne({
        where: { id: req.body.zone_id, user_id: req.user.id },
      });
      if (!zone) return res.status(403).json({ error: 'Unauthorized' });

      const rate = await ShippingRate.create(req.body);
      res.status(201).json(rate);
    } catch (error) {
      next(error);
    }
  }
);

// GET all rates for a zone
router.get('/zones/:zoneId/rates', requireAuth, async (req, res, next) => {
  try {
    // Verify zone ownership
    const zone = await ShippingZone.findOne({
      where: { id: req.params.zoneId, user_id: req.user.id },
    });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    const rates = await ShippingRate.findAll({
      where: { zone_id: req.params.zoneId },
    });
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

// UPDATE rate
router.put('/rates/:id', requireAuth, async (req, res, next) => {
  try {
    const rate = await ShippingRate.findByPk(req.params.id, {
      include: [{ model: ShippingZone, where: { user_id: req.user.id } }],
    });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    await rate.update(req.body);
    res.json(rate);
  } catch (error) {
    next(error);
  }
});

// DELETE rate
router.delete('/rates/:id', requireAuth, async (req, res, next) => {
  try {
    const rate = await ShippingRate.findByPk(req.params.id, {
      include: [{ model: ShippingZone, where: { user_id: req.user.id } }],
    });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    await rate.destroy();
    res.json({ message: 'Rate deleted' });
  } catch (error) {
    next(error);
  }
});

// CALCULATE shipping for order
router.post('/calculate', requireAuth, async (req, res, next) => {
  try {
    const { country, state, weight_grams } = req.body;

    // Find matching zones
    const zone = await ShippingZone.findOne({
      where: {
        user_id: req.user.id,
        is_active: true,
      },
    });

    if (!zone) {
      return res.status(404).json({ error: 'No shipping zones configured' });
    }

    // Find matching rates for this zone
    const rates = await ShippingRate.findAll({
      where: {
        zone_id: zone.id,
        is_active: true,
        weight_min_grams: { [require('sequelize').Op.lte]: weight_grams },
        weight_max_grams: { [require('sequelize').Op.gte]: weight_grams },
      },
    });

    res.json({ zone, rates });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
