# PHASE 1-3 DEPLOYMENT GUIDE

## PRE-DEPLOYMENT CHECKLIST

### 1. Database Migrations
Run these SQL commands to create new tables/columns:

```sql
-- Create watermark_templates table
CREATE TABLE watermark_templates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(20),
  opacity FLOAT DEFAULT 0.5,
  size_percentage FLOAT DEFAULT 20,
  font_family VARCHAR(50),
  text VARCHAR(200),
  image_url_s3 VARCHAR(500),
  rotation FLOAT DEFAULT -45,
  color VARCHAR(7) DEFAULT '#FFFFFF',
  is_text_watermark BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add 2FA columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_backup_codes JSON;

-- Add edit history to photos
ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_s3_key VARCHAR(500);
ALTER TABLE photos ADD COLUMN IF NOT EXISTS edit_history JSON;

-- Add rating reason to proofing_selections
ALTER TABLE proofing_selections ADD COLUMN IF NOT EXISTS rating_reason TEXT;

-- Create themes table
CREATE TABLE themes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  preview_image_url VARCHAR(500),
  css_variables JSON,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create search indexes for performance
ALTER TABLE photos ADD INDEX idx_exif_make (exif_make);
ALTER TABLE photos ADD INDEX idx_exif_iso (exif_iso);
ALTER TABLE photos ADD INDEX idx_exif_aperture (exif_aperture);
ALTER TABLE photos ADD INDEX idx_created_at (created_at DESC);
ALTER TABLE photos ADD FULLTEXT INDEX ft_title (title);
```

### 2. Environment Variables
Check you have these in `.env`:

```
# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=epixbox-photos
AWS_REGION=us-east-1

# Database
DATABASE_URL=postgresql://user:pass@localhost/epixbox

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# 2FA (for speakeasy)
TOTP_WINDOW=2

# Email (for 2FA notifications)
EMAIL_FROM=noreply@epixbox.com
SMTP_HOST=xxx
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Stripe (for future payments)
STRIPE_SECRET_KEY=sk_test_xxx
```

### 3. Install New Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

---

## TESTING CHECKLIST

### PHASE 1: WATERMARKING
- [ ] Create watermark template in UI
- [ ] Edit existing template
- [ ] Delete template
- [ ] Apply watermark to single photo
- [ ] Apply watermark to multiple photos
- [ ] Verify watermarked photos visible in gallery

### PHASE 1: PHOTO EDITING
- [ ] Crop a photo and verify result
- [ ] Rotate photo (90°, 180°, 270°)
- [ ] Adjust brightness/contrast
- [ ] Verify edit history stored
- [ ] Undo last edit and restore original

### PHASE 1: 2FA
- [ ] Enable 2FA (scan QR code with authenticator)
- [ ] Login and verify TOTP challenge appears
- [ ] Enter correct TOTP token to complete login
- [ ] Use backup code to login
- [ ] Disable 2FA with password
- [ ] Verify 2FA disappears next login

### PHASE 1: ADVANCED SEARCH
- [ ] Search by text (keyword)
- [ ] Filter by camera (EXIF)
- [ ] Filter by ISO
- [ ] Filter by date range
- [ ] Sort results (newest, oldest, A-Z)
- [ ] Combine multiple filters
- [ ] Verify pagination works

### PHASE 2: THEMES
- [ ] View all available themes
- [ ] Apply theme to gallery
- [ ] Change to different theme
- [ ] Preview theme live on portfolio page
- [ ] Custom CSS overrides theme

### PHASE 2: GALLERY LAYOUTS
- [ ] Switch to Grid layout
- [ ] Switch to Slideshow (prev/next buttons work)
- [ ] Switch to Thumbnail layout (expand works)
- [ ] Verify layout persists on reload

### PHASE 2: DARK MODE
- [ ] Click dark mode toggle in navbar
- [ ] Verify all pages go dark
- [ ] Verify light mode toggle works
- [ ] Check preference persists on reload

