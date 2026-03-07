const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProofingComment = sequelize.define('ProofingComment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  session_id: { type: DataTypes.UUID, allowNull: false },
  photo_id: { type: DataTypes.UUID, allowNull: false },
  author_name: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  is_photographer: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'proofing_comments', underscored: true, updatedAt: false });

module.exports = ProofingComment;
