require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const path = require('path');
const { execSync } = require('child_process');
const app = require('./app');
const { sequelize } = require('./models/index');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

async function runMigrations() {
  try {
    console.log('Checking for pending database migrations...');
    // Run pending migrations using sequelize-cli
    execSync('npx sequelize-cli db:migrate', {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✓ Database migrations completed successfully');
  } catch (err) {
    console.error('⚠ Migration error (non-blocking):', err.message);
    // Non-blocking error - server will still start
    // This allows for graceful degradation if migrations fail
  }
}

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Run migrations if auto-migrate is enabled (default: true)
    if (process.env.AUTO_MIGRATE !== 'false') {
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
