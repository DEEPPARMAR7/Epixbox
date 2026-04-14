const express = require('express');
const { query } = require('express-validator');
const { Inventory, ProductVariant, Product, PriceList } = require('../models');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// GET all inventory for user's products
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, lowStockOnly } = req.query;
    const offset = (page - 1) * limit;

    const inventories = await Inventory.findAndCountAll({
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Product,
              include: [
                {
                  model: PriceList,
                  where: { user_id: req.user.id },
                },
              ],
            },
          ],
        },
      ],
      where: lowStockOnly ? sequelize.where(sequelize.col('Inventory.quantity_available'), sequelize.Op.lte, sequelize.col('Inventory.reorder_level')) : {},
      offset,
      limit,
    });

    res.json({
      items: inventories.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: inventories.count,
      totalPages: Math.ceil(inventories.count / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET single inventory
router.get('/:variantId', requireAuth, async (req, res, next) => {
  try {
    const inventory = await Inventory.findOne({
      where: { variant_id: req.params.variantId },
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Product,
              include: [{ model: PriceList, where: { user_id: req.user.id } }],
            },
          ],
        },
      ],
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// PATCH update inventory (stock count)
router.patch('/:variantId', requireAuth, async (req, res, next) => {
  try {
    const { quantity_on_hand, quantity_reserved, reorder_level, reorder_quantity, warehouse_location } = req.body;

    const inventory = await Inventory.findOne({
      where: { variant_id: req.params.variantId },
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Product,
              include: [{ model: PriceList, where: { user_id: req.user.id } }],
            },
          ],
        },
      ],
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const updates = {};
    if (quantity_on_hand !== undefined) updates.quantity_on_hand = quantity_on_hand;
    if (quantity_reserved !== undefined) updates.quantity_reserved = quantity_reserved;
    if (reorder_level !== undefined) updates.reorder_level = reorder_level;
    if (reorder_quantity !== undefined) updates.reorder_quantity = reorder_quantity;
    if (warehouse_location !== undefined) updates.warehouse_location = warehouse_location;

    if (Object.keys(updates).length > 0) {
      updates.last_restocked_at = new Date();
    }

    await inventory.update(updates);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// POST bulk update inventory
router.post('/bulk-update', requireAuth, async (req, res, next) => {
  try {
    const updates = req.body; // Array of { variantId, quantity_on_hand }

    for (const update of updates) {
      await Inventory.update(
        { quantity_on_hand: update.quantity_on_hand, last_restocked_at: new Date() },
        { where: { variant_id: update.variantId } }
      );
    }

    res.json({ message: 'Inventory updated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
