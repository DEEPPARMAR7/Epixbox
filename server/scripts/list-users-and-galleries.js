// Usage: node scripts/list-users-and-galleries.js
// Prints all users and their public galleries
require('dotenv').config();
const { User, Gallery } = require('../models');
const sequelize = require('../config/database');

async function main() {
  await sequelize.authenticate();
  const users = await User.findAll();
  for (const user of users) {
    console.log(`User: ${user.username} (id: ${user.id})`);
    const galleries = await Gallery.findAll({
      where: { user_id: user.id, visibility: 'public' },
    });
    if (galleries.length === 0) {
      console.log('  No public galleries');
    } else {
      for (const g of galleries) {
        console.log(`  Gallery: ${g.title} (slug: ${g.slug})`);
      }
    }
  }
  await sequelize.close();
}

main().catch(e => { console.error(e); process.exit(1); });
