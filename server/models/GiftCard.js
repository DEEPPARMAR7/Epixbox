module.exports = (sequelize, DataTypes) => {
  const GiftCard = sequelize.define(
    'GiftCard',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique gift card code (e.g., "GIFT-ABC123XYZ")',
      },
      balance_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Current balance in cents',
      },
      initial_value_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Original value when created',
      },
      sender_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Who the gift card is from',
      },
      recipient_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Who this gift card is intended for',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Gift message',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Optional expiration date',
      },
      first_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: 'GiftCards',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['code'] },
        { fields: ['is_active'] },
      ],
    }
  );

  GiftCard.associate = (models) => {
    GiftCard.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return GiftCard;
};
