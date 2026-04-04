const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProofingDownload = sequelize.define('ProofingDownload', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  session_id: { type: DataTypes.UUID, allowNull: false },
  photo_id: { type: DataTypes.UUID, allowNull: false },
  file_name: { type: DataTypes.STRING(500) },
  mime_type: { type: DataTypes.STRING(120) },
  mode: { type: DataTypes.ENUM('original', 'watermarked'), defaultValue: 'original' },
  ip_address: { type: DataTypes.STRING(64) },
  user_agent: { type: DataTypes.STRING(500) },
}, {
  tableName: 'proofing_downloads',
  underscored: true,
  updatedAt: false,
});

module.exports = ProofingDownload;
