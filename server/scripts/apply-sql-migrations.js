require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlFiles = [
  'migration_phase1_3.sql',
  'migration_phase4.sql',
  'migration_phase5.sql',
  'migration_phase7.sql',
  'migration_phase8.sql',
];

async function run() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to DB, applying SQL migration files...');

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, '..', 'database', file);
      if (!fs.existsSync(filePath)) {
        console.warn('Skipping missing file:', filePath);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log('Applying', file);
      await client.query(sql);
      console.log('Applied', file);
    }

    console.log('\nAll SQL migration files applied successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error applying SQL migrations:', err.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

run();
