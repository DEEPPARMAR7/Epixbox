const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProofingSelection = sequelize.define('ProofingSelection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  session_id: { type: DataTypes.UUID, allowNull: false },
  photo_id: { type: DataTypes.UUID, allowNull: false },
  star_rating: { type: DataTypes.SMALLINT, defaultValue: 0, validate: { min: 0, max: 5 } },
  rating_reason: { type: DataTypes.TEXT }, // Why the rating was given
  is_selected: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'proofing_selections',
  underscored: true,
  indexes: [{ unique: true, fields: ['session_id', 'photo_id'] }],
});

module.exports = ProofingSelection;
