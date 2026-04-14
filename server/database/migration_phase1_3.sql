-- ============================================
-- EpixBox Database Migration - Phase 1-3
-- Apply this to your staging/production database
-- ============================================

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Add 2FA columns to Users table
ALTER TABLE "Users"
ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "two_fa_secret" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "two_fa_backup_codes" TEXT;

-- Add photo editing tracking to Photos table
ALTER TABLE "Photos"
ADD COLUMN IF NOT EXISTS "original_s3_key" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "edit_history" JSONB DEFAULT '[]';

-- Add rating_reason to ProofingSelections for detailed feedback
ALTER TABLE "ProofingSelections"
ADD COLUMN IF NOT EXISTS "rating_reason" TEXT;

-- ============================================
-- CREATE NEW TABLES
-- ============================================

-- Watermark Templates table
CREATE TABLE IF NOT EXISTS "WatermarkTemplates" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50), -- 'text', 'image', 'both'
  "position" VARCHAR(50), -- 'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
  "opacity" FLOAT DEFAULT 0.7 CHECK("opacity" >= 0 AND "opacity" <= 1),
  "size_percentage" INTEGER DEFAULT 20 CHECK("size_percentage" > 0 AND "size_percentage" <= 100),
  "font_family" VARCHAR(100) DEFAULT 'Arial',
  "text_content" TEXT,
  "image_s3_key" VARCHAR(500),
  "color" VARCHAR(7) DEFAULT '#FFFFFF',
  "font_size" INTEGER DEFAULT 24,
  "rotation" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE("user_id", "name")
);

-- Themes table (pre-built and custom)
CREATE TABLE IF NOT EXISTS "Themes" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "category" VARCHAR(50), -- 'light', 'dark', 'vibrant', 'professional', 'artistic'
  "is_builtin" BOOLEAN DEFAULT FALSE,
  "css_variables" JSONB,
  "preview_image_url" VARCHAR(500),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Coupons table
CREATE TABLE IF NOT EXISTS "Coupons" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(50) UNIQUE NOT NULL,
  "discount_type" VARCHAR(20), -- 'percentage', 'fixed'
  "discount_value" DECIMAL(10,2) NOT NULL,
  "max_uses" INTEGER DEFAULT 999,
  "used_count" INTEGER DEFAULT 0,
  "expires_at" TIMESTAMP,
  "apply_to" VARCHAR(50), -- 'all_products', 'prints', 'canvas', 'mugs'
  "gallery_ids" JSONB, -- JSON array of gallery IDs
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_watermark_templates_user_id" ON "WatermarkTemplates"("user_id");
CREATE INDEX IF NOT EXISTS "idx_photos_camera" ON "Photos"("exif_make");
CREATE INDEX IF NOT EXISTS "idx_photos_lens" ON "Photos"("exif_model");
CREATE INDEX IF NOT EXISTS "idx_photos_iso" ON "Photos"("exif_iso");
CREATE INDEX IF NOT EXISTS "idx_photos_aperture" ON "Photos"("exif_aperture");
CREATE INDEX IF NOT EXISTS "idx_photos_focal_length" ON "Photos"("exif_focal_length");
CREATE INDEX IF NOT EXISTS "idx_photos_created_at" ON "Photos"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "Coupons"("code");
CREATE INDEX IF NOT EXISTS "idx_coupons_active" ON "Coupons"("is_active");
CREATE INDEX IF NOT EXISTS "idx_themes_name" ON "Themes"("name");

-- ============================================
-- INSERT PRE-BUILT THEMES
-- ============================================

INSERT INTO "Themes" (name, category, is_builtin, css_variables) VALUES
('Minimal Light', 'light', TRUE, '{"primary": "#000000", "secondary": "#666666", "background": "#FFFFFF", "accent": "#CCCCCC"}'),
('Dark Elegance', 'dark', TRUE, '{"primary": "#FFFFFF", "secondary": "#BBBBBB", "background": "#1a1a1a", "accent": "#333333"}'),
('Bold Vibrant', 'vibrant', TRUE, '{"primary": "#FF6B6B", "secondary": "#4ECDC4", "background": "#FFFFFF", "accent": "#FFE66D"}'),
('Professional', 'professional', TRUE, '{"primary": "#003D7A", "secondary": "#666666", "background": "#F5F5F5", "accent": "#0066CC"}'),
('Artistic', 'artistic', TRUE, '{"primary": "#8B4789", "secondary": "#D4A5A5", "background": "#F9F7F4", "accent": "#E0B0B0"}')
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Run this with: psql -d your_database_name -f migration.sql
