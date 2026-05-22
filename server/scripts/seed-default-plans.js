#!/usr/bin/env node
/**
 * Seed script to create default subscription plans
 * Run this once to populate the database with default plans
 * Usage: node scripts/seed-default-plans.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { SubscriptionPlan, User } = require('../models/index');

const stripe = {
  products: {
    create: async function () {
      throw new Error('Stripe integration is disabled in this deployment');
    },
  },
  prices: {
    create: async function () {
      throw new Error('Stripe integration is disabled in this deployment');
    },
  },
};

const DEFAULT_PLANS = [
  {
    name: 'Basic Monthly',
    description: 'Perfect for getting started with subscriptions',
    price_cents: 999, // $9.99
    billing_period: 'monthly',
    trial_days: 14,
    features: {
      monthly_prints: 5,
      rush_processing: false,
      priority_support: false,
    },
  },
  {
    name: 'Plus Monthly',
    description: 'Great for regular orders with extra benefits',
    price_cents: 2499, // $24.99
    billing_period: 'monthly',
    trial_days: 14,
    features: {
      monthly_prints: 20,
      rush_processing: true,
      priority_support: false,
    },
  },
  {
    name: 'Pro Monthly',
    description: 'Best for high-volume customers',
    price_cents: 4999, // $49.99
    billing_period: 'monthly',
    trial_days: 14,
    features: {
      monthly_prints: 100,
      rush_processing: true,
      priority_support: true,
      early_access: true,
    },
  },
  {
    name: 'Annual Pro',
    description: 'Save 20% with annual billing',
    price_cents: 47991, // $479.91 (20% off)
    billing_period: 'yearly',
    trial_days: 14,
    features: {
      monthly_prints: 100,
      rush_processing: true,
      priority_support: true,
      early_access: true,
    },
  },
];

async function seedDefaultPlans() {
  try {
    console.log('Stripe integration removed; skipping Stripe-based seeding.');
    return;

    // Find or create a system/template user for default plans
    let systemUser = await User.findOne({ where: { username: 'system' } });
    
    if (!systemUser) {
      console.log('Creating system user for default plans...');
      systemUser = await User.create({
        username: 'system',
        email: 'system@epixbox.local',
        password_hash: 'N/A', // System user, no password
        brand_name: 'EpixBox System',
        is_active: false, // Inactive system user
      });
      console.log('✓ System user created');
    }

    console.log(`Creating ${DEFAULT_PLANS.length} default subscription plans...`);
    
    for (const planData of DEFAULT_PLANS) {
      // Check if plan already exists
      const existing = await SubscriptionPlan.findOne({
        where: {
          user_id: systemUser.id,
          name: planData.name,
        },
      });

      if (existing) {
        console.log(`  ✓ Plan "${planData.name}" already exists (skipped)`);
        continue;
      }

      const product = { id: null };
      const price = { id: null };

      // Create subscription plan in database
      const plan = await SubscriptionPlan.create({
        user_id: systemUser.id,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        name: planData.name,
        description: planData.description,
        price_cents: planData.price_cents,
        billing_period: planData.billing_period,
        trial_days: planData.trial_days,
        features: planData.features,
        is_active: true,
      });

      console.log(`  ✓ Created plan: "${plan.name}" ($${(plan.price_cents / 100).toFixed(2)}/${planData.billing_period})`);
    }

    console.log('\n✓ Default subscription plans seeded successfully!');
    console.log('\nYou can now browse these plans at: GET /api/subscriptions/browse');
    console.log('Or customize them for your photographers in the dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding plans:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDefaultPlans();
}

module.exports = seedDefaultPlans;
