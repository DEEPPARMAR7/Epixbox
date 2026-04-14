module.exports = (sequelize, DataTypes) => {
  const ShippingRate = sequelize.define(
    'ShippingRate',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ShippingZones',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'e.g., "Standard Ground", "Express 2 Day", "Overnight"',
      },
      carrier: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'USPS, UPS, FedEx, DHL, Custom',
      },
      delivery_days_min: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Estimated minimum delivery days',
      },
      delivery_days_max: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Estimated maximum delivery days',
      },
      base_price_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Price in cents for first unit/item',
      },
      additional_item_price_cents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Added price for each additional item',
      },
      weight_min_grams: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Minimum weight for this rate',
      },
      weight_max_grams: {
        type: DataTypes.INTEGER,
        defaultValue: 9999999,
        comment: 'Maximum weight for this rate (use large number for unlimited)',
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Use this rate if no other matches',
      },
      is_active: {
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
      tableName: 'ShippingRates',
      timestamps: false,
      indexes: [
        { fields: ['zone_id'] },
        { fields: ['carrier'] },
        { fields: ['is_default'] },
      ],
    }
  );

  ShippingRate.associate = (models) => {
    ShippingRate.belongsTo(models.ShippingZone, {
      foreignKey: 'zone_id',
      onDelete: 'CASCADE',
    });
  };

  return ShippingRate;
};
