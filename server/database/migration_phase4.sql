-- Phase 4: Product Variants & Inventory Migration
-- Execute with: psql -d your_database -U user -f migration_phase4.sql

CREATE TABLE IF NOT EXISTS "ProductVariants" (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES "Products"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price_multiplier FLOAT DEFAULT 1.0,
  cost_multiplier FLOAT DEFAULT 1.0,
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_product_id ON "ProductVariants"(product_id);
CREATE INDEX idx_product_variants_sku ON "ProductVariants"(sku);

CREATE TABLE IF NOT EXISTS "Inventories" (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES "ProductVariants"(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  reorder_quantity INTEGER DEFAULT 10,
  warehouse_location VARCHAR(255),
  last_restocked_at TIMESTAMP,
  low_stock_notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_variant_id ON "Inventories"(variant_id);
CREATE INDEX idx_inventory_quantity_available ON "Inventories"(quantity_on_hand, quantity_reserved);

-- Add columns to Product if they don't exist
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS category VARCHAR(50);

COMMIT;
