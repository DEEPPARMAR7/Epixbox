require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

console.log('Attempting PG connection to', process.env.DB_HOST, 'on port', process.env.DB_PORT);

client.connect(err => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } else {
    console.log('Connected successfully');
    client.query('SELECT NOW()', (qerr, res) => {
      if (qerr) console.error('Query error:', qerr.message);
      else console.log('Server time:', res.rows[0]);
        // list public tables
        client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public' ORDER BY tablename;", (tErr, tRes) => {
          if (tErr) console.error('List tables error:', tErr.message);
          else console.log('Public tables:', tRes.rows.map(r => r.tablename).join(', '));
          client.end();
          process.exit(0);
        });
    });
  }
});
