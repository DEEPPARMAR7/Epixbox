const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GallerySetting = sequelize.define('GallerySetting', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gallery_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  preset: { type: DataTypes.STRING(64), defaultValue: 'epicbox_default' },
  basics: { type: DataTypes.JSONB, defaultValue: {} },
  security_sharing: { type: DataTypes.JSONB, defaultValue: {} },
  photo_protection: { type: DataTypes.JSONB, defaultValue: {} },
  social: { type: DataTypes.JSONB, defaultValue: {} },
  selling: { type: DataTypes.JSONB, defaultValue: {} },
  appearance: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'gallery_settings',
  underscored: true,
});

module.exports = GallerySetting;
