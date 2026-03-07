const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  parent_id: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  cover_photo_id: { type: DataTypes.UUID, allowNull: true },
  visibility: { type: DataTypes.ENUM('public', 'private', 'unlisted'), defaultValue: 'public' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  photos_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'galleries',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'slug'] }],
});

module.exports = Gallery;
