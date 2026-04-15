'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create ApiKeys table
      await queryInterface.createTable('ApiKeys', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        key_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        scopes: {
          type: Sequelize.JSON,
          defaultValue: ['read:photos', 'read:galleries', 'read:orders'],
        },
        last_used_at: Sequelize.DATE,
        last_ip: Sequelize.STRING(100),
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        expires_at: Sequelize.DATE,
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('ApiKeys', ['user_id'], {
        name: 'idx_api_keys_user_id',
        transaction,
      });

      await queryInterface.addIndex('ApiKeys', ['is_active'], {
        name: 'idx_api_keys_active',
        transaction,
      });

      // Create GiftCards table
      await queryInterface.createTable('GiftCards', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        balance_cents: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        initial_value_cents: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sender_name: Sequelize.STRING(255),
        recipient_email: Sequelize.STRING(255),
        message: Sequelize.TEXT,
        expires_at: Sequelize.DATE,
        first_used_at: Sequelize.DATE,
        last_used_at: Sequelize.DATE,
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

      await queryInterface.addIndex('GiftCards', ['user_id'], {
        name: 'idx_gift_cards_user_id',
        transaction,
      });

      await queryInterface.addIndex('GiftCards', ['code'], {
        name: 'idx_gift_cards_code',
        transaction,
      });

      await queryInterface.addIndex('GiftCards', ['is_active'], {
        name: 'idx_gift_cards_active',
        transaction,
      });

      // Note: SubscriptionPlans and Subscriptions may already exist
      // This only creates them if they don't exist
      const tables = await queryInterface.showAllTables();

      if (!tables.includes('SubscriptionPlans')) {
        await queryInterface.createTable('SubscriptionPlans', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE',
          },
          stripe_price_id: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          description: Sequelize.TEXT,
          price_cents: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          billing_period: {
            type: Sequelize.STRING(50),
            defaultValue: 'monthly',
          },
          trial_days: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          features: {
            type: Sequelize.JSON,
            defaultValue: {},
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

        await queryInterface.addIndex('SubscriptionPlans', ['user_id'], {
          name: 'idx_subscription_plans_user_id',
          transaction,
        });

        await queryInterface.addIndex('SubscriptionPlans', ['stripe_price_id'], {
          name: 'idx_subscription_plans_stripe',
          transaction,
        });
      }

      if (!tables.includes('Subscriptions')) {
        await queryInterface.createTable('Subscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          plan_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'SubscriptionPlans', key: 'id' },
            onDelete: 'CASCADE',
          },
          customer_email: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          stripe_subscription_id: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          stripe_customer_id: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING(50),
            defaultValue: 'active',
          },
          current_period_start: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          current_period_end: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          canceled_at: Sequelize.DATE,
          cancel_reason: Sequelize.TEXT,
          trial_start: Sequelize.DATE,
          trial_end: Sequelize.DATE,
          createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
          },
        }, { transaction });

        await queryInterface.addIndex('Subscriptions', ['plan_id'], {
          name: 'idx_subscriptions_plan_id',
          transaction,
        });

        await queryInterface.addIndex('Subscriptions', ['stripe_subscription_id'], {
          name: 'idx_subscriptions_stripe',
          transaction,
        });

        await queryInterface.addIndex('Subscriptions', ['status'], {
          name: 'idx_subscriptions_status',
          transaction,
        });
      }

      // Create SavedPaymentMethods table
      await queryInterface.createTable('SavedPaymentMethods', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        stripe_payment_method_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        stripe_customer_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        nickname: Sequelize.STRING(255),
        type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        card_last_four: Sequelize.STRING(4),
        card_brand: Sequelize.STRING(50),
        card_exp_month: Sequelize.INTEGER,
        card_exp_year: Sequelize.INTEGER,
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

      await queryInterface.addIndex('SavedPaymentMethods', ['user_id'], {
        name: 'idx_payment_methods_user_id',
        transaction,
      });

      await queryInterface.addIndex('SavedPaymentMethods', ['stripe_payment_method_id'], {
        name: 'idx_payment_methods_stripe',
        transaction,
      });

      // Create Refunds table
      await queryInterface.createTable('Refunds', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Orders', key: 'id' },
          onDelete: 'CASCADE',
        },
        stripe_refund_id: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        amount_cents: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        reason: {
          type: Sequelize.STRING(50),
          defaultValue: 'other',
        },
        notes: Sequelize.TEXT,
        status: {
          type: Sequelize.STRING(50),
          defaultValue: 'pending',
        },
        created_by_user_id: {
          type: Sequelize.INTEGER,
          references: { model: 'Users', key: 'id' },
        },
        processed_at: Sequelize.DATE,
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      await queryInterface.addIndex('Refunds', ['order_id'], {
        name: 'idx_refunds_order_id',
        transaction,
      });

      await queryInterface.addIndex('Refunds', ['stripe_refund_id'], {
        name: 'idx_refunds_stripe',
        transaction,
      });

      await queryInterface.addIndex('Refunds', ['status'], {
        name: 'idx_refunds_status',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Refunds', { transaction });
      await queryInterface.dropTable('SavedPaymentMethods', { transaction });
      await queryInterface.dropTable('Subscriptions', { transaction });
      await queryInterface.dropTable('SubscriptionPlans', { transaction });
      await queryInterface.dropTable('GiftCards', { transaction });
      await queryInterface.dropTable('ApiKeys', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
