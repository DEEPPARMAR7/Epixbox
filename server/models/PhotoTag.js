const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhotoTag = sequelize.define('PhotoTag', {
  photo_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  tag_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
}, {
  tableName: 'photo_tags',
  underscored: true,
  timestamps: false,
});

module.exports = PhotoTag;
