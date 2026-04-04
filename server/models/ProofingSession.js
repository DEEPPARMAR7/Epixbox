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
  include_subfolders: { type: DataTypes.BOOLEAN, defaultValue: false },
  allow_downloads: { type: DataTypes.BOOLEAN, defaultValue: true },
  download_mode: { type: DataTypes.ENUM('original', 'watermarked'), defaultValue: 'original' },
  max_download_count: { type: DataTypes.INTEGER, allowNull: true },
  download_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_download_at: { type: DataTypes.DATE, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'proofing_sessions', underscored: true });

module.exports = ProofingSession;
