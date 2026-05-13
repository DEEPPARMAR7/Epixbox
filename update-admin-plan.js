const sequelize = require('./server/config/database');

console.log('Starting update...');

(async () => {
  try {
    console.log('Connected to database');
    const result = await sequelize.query(
      'UPDATE "users" SET "plan" = :plan WHERE email = :email',
      {
        replacements: { plan: 'pro', email: 'evilsocket19@gmail.com' },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    console.log('✓ Admin account upgraded to Pro plan');
    console.log('Rows updated:', result);
    await sequelize.close();
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Full error:', e);
    process.exit(1);
  }
})();
