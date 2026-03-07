const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomDomain = sequelize.define('CustomDomain', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  domain: { type: DataTypes.STRING, allowNull: false, unique: true },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verification_token: { type: DataTypes.STRING(64) },
  ssl_provisioned: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'custom_domains', underscored: true });

module.exports = CustomDomain;
