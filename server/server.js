require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models/index');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  // Ping DB every 4 minutes to prevent Neon free-tier auto-suspend
  setInterval(() => {
    sequelize.query('SELECT 1').catch(() => {});
  }, 4 * 60 * 1000);
});
