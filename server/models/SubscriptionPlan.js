module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define(
    'SubscriptionPlan',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      stripe_product_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stripe_price_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Stripe Price ID for this plan',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'e.g., "Monthly Print Service", "Quarterly Digital Package"',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Price per billing period in cents',
      },
      billing_period: {
        type: DataTypes.ENUM('monthly', 'yearly'),
        defaultValue: 'monthly',
      },
      trial_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Free trial period in days',
      },
      features: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: 'JSON feature flags and limits for this plan',
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
      tableName: 'subscription_plans',
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['stripe_price_id'] },
        { fields: ['is_active'] },
      ],
    }
  );

  SubscriptionPlan.associate = (models) => {
    SubscriptionPlan.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
    SubscriptionPlan.hasMany(models.Subscription, {
      foreignKey: 'plan_id',
      onDelete: 'CASCADE',
    });
  };

  return SubscriptionPlan;
};
