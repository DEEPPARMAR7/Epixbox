const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Product, ProductVariant, Inventory, PriceList } = require('../../models');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// Middleware to validate request
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET all products for user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, priceListId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (priceListId) {
      whereClause.price_list_id = priceListId;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: PriceList, where: { user_id: req.user.id }, attributes: ['id', 'name'] },
        {
          model: ProductVariant,
          include: [{ model: Inventory, attributes: ['quantity_on_hand', 'quantity_reserved'] }],
        },
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    res.json({
      items: rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
});

// GET single product
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: PriceList, where: { user_id: req.user.id } },
        {
          model: ProductVariant,
          include: [{ model: Inventory }],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST create product
router.post(
  '/',
  requireAuth,
  [
    body('name').notEmpty().withMessage('Product name required'),
    body('price_list_id').isInt().withMessage('Valid price list ID required'),
    body('category').isIn(['print', 'digital', 'canvas', 'metal']).withMessage('Valid category required'),
    body('price_cents').isInt().withMessage('Price in cents required'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, price_list_id, category, price_cents, description } = req.body;

      // Verify user owns this price list
      const priceList = await PriceList.findByPk(price_list_id);
      if (!priceList || priceList.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const product = await Product.create({
        price_list_id,
        category,
        name,
        description,
        price_cents,
      });

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }
);

// PUT update product
router.put(
  '/:id',
  requireAuth,
  [
    body('name').optional().notEmpty(),
    body('price_cents').optional().isInt(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: PriceList, where: { user_id: req.user.id } }],
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await product.update(req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE product
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: PriceList, where: { user_id: req.user.id } }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// POST create variant
router.post(
  '/:id/variants',
  requireAuth,
  [
    body('name').notEmpty(),
    body('price_multiplier').isFloat({ min: 0.1 }).optional(),
    body('sku').optional(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: PriceList, where: { user_id: req.user.id } }],
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const variant = await ProductVariant.create({
        product_id: product.id,
        ...req.body,
      });

      // Create inventory record for this variant
      await Inventory.create({
        variant_id: variant.id,
        quantity_on_hand: 0,
      });

      res.status(201).json(variant);
    } catch (error) {
      next(error);
    }
  }
);

// PUT update variant
router.put('/:productId/variants/:variantId', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{ model: PriceList, where: { user_id: req.user.id } }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variant = await ProductVariant.findByPk(req.params.variantId);
    if (!variant || variant.product_id !== product.id) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    await variant.update(req.body);
    res.json(variant);
  } catch (error) {
    next(error);
  }
});

// DELETE variant
router.delete('/:productId/variants/:variantId', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{ model: PriceList, where: { user_id: req.user.id } }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variant = await ProductVariant.findByPk(req.params.variantId);
    if (!variant || variant.product_id !== product.id) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    await variant.destroy();
    res.json({ message: 'Variant deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
