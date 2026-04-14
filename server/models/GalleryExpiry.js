module.exports = (sequelize, DataTypes) => {
  const GalleryExpiry = sequelize.define(
    'GalleryExpiry',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gallery_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Galleries',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Gallery becomes inaccessible after this date',
      },
      download_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum downloads before expiry (null = unlimited)',
      },
      downloads_remaining: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Downloads left before expiry',
      },
      send_expiry_reminder_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When to email photographer about upcoming expiry',
      },
      is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: 'GalleryExpiries',
      timestamps: false,
      indexes: [
        { fields: ['gallery_id'] },
        { fields: ['expires_at'] },
      ],
    }
  );

  GalleryExpiry.associate = (models) => {
    GalleryExpiry.belongsTo(models.Gallery, {
      foreignKey: 'gallery_id',
      onDelete: 'CASCADE',
    });
  };

  return GalleryExpiry;
};
