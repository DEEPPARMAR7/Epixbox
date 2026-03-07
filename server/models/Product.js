const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  price_list_id: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.ENUM('print', 'digital', 'canvas', 'metal'), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  width_in: { type: DataTypes.DECIMAL(6, 2) },
  height_in: { type: DataTypes.DECIMAL(6, 2) },
  paper_type: { type: DataTypes.STRING(100) },
  price_cents: { type: DataTypes.INTEGER, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'products', underscored: true });

module.exports = Product;
