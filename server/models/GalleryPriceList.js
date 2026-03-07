const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GalleryPriceList = sequelize.define('GalleryPriceList', {
  gallery_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  price_list_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
}, { tableName: 'gallery_price_lists', underscored: true, timestamps: false });

module.exports = GalleryPriceList;
