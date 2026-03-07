const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  photo_id: { type: DataTypes.UUID },
  product_id: { type: DataTypes.UUID },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
  unit_price_cents: { type: DataTypes.INTEGER, allowNull: false },
  product_snapshot: { type: DataTypes.JSON },
}, { tableName: 'order_items', underscored: true, updatedAt: false });

module.exports = OrderItem;
