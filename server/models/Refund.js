module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define(
    'Refund',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stripe_refund_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Stripe Refund ID',
      },
      amount_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Refund amount in cents',
      },
      reason: {
        type: DataTypes.ENUM('requested_by_customer', 'duplicate', 'fraud', 'lost_in_mail', 'other'),
        defaultValue: 'other',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details about the refund',
      },
      status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed'),
        defaultValue: 'pending',
      },
      created_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        comment: 'Which photographer/admin initiated this refund',
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When Stripe confirmed the refund',
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
      tableName: 'Refunds',
      timestamps: false,
      indexes: [
        { fields: ['order_id'] },
        { fields: ['stripe_refund_id'] },
        { fields: ['status'] },
      ],
    }
  );

  Refund.associate = (models) => {
    Refund.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });
    Refund.belongsTo(models.User, {
      foreignKey: 'created_by_user_id',
      as: 'createdByUser',
      allowNull: true,
    });
  };

  return Refund;
};