### PHASE 3: RATINGS (Basic)
- [ ] Rate a photo in proofing session
- [ ] Add rating reason note
- [ ] Verify rating saved
- [ ] View ratings summary

### PHASE 3: SOCIAL SHARING
- [ ] Click Share button on gallery
- [ ] Copy gallery link
- [ ] Copy embed code
- [ ] Share to Facebook (opens new window)
- [ ] Share to Twitter
- [ ] Share to LinkedIn
- [ ] Share via Email

### PHASE 3: BATCH OPERATIONS
- [ ] Select multiple photos (checkbox)
- [ ] Batch delete with confirmation
- [ ] Batch download creates ZIP
- [ ] Multi-select toolbar appears

---

## DEPLOYMENT STEPS

### 1. Staging Deployment

**AWS EC2:**
```bash
# SSH into staging server
ssh -i key.pem ubuntu@staging.epixbox.com

# Pull latest code
cd /app && git pull origin main

# Install dependencies
npm run install:all

# Run migrations
npm run db:migrate

# Build frontend
npm run build --workspace=client

# Start server with PM2
pm2 restart epixbox
```

**Using Docker:**
```bash
# Build image
docker build -t epixbox:latest .

# Push to registry
docker push your-registry/epixbox:latest

# Deploy with docker-compose
docker-compose pull && docker-compose up -d
```

### 2. Smoke Tests (Automated)
```bash
# After deployment,run smoke tests
curl -X GET https://staging.epixbox.com/api/v1/health
curl -X POST https://staging.epixbox.com/api/v1/themes
```

### 3. Manual Testing
- [ ] Open https://staging.epixbox.com
- [ ] Create account
- [ ] Upload photos
- [ ] Test each Phase 1-3 feature (see checklist above)
- [ ] Test mobile responsiveness
- [ ] Check browser console for errors

### 4. Rollback Plan
If issues found:
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Redeploy
docker-compose pull && docker-compose up -d

# Or with PM2
pm2 restart epixbox
```

---

## PERFORMANCE BASELINE (To Track)

Before Production, measure:
```bash
# Page load time (should be <2s)
curl -w "@curl-format.txt" https://staging.epixbox.com

# Database query performance
EXPLAIN ANALYZE SELECT * FROM photos WHERE user_id = '...' AND exif_iso = 400;

# S3 API latency (should be <500ms)
time aws s3 ls s3://epixbox-photos

# Image processing time (watermark)
# Should be <3s for 3000x2000px image
```

---

## POST-DEPLOYMENT MONITOR

### Logs to Watch
```bash
# Server logs
pm2 logs epixbox

# Database logs
tail -f /var/log/postgresql/postgresql.log

# Application errors (Sentry)
# Check https://sentry.io/organizations/epixbox
```

### Metrics to Track
- [ ] API response times < 200ms
- [ ] Database queries < 100ms
- [ ] Image processing < 3s
- [ ] No critical errors in Sentry
- [ ] Server CPU < 60%
- [ ] Server memory < 70%

---

## NEXT STEPS AFTER TESTING

1. **If tests pass:** Deploy to production (will provide prod checklist)
2. **If tests fail:** Fix issues, re-test staging
3. **Release notes:** Document Phase 1-3 features for users
4. **Start Phase 4:** Begin E-commerce features (shipping, variants)

---

## SUPPORT

Issues during deployment?

1. Check logs: `pm2 logs epixbox`
2. Verify migrations: `npm run db:migrate:status`
3. Test API: `curl http://localhost:4000/api/v1/themes`
4. Check database: `psql -U postgres -d epixbox -c "SELECT * FROM users LIMIT 1;"`

**Critical Issues:**
- Database connection → Check DATABASE_URL in .env
- S3 errors → Check AWS credentials & bucket permissions
- Port conflicts → Check if 4000/5173 already in use

