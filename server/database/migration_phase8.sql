-- Phase 8: Advanced E-Commerce Features Migration
-- Execute with: psql -d your_database -U user -f migration_phase8.sql

CREATE TABLE IF NOT EXISTS "ApiKeys" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  scopes JSONB DEFAULT '["read:photos", "read:galleries", "read:orders"]',
  last_used_at TIMESTAMP,
  last_ip VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON "ApiKeys"(user_id);
CREATE INDEX idx_api_keys_active ON "ApiKeys"(is_active);

CREATE TABLE IF NOT EXISTS "GiftCards" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  balance_cents INTEGER NOT NULL,
  initial_value_cents INTEGER NOT NULL,
  sender_name VARCHAR(255),
  recipient_email VARCHAR(255),
  message TEXT,
  expires_at TIMESTAMP,
  first_used_at TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gift_cards_user_id ON "GiftCards"(user_id);
CREATE INDEX idx_gift_cards_code ON "GiftCards"(code);
CREATE INDEX idx_gift_cards_active ON "GiftCards"(is_active);

CREATE TABLE IF NOT EXISTS "SubscriptionPlans" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  stripe_price_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  billing_period VARCHAR(50) DEFAULT 'monthly',
  trial_days INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_plans_user_id ON "SubscriptionPlans"(user_id);
CREATE INDEX idx_subscription_plans_stripe ON "SubscriptionPlans"(stripe_price_id);

CREATE TABLE IF NOT EXISTS "Subscriptions" (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES "SubscriptionPlans"(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  canceled_at TIMESTAMP,
  cancel_reason TEXT,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_plan_id ON "Subscriptions"(plan_id);
CREATE INDEX idx_subscriptions_stripe ON "Subscriptions"(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON "Subscriptions"(status);

CREATE TABLE IF NOT EXISTS "SavedPaymentMethods" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  card_last_four VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_methods_user_id ON "SavedPaymentMethods"(user_id);
CREATE INDEX idx_payment_methods_stripe ON "SavedPaymentMethods"(stripe_payment_method_id);

CREATE TABLE IF NOT EXISTS "Refunds" (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  stripe_refund_id VARCHAR(255) NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  reason VARCHAR(50) DEFAULT 'other',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_by_user_id INTEGER REFERENCES "Users"(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refunds_order_id ON "Refunds"(order_id);
CREATE INDEX idx_refunds_stripe ON "Refunds"(stripe_refund_id);
CREATE INDEX idx_refunds_status ON "Refunds"(status);

COMMIT;
