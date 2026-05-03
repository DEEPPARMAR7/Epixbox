module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'e.g., "8x10 Matte Print", "16x20 Glossy Canvas", "Full Resolution Digital"',
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Stock keeping unit for inventory tracking',
      },
      price_multiplier: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
        comment: 'Price multiplier relative to base product price (1.0 = same, 1.5 = 50% more)',
      },
      cost_multiplier: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
        comment: 'Cost multiplier for profit calculations',
      },
      specifications: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'JSON: {dimensions: "8x10", finish: "matte", material: "paper"}',
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
      tableName: 'ProductVariants',
      timestamps: false,
      indexes: [
        { fields: ['product_id'] },
        { fields: ['sku'] },
        { fields: ['is_active'] },
      ],
    }
  );

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: 'product_id',
      onDelete: 'CASCADE',
    });
    ProductVariant.hasMany(models.Inventory, {
      foreignKey: 'variant_id',
      onDelete: 'CASCADE',
    });
  };

  return ProductVariant;
};
