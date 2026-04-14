module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define(
    'ApiKey',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      key_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'SHA256 hash of the API key (key hidden from DB)',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Human-readable name (e.g., "Zapier Integration")',
      },
      scopes: {
        type: DataTypes.JSON,
        defaultValue: ['read:photos', 'read:galleries', 'read:orders'],
        comment: 'Array of allowed scopes/permissions',
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_ip: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Optional expiration date',
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
      tableName: 'ApiKeys',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['is_active'] },
      ],
    }
  );

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return ApiKey;
};
