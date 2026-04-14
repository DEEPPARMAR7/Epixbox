const router = require('express').Router();
const { Theme } = require('../models');
const { requireAuth } = require('../middleware/auth.middleware');
const logger = require('../config/logger');

// Pre-built themes data
const PREBUILT_THEMES = [
  {
    id: 'theme-minimal-light',
    name: 'Minimal Light',
    description: 'Clean, minimalist design with lots of whitespace',
    category: 'minimal',
    css_variables: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#666666',
      bg: '#FFFFFF',
      text: '#000000',
      border: '#E5E5E5',
      card_bg: '#F9F9F9',
    },
  },
  {
    id: 'theme-dark-elegance',
    name: 'Dark Elegance',
    description: 'Dark background with gold accents for luxury feel',
    category: 'dark',
    css_variables: {
      primary: '#000000',
      secondary: '#1A1A1A',
      accent: '#D4AF37',
      bg: '#0F0F0F',
      text: '#FFFFFF',
      border: '#333333',
      card_bg: '#1A1A1A',
    },
  },
  {
    id: 'theme-bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'High contrast colors with vibrant accents',
    category: 'vibrant',
    css_variables: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
      bg: '#FFFFFF',
      text: '#2D3436',
      border: '#FF6B6B',
      card_bg: '#F8F9FA',
    },
  },
  {
    id: 'theme-professional',
    name: 'Professional',
    description: 'Corporate design with blue/gray color scheme',
    category: 'professional',
    css_variables: {
      primary: '#1E3A8A',
      secondary: '#E0E7FF',
      accent: '#3B82F6',
      bg: '#FFFFFF',
      text: '#1F2937',
      border: '#D1D5DB',
      card_bg: '#F3F4F6',
    },
  },
  {
    id: 'theme-artistic',
    name: 'Artistic',
    description: 'Experimental design with creative typography',
    category: 'artistic',
    css_variables: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#06B6D4',
      bg: '#FAFAFA',
      text: '#1F2937',
      border: '#E5E7EB',
      card_bg: '#FFFFFF',
    },
  },
];

/**
 * GET /api/v1/themes
 * Get all available themes (both pre-built and custom)
 */
router.get('/', async (req, res) => {
  try {
    // Get custom themes from DB
    const customThemes = await Theme.findAll({
      order: [['created_at', 'DESC']],
    });

    // Combine with pre-built themes
    const allThemes = [
      ...PREBUILT_THEMES,
      ...customThemes.map(t => t.toJSON()),
    ];

    res.json(allThemes);
  } catch (error) {
    logger.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

/**
 * GET /api/v1/themes/:id
 * Get a specific theme
 */
router.get('/:id', async (req, res) => {
  try {
    // Check if it's a pre-built theme
    const prebuilt = PREBUILT_THEMES.find(t => t.id === req.params.id);
    if (prebuilt) return res.json(prebuilt);

    // Otherwise fetch from DB
    const theme = await Theme.findByPk(req.params.id);
    if (!theme) return res.status(404).json({ error: 'Theme not found' });

    res.json(theme);
  } catch (error) {
    logger.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

/**
 * GET /api/v1/themes/category/:category
 * Get themes by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const themes = PREBUILT_THEMES.filter(t => t.category === req.params.category);
    const customThemes = await Theme.findAll({
      where: { category: req.params.category },
    });

    res.json([...themes, ...customThemes.map(t => t.toJSON())]);
  } catch (error) {
    logger.error('Error fetching themes by category:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

module.exports = router;
