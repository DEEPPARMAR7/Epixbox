'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to SavedPaymentMethods to support multiple payment gateways
    await queryInterface.addColumn('SavedPaymentMethods', 'gateway_type', {
      type: Sequelize.ENUM('stripe', 'paypal', 'apple_pay', 'google_pay'),
      allowNull: false,
      defaultValue: 'stripe',
      comment: 'Payment gateway provider',
    });

    await queryInterface.addColumn('SavedPaymentMethods', 'gateway_customer_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Gateway-specific customer ID',
    });

    await queryInterface.addColumn('SavedPaymentMethods', 'gateway_payment_method_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Gateway-specific payment method ID',
    });

    // Make stripe_payment_method_id nullable (since not all gateways use it)
    await queryInterface.changeColumn('SavedPaymentMethods', 'stripe_payment_method_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: false, // Remove unique constraint to allow other gateways
    });

    // Make stripe_customer_id nullable
    await queryInterface.changeColumn('SavedPaymentMethods', 'stripe_customer_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // Add index for new gateway columns
    await queryInterface.addIndex('SavedPaymentMethods', ['gateway_type', 'user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('SavedPaymentMethods', ['gateway_type', 'user_id']);
    await queryInterface.removeColumn('SavedPaymentMethods', 'gateway_type');
    await queryInterface.removeColumn('SavedPaymentMethods', 'gateway_customer_id');
    await queryInterface.removeColumn('SavedPaymentMethods', 'gateway_payment_method_id');

    // Restore constraints
    await queryInterface.changeColumn('SavedPaymentMethods', 'stripe_payment_method_id', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('SavedPaymentMethods', 'stripe_customer_id', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
