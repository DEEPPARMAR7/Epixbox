module.exports = (sequelize, DataTypes) => {
  const SavedPaymentMethod = sequelize.define(
    'SavedPaymentMethod',
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
      stripe_payment_method_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Stripe Payment Method ID',
      },
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Stripe Customer ID',
      },
      nickname: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'User-friendly name (e.g., "My Visa")',
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'card, bank_account, etc.',
      },
      card_last_four: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      card_brand: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'visa, mastercard, amex, etc.',
      },
      card_exp_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      card_exp_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Use this method by default for recurring charges',
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
      tableName: 'SavedPaymentMethods',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['stripe_payment_method_id'] },
      ],
    }
  );

  SavedPaymentMethod.associate = (models) => {
    SavedPaymentMethod.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return SavedPaymentMethod;
};
