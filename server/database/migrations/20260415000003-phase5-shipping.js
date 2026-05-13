'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create ShippingZones table
      await queryInterface.createTable('ShippingZones', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: Sequelize.TEXT,
        countries: {
          type: Sequelize.JSON,
          defaultValue: [],
        },
        states: {
          type: Sequelize.JSON,
          defaultValue: [],
        },
        postal_codes: {
          type: Sequelize.JSON,
          defaultValue: [],
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

      await queryInterface.addIndex('ShippingZones', ['user_id'], {
        name: 'idx_shipping_zones_user_id',
        transaction,
      });

      await queryInterface.addIndex('ShippingZones', ['is_active'], {
        name: 'idx_shipping_zones_active',
        transaction,
      });

      // Create ShippingRates table
      await queryInterface.createTable('ShippingRates', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        zone_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ShippingZones', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        carrier: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        delivery_days_min: Sequelize.INTEGER,
        delivery_days_max: Sequelize.INTEGER,
        base_price_cents: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        additional_item_price_cents: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        weight_min_grams: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        weight_max_grams: {
          type: Sequelize.INTEGER,
          defaultValue: 9999999,
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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

      await queryInterface.addIndex('ShippingRates', ['zone_id'], {
        name: 'idx_shipping_rates_zone_id',
        transaction,
      });

      await queryInterface.addIndex('ShippingRates', ['carrier'], {
        name: 'idx_shipping_rates_carrier',
        transaction,
      });

      await queryInterface.addIndex('ShippingRates', ['is_default'], {
        name: 'idx_shipping_rates_default',
        transaction,
      });

      // Add columns to Orders
      await queryInterface.addColumn('Orders', 'shipping_carrier', {
        type: Sequelize.STRING(100),
      }, { transaction });

      await queryInterface.addColumn('Orders', 'tracking_number', {
        type: Sequelize.STRING(255),
      }, { transaction });

      await queryInterface.addColumn('Orders', 'estimated_delivery', {
        type: Sequelize.DATE,
      }, { transaction });

      await queryInterface.addColumn('Orders', 'shipped_at', {
        type: Sequelize.DATE,
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
      await queryInterface.removeColumn('Orders', 'shipped_at', { transaction });
      await queryInterface.removeColumn('Orders', 'estimated_delivery', { transaction });
      await queryInterface.removeColumn('Orders', 'tracking_number', { transaction });
      await queryInterface.removeColumn('Orders', 'shipping_carrier', { transaction });
      await queryInterface.dropTable('ShippingRates', { transaction });
      await queryInterface.dropTable('ShippingZones', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
