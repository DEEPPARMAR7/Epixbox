const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  buyer_email: { type: DataTypes.STRING, allowNull: false },
  buyer_name: { type: DataTypes.STRING(200) },
  photographer_id: { type: DataTypes.UUID, allowNull: false },
  stripe_payment_intent_id: { type: DataTypes.STRING, unique: true },
  stripe_charge_id: { type: DataTypes.STRING },
  paypal_order_id: { type: DataTypes.STRING, unique: true },
  paypal_transaction_id: { type: DataTypes.STRING },
  payment_gateway: { type: DataTypes.ENUM('stripe', 'paypal'), defaultValue: 'paypal' },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'cancelled'),
    defaultValue: 'pending',
  },
  subtotal_cents: { type: DataTypes.INTEGER },
  tax_cents: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_cents: { type: DataTypes.INTEGER },
  shipping_address: { type: DataTypes.JSON },
  shipping_carrier: { type: DataTypes.STRING(100) },
  tracking_number: { type: DataTypes.STRING(255) },
  estimated_delivery: { type: DataTypes.DATE },
  shipped_at: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'orders', underscored: true });

module.exports = Order;
