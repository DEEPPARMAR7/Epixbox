module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    'Subscription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'SubscriptionPlans',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
        type: DataTypes.ENUM('active', 'past_due', 'canceled', 'unpaid', 'trialing'),
        defaultValue: 'active',
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
      trial_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trial_end: {
        type: DataTypes.DATE,
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
      tableName: 'Subscriptions',
      timestamps: false,
      indexes: [
        { fields: ['plan_id'] },
        { fields: ['stripe_subscription_id'] },
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
