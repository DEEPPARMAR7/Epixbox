module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductVariants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      quantity_on_hand: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Current stock level',
      },
      quantity_reserved: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Items reserved for pending orders',
      },
      quantity_available: {
        type: DataTypes.VIRTUAL,
        get() {
          return (this.quantity_on_hand || 0) - (this.quantity_reserved || 0);
        },
        comment: 'Available for purchase (on_hand - reserved)',
      },
      reorder_level: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        comment: 'Alert when stock drops below this level',
      },
      reorder_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        comment: 'Suggest ordering this many units when restocking',
      },
      warehouse_location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Physical storage location (e.g., "Shelf A5", "Bin C2")',
      },
      last_restocked_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      low_stock_notified_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time photographer was notified of low stock',
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
      tableName: 'Inventories',
      timestamps: false,
      indexes: [
        { fields: ['variant_id'] },
        { fields: ['quantity_available'] },
      ],
    }
  );

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.ProductVariant, {
      foreignKey: 'variant_id',
      onDelete: 'CASCADE',
    });
  };

  return Inventory;
};
