module.exports = (sequelize, DataTypes) => {
  const SubdomainMapping = sequelize.define(
    'SubdomainMapping',
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
      subdomain: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'The subdomain part (e.g., "john" in "john.epixbox.com")',
      },
      domain: {
        type: DataTypes.STRING(255),
        defaultValue: 'epixbox.com',
        comment: 'Full domain (default epixbox.com or custom domain)',
      },
      ssl_certificate_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Path to SSL cert if using custom domain',
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether DNS/SSL is active',
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
      tableName: 'SubdomainMappings',
      timestamps: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['subdomain'] },
        { fields: ['is_active'] },
      ],
    }
  );

  SubdomainMapping.associate = (models) => {
    SubdomainMapping.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return SubdomainMapping;
};
