-- Phase 7: Advanced Portfolio Features Migration
-- Execute with: psql -d your_database -U user -f migration_phase7.sql

CREATE TABLE IF NOT EXISTS "SubdomainMappings" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  subdomain VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) DEFAULT 'epixbox.com',
  ssl_certificate_path VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subdomains_user_id ON "SubdomainMappings"(user_id);
CREATE INDEX idx_subdomains_subdomain ON "SubdomainMappings"(subdomain);
CREATE INDEX idx_subdomains_active ON "SubdomainMappings"(is_active);

CREATE TABLE IF NOT EXISTS "GalleryPasswords" (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER NOT NULL UNIQUE REFERENCES "Galleries"(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  hint VARCHAR(255),
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_passwords_gallery_id ON "GalleryPasswords"(gallery_id);

CREATE TABLE IF NOT EXISTS "GalleryExpiries" (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER NOT NULL UNIQUE REFERENCES "Galleries"(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  download_limit INTEGER,
  downloads_remaining INTEGER,
  send_expiry_reminder_at TIMESTAMP,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_expiries_gallery_id ON "GalleryExpiries"(gallery_id);
CREATE INDEX idx_gallery_expiries_expires_at ON "GalleryExpiries"(expires_at);

COMMIT;
