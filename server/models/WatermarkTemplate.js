const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WatermarkTemplate = sequelize.define('WatermarkTemplate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  position: {
    type: DataTypes.ENUM('top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'),
    defaultValue: 'bottom-right'
  },
  opacity: { type: DataTypes.FLOAT, defaultValue: 0.5, validate: { min: 0, max: 1 } },
  size_percentage: { type: DataTypes.FLOAT, defaultValue: 20, validate: { min: 5, max: 100 } },
  font_family: { type: DataTypes.STRING(50), defaultValue: 'Arial' },
  text: { type: DataTypes.STRING(200) },
  image_url_s3: { type: DataTypes.STRING(500) }, // For image watermarks
  rotation: { type: DataTypes.FLOAT, defaultValue: -45 }, // For diagonal watermarks
  color: { type: DataTypes.STRING(7), defaultValue: '#FFFFFF' }, // For text watermarks
  is_text_watermark: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'watermark_templates',
  underscored: true,
  timestamps: true
});

module.exports = WatermarkTemplate;
