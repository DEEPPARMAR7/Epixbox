-- Phase 5: Shipping Integration Migration
-- Execute with: psql -d your_database -U user -f migration_phase5.sql

CREATE TABLE IF NOT EXISTS "ShippingZones" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  countries JSONB DEFAULT '[]',
  states JSONB DEFAULT '[]',
  postal_codes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_zones_user_id ON "ShippingZones"(user_id);
CREATE INDEX idx_shipping_zones_active ON "ShippingZones"(is_active);

CREATE TABLE IF NOT EXISTS "ShippingRates" (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER NOT NULL REFERENCES "ShippingZones"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  carrier VARCHAR(100) NOT NULL,
  delivery_days_min INTEGER,
  delivery_days_max INTEGER,
  base_price_cents INTEGER NOT NULL,
  additional_item_price_cents INTEGER DEFAULT 0,
  weight_min_grams INTEGER DEFAULT 0,
  weight_max_grams INTEGER DEFAULT 9999999,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_rates_zone_id ON "ShippingRates"(zone_id);
CREATE INDEX idx_shipping_rates_carrier ON "ShippingRates"(carrier);
CREATE INDEX idx_shipping_rates_default ON "ShippingRates"(is_default);

-- Add columns to Order if needed
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;

COMMIT;
