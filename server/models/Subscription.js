module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    'Subscription',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      photographer_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      customer_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Customer email address',
      },
      stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Stripe Subscription ID',
      },
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Stripe Customer ID',
      },
      status: {
        type: DataTypes.ENUM('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'),
        defaultValue: 'incomplete',
      },
      current_period_start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      current_period_end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      canceled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancel_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      canceled_at_period_end: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      trial_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trial_end: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      latest_invoice_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: 'subscriptions',
      underscored: true,
      indexes: [
        { fields: ['plan_id'] },
        { fields: ['photographer_user_id'] },
        { fields: ['stripe_subscription_id'] },
        { fields: ['customer_email'] },
        { fields: ['status'] },
      ],
    }
  );

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'plan_id',
      onDelete: 'CASCADE',
    });
  };

  return Subscription;
};
