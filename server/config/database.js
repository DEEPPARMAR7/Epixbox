const { Sequelize } = require('sequelize');

const baseConfig = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions:
    process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseConfig)
  : new Sequelize(
      process.env.DB_NAME || 'photoapp_dev',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
      }
    );

module.exports = sequelize;
