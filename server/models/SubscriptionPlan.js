module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define(
    'SubscriptionPlan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stripe_price_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
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
        type: DataTypes.ENUM('monthly', 'quarterly', 'semi-annual', 'annual'),
        defaultValue: 'monthly',
      },
      trial_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Free trial period in days',
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'JSON: {max_photos: 100, downloads_per_month: 10}',
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
      tableName: 'SubscriptionPlans',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['stripe_price_id'] },
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
