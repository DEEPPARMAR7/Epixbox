require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}
  }
);

(async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected');

    console.log('Upgrading admin to Pro plan...');
    const [result] = await sequelize.query(
      'UPDATE "users" SET "plan" = :plan WHERE email = :email',
      {
        replacements: { plan: 'pro', email: 'evilsocket19@gmail.com' },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('✓ Admin account upgraded to Pro plan!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
