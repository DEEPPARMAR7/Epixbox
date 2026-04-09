const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING(100) },
  last_name: { type: DataTypes.STRING(100) },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  bio: { type: DataTypes.TEXT },
  avatar_url: { type: DataTypes.STRING(500) },
  website_url: { type: DataTypes.STRING(500) },
  brand_name: { type: DataTypes.STRING(200) },
  brand_logo_url: { type: DataTypes.STRING(500) },
  brand_color: { type: DataTypes.STRING(7), defaultValue: '#6366f1' },
  stripe_account_id: { type: DataTypes.STRING },
  stripe_customer_id: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('admin', 'photographer', 'client'), defaultValue: 'photographer' },
  plan: { type: DataTypes.ENUM('free', 'pro', 'business'), defaultValue: 'free' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  password_reset_token: { type: DataTypes.STRING },
  password_reset_expires: { type: DataTypes.DATE },
}, {
  tableName: 'users',
  underscored: true,
});

module.exports = User;
