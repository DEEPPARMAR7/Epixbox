require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const path = require('path');
const { execSync } = require('child_process');
const app = require('./app');
const { sequelize } = require('./models/index');
const { initSocket } = require('./socket');
const { validateAllStartupChecks } = require('./utils/validateDb');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

async function runMigrations() {
  try {
    console.log('Checking for pending database migrations...');
    // Run pending migrations using sequelize-cli
    const output = execSync('npx sequelize-cli db:migrate', {
      cwd: __dirname,
      env: { ...process.env, DEBUG: 'sequelize:*' },
      encoding: 'utf-8',
    });
    console.log('Migration output:', output);
    console.log('✓ Database migrations completed successfully');
  } catch (err) {
    console.error('⚠ Migration error (non-blocking):', err.message);
    console.error('Migration stderr:', err.stderr?.toString());
    console.error('Migration stdout:', err.stdout?.toString());
    // Non-blocking error - server will still start
    // This allows for graceful degradation if migrations fail
  }
}

async function startServer() {
  try {
    // Validate environment variables
    const startupValid = await validateAllStartupChecks();
    if (!startupValid) {
      console.error('❌ Server startup validation failed. Exiting.');
      process.exit(1);
    }

    // Test database connection (non-blocking on timeout)
    try {
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 10000))
      ]);
      console.log('✓ Database connection established');
    } catch (dbErr) {
      console.warn('⚠ Database connection delayed - starting server anyway. Requests will fail until DB is ready.');
      console.warn('  Error:', dbErr.message);
    }

    // Run migrations if auto-migrate is enabled (default: true)
    const autoMigrate = process.env.AUTO_MIGRATE !== 'false'; // Default is TRUE
    if (autoMigrate) {
      await runMigrations();
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      // Ping DB every 4 minutes to prevent Neon free-tier auto-suspend
      setInterval(() => {
        sequelize.query('SELECT 1').catch(() => {});
      }, 4 * 60 * 1000);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
