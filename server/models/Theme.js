const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Theme = sequelize.define('Theme', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.ENUM('minimal', 'vibrant', 'dark', 'professional', 'artistic'), allowNull: false },
  preview_image_url: { type: DataTypes.STRING(500) },
  css_variables: { type: DataTypes.JSON }, // {primary, secondary, accent, bg, text, etc}
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'themes',
  underscored: true,
  timestamps: false,
});

module.exports = Theme;
