const express = require('express');
const crypto = require('crypto');
const { ApiKey } = require('../../models');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// Generate API key hash
const generateKeyHash = (key) => crypto.createHash('sha256').update(key).digest('hex');

// GET all API keys for user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'name', 'scopes', 'last_used_at', 'is_active', 'expires_at', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    res.json(keys);
  } catch (error) {
    next(error);
  }
});

// POST create new API key
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, scopes = ['read:photos', 'read:galleries'], expires_at } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Key name required' });
    }

    // Generate unique API key
    const rawKey = `epx_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = generateKeyHash(rawKey);

    const apiKey = await ApiKey.create({
      user_id: req.user.id,
      key_hash: keyHash,
      name,
      scopes,
      expires_at,
    });

    // Return raw key only once (user must save it)
    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only return once
      scopes: apiKey.scopes,
      created_at: apiKey.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// GET single key details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      attributes: ['id', 'name', 'scopes', 'last_used_at', 'is_active', 'expires_at'],
    });

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json(key);
  } catch (error) {
    next(error);
  }
});

// DELETE revoke API key
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const key = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await key.destroy();
    res.json({ message: 'API key revoked' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
