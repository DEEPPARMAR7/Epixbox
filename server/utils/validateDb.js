/**
 * Database Validation Script
 * Ensures all migrations have been applied before server starts
 */

const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Check if migrations table exists and all pending migrations are applied
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function validateDatabaseMigrations() {
  try {
    // Check if SequelizeMeta table exists (tracks applied migrations)
    const tables = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SequelizeMeta'`,
      { type: QueryTypes.SELECT }
    );

    if (tables.length === 0) {
      return {
        valid: false,
        message: 'SequelizeMeta table not found. Run migrations with: npm run db:migrate',
      };
    }

    // Get list of applied migrations
    const appliedMigrations = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name',
      { type: QueryTypes.SELECT }
    );

    if (appliedMigrations.length === 0) {
      return {
        valid: false,
        message: 'No migrations have been applied. Run migrations with: npm run db:migrate',
      };
    }

    // Log migration status for debugging
    console.log(`✓ Database migrations: ${appliedMigrations.length} applied`);
    console.log(`  Latest migration: ${appliedMigrations[appliedMigrations.length - 1].name}`);

    // Compare filesystem migrations against applied migrations to detect pending files.
    const migrationDir = path.join(__dirname, '..', 'database', 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationDir)
      .filter((name) => /\.js$/i.test(name))
      .sort();
    const appliedNames = new Set(appliedMigrations.map((m) => m.name));
    const pending = migrationFiles.filter((name) => !appliedNames.has(name));

    if (pending.length > 0) {
      return {
        valid: false,
        message: `Pending migrations detected: ${pending.join(', ')}. Run migrations with: npm run db:migrate`,
      };
    }

    return {
      valid: true,
      message: `Database is up to date. ${appliedMigrations.length} migrations applied.`,
    };
  } catch (error) {
    return {
      valid: false,
      message: `Database validation failed: ${error.message}`,
      error,
    };
  }
}

/**
 * Check if all required environment variables are set
 * @returns {{valid: boolean, missing: string[]}}
 */
function validateEnvironmentVariables() {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

  const optional = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  const missing = [];
  const warnings = [];

  // Check required vars
  required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Accept either DATABASE_URL or DB_* credentials.
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasDbParts = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].every((key) => Boolean(process.env[key]));
  if (!hasDatabaseUrl && !hasDbParts) {
    missing.push('DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD');
  }

  // Check optional vars and warn
  optional.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`${varName} (optional)`);
    }
  });

  if (warnings.length > 0) {
    console.warn(`⚠ Missing optional environment variables: ${warnings.join(', ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate all startup checks
 * @returns {Promise<boolean>} - true if all checks pass
 */
async function validateAllStartupChecks() {
  console.log('\n📋 Running database startup validation...\n');

  // Check environment variables
  const envValidation = validateEnvironmentVariables();
  if (!envValidation.valid) {
    console.error('❌ Missing required environment variables:');
    envValidation.missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    return false;
  }
  console.log('✓ All required environment variables are set');

  // Check database migrations. If AUTO_MIGRATE is enabled, allow startup to continue
  // when migrations are pending so server.js can run migrations immediately after connect.
  const dbValidation = await validateDatabaseMigrations();
  if (!dbValidation.valid) {
    if (process.env.AUTO_MIGRATE !== 'false') {
      console.warn(`⚠ ${dbValidation.message}`);
      console.warn('⚠ AUTO_MIGRATE is enabled, server will attempt migrations on startup.');
      return true; // Allow startup to continue - server.js will run migrations
    } else {
      console.error(`❌ ${dbValidation.message}`);
      return false;
    }
  }
  if (dbValidation.valid) {
    console.log(`✓ ${dbValidation.message}`);
  }

  console.log('\n✅ All startup checks passed!\n');
  return true;
}

module.exports = {
  validateDatabaseMigrations,
  validateEnvironmentVariables,
  validateAllStartupChecks,
};
