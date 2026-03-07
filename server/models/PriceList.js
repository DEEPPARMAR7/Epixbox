const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceList = sequelize.define('PriceList', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'price_lists', underscored: true });

module.exports = PriceList;
