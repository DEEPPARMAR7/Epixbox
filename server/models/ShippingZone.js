module.exports = (sequelize, DataTypes) => {
  const ShippingZone = sequelize.define(
    'ShippingZone',
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'e.g., "Continental US", "Hawaii", "International"',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      countries: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of country codes (e.g., ["US", "CA", "MX"])',
      },
      states: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of US state codes if applicable',
      },
      postal_codes: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Optional postal code ranges',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: 'ShippingZones',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['is_active'] },
      ],
    }
  );

  ShippingZone.associate = (models) => {
    ShippingZone.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
    ShippingZone.hasMany(models.ShippingRate, {
      foreignKey: 'zone_id',
      onDelete: 'CASCADE',
    });
  };

  return ShippingZone;
};
