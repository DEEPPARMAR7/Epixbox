require('dotenv').config();
// Run this script with: node make-all-galleries-public.js
// This will set all galleries to public visibility (like SmugMug)

const { Gallery } = require('../models');
const sequelize = require('../config/database');

async function makeAllGalleriesPublic() {
  try {
    await sequelize.authenticate();
    const [count] = await Gallery.update(
      { visibility: 'public' },
      { where: {} }
    );
    console.log(`Updated ${count} galleries to public.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating galleries:', err);
    process.exit(1);
  }
}

makeAllGalleriesPublic();
