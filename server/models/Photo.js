const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Photo = sequelize.define('Photo', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gallery_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  filename_original: { type: DataTypes.STRING(500), allowNull: false },
  s3_key_original: { type: DataTypes.STRING(500), allowNull: false },
  s3_key_large: { type: DataTypes.STRING(500) },
  s3_key_medium: { type: DataTypes.STRING(500) },
  s3_key_thumb: { type: DataTypes.STRING(500) },
  width: { type: DataTypes.INTEGER },
  height: { type: DataTypes.INTEGER },
  file_size_bytes: { type: DataTypes.BIGINT },
  mime_type: { type: DataTypes.STRING(100) },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  exif_make: { type: DataTypes.STRING(100) },
  exif_model: { type: DataTypes.STRING(100) },
  exif_lens: { type: DataTypes.STRING(200) },
  exif_focal_length: { type: DataTypes.STRING(50) },
  exif_aperture: { type: DataTypes.STRING(20) },
  exif_shutter_speed: { type: DataTypes.STRING(20) },
  exif_iso: { type: DataTypes.INTEGER },
  exif_taken_at: { type: DataTypes.DATE },
  exif_gps_lat: { type: DataTypes.DECIMAL(9, 6) },
  exif_gps_lng: { type: DataTypes.DECIMAL(9, 6) },
  original_s3_key: { type: DataTypes.STRING(500) }, // Stores original if edited
  edit_history: { type: DataTypes.JSON }, // Array of edits: {type: 'crop'|'rotate'|'adjust', params, applied_at}
}, {
  tableName: 'photos',
  underscored: true,
});

module.exports = Photo;
