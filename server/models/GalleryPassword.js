module.exports = (sequelize, DataTypes) => {
  const GalleryPassword = sequelize.define(
    'GalleryPassword',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      gallery_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Galleries',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Bcrypt hashed password',
      },
      hint: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Optional password hint for clients',
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
      tableName: 'GalleryPasswords',
      timestamps: false,
      indexes: [
        { fields: ['gallery_id'] },
      ],
    }
  );

  GalleryPassword.associate = (models) => {
    GalleryPassword.belongsTo(models.Gallery, {
      foreignKey: 'gallery_id',
      onDelete: 'CASCADE',
    });
  };

  return GalleryPassword;
};
