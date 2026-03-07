const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProofingSession = sequelize.define('ProofingSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gallery_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false },
  share_token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  client_name: { type: DataTypes.STRING(200) },
  client_email: { type: DataTypes.STRING(255) },
  message: { type: DataTypes.TEXT },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  allow_comments: { type: DataTypes.BOOLEAN, defaultValue: true },
  allow_selections: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'proofing_sessions', underscored: true });

module.exports = ProofingSession;
