'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create ProductVariants table
      await queryInterface.createTable('ProductVariants', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Products', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        sku: {
          type: Sequelize.STRING(100),
          unique: true,
        },
        price_multiplier: {
          type: Sequelize.FLOAT,
          defaultValue: 1.0,
        },
        cost_multiplier: {
          type: Sequelize.FLOAT,
          defaultValue: 1.0,
        },
        specifications: {
          type: Sequelize.JSON,
          defaultValue: {},
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        sort_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('ProductVariants', ['product_id'], {
        name: 'idx_product_variants_product_id',
        transaction,
      });

      await queryInterface.addIndex('ProductVariants', ['sku'], {
        name: 'idx_product_variants_sku',
        transaction,
      });

      // Create Inventories table
      await queryInterface.createTable('Inventories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        variant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ProductVariants', key: 'id' },
          onDelete: 'CASCADE',
        },
        quantity_on_hand: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        quantity_reserved: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        reorder_level: {
          type: Sequelize.INTEGER,
          defaultValue: 5,
        },
        reorder_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 10,
        },
        warehouse_location: Sequelize.STRING(255),
        last_restocked_at: Sequelize.DATE,
        low_stock_notified_at: Sequelize.DATE,
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('Inventories', ['variant_id'], {
        name: 'idx_inventory_variant_id',
        transaction,
      });

      // Add category column to Products
      await queryInterface.addColumn('Products', 'category', {
        type: Sequelize.STRING(50),
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Inventories', { transaction });
      await queryInterface.dropTable('ProductVariants', { transaction });
      await queryInterface.removeColumn('Products', 'category', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
