# PHASE 1 IMPLEMENTATION GUIDE - EpixBox

## What's Done ✅
1. **Models**: WatermarkTemplate, User (2FA), Photo (edit history), ProofingSelection (ratings)
2. **Services**: watermark.service.js, twofa.service.js
3. **Routes**: watermark.routes.js, twofactor.routes.js (registered in main router)
4. **Frontend**: WatermarkManagerPage.jsx (complete example)
5. **Dependencies**: Installed (sharp, speakeasy, qrcode, redis, bull, etc.)

---

## Architecture Pattern (For Your Team)

### Pattern 1: Model + Service + Routes + Frontend

**Backend Pattern:**
```
server/models/FeatureName.js → Define Sequelize model
server/services/feature.service.js → Business logic
server/routes/feature.routes.js → API endpoints (CRUD + special actions)
server/routes/index.js → Register route
```

**Frontend Pattern:**
```
client/src/api/featureApi.js → API calls
client/src/components/common/Feature*.tsx → Reusable components
client/src/pages/dashboard/FeaturePage.jsx → Page component
client/src/hooks/useFeature.ts → Custom hooks
client/src/store/featureStore.js → Zustand store (if complex state)
```

---

## REMAINING PHASE 1 TASKS (3 Features)

### Task 1.2: Photo Editing (Crop, Rotate, Adjust) 
**Difficulty:** Medium | **Time:** 2-3 hours | **Assigned:** Dev 1

**Deliverables:**
- Extend `imageProcess.service.js` with crop/rotate/adjust functions
- Add to Photo model: `original_s3_key`, `edit_history`
- Create `server/routes/photoedit.routes.js`:
  ```javascript
  POST /api/v1/photos/:id/crop - {x, y, width, height}
  POST /api/v1/photos/:id/rotate - {degrees}
  POST /api/v1/photos/:id/adjust - {brightness, contrast}
  ```
- Create frontend: `PhotoEditingModal.tsx` component
- Add to `PhotoDetailsPage.jsx`: Edit button that opens modal

**Tech Details:**
- Use `sharp` (already installed) for image processing
- Store edit history as JSON in Photo.edit_history
- Create versioned S3 keys: photo.jpg → photo-edit-1-crop.jpg

**Reference:** Watermark service shows S3 compositing pattern - reuse approach

---

### Task 1.3: Advanced Search & Filters
**Difficulty:** Medium | **Time:** 2-3 hours | **Assigned:** Dev 2

**Deliverables:**
- No new model needed (uses existing Photo fields)
- Extend `server/routes/photo.routes.js`:
  ```javascript
  GET /api/v1/photos/search?q=&dateFrom=&dateTo=&camera=&iso=&aperture=&tags=&sort=
  ```
- Add database indexes: `ALTER TABLE photos ADD INDEX(exif_make, exif_iso, exif_aperture, created_at);`
- Create frontend: `AdvancedPhotoSearch.tsx` component
- Integrate into `GalleryOrganizerPage.jsx`

**Tech Details:**
- Query: `Photo.findAll({ where: { [Op.and]: [...filters] } })`
- Sequelize `Op.between` for date ranges, `Op.like` for text
- Auto-populate dropdowns from existing EXIF data
- Pagination: `offset`, `limit` params

**Reference:** Look at existing `gallery.routes.js` for pagination pattern

---

### Task 1.4: Two-Factor Authentication (Frontend)
**Difficulty:** Easy-Medium | **Time:** 1.5-2 hours | **Assigned:** Dev 3

**Deliverables:**
- Already done: Backend (`twofa.service.js` + `twofactor.routes.js`)
- Create frontend: `SecurityPage.tsx` page
  - Component: `TwoFASetup.tsx` (shows QR, backup codes)
  - Component: `TwoFAManagement.tsx` (enable/disable, regenerate codes)
- Add route to Dashboard: `/dashboard/security`
- Update login flow in `LoginPage.jsx` to show 2FA challenge

**Tech Details:**
- Display QR with `qrcode.react` library
- Show backup codes in monospace, copy-to-clipboard button
- After login, if 2FA enabled, show modal for TOTP/backup code
- Store verified state in auth token/session

**Reference:** Look at `WatermarkManagerPage.jsx` for dialog/form pattern

---

## Remaining Work Summary

### What Your Team Should Do Next:

**Dev 1 (Backend Photo Editing):**
1. Extend imageProcess.service.js with crop/rotate/adjust
2. Add routes to photo.routes.js
3. Test with curl/Postman

**Dev 2 (Backend Advanced Search):**
1. Add search endpoint to photo.routes.js
2. Add database indexes in migration
3. Test filtering by date, camera, etc.

**Dev 3 (Frontend Security):**
1. Create SecurityPage.tsx
2. Create TwoFASetup component
3. Integrate into Dashboard navigation

**Dev 4 (Frontend Photo Editing + Search):**
1. Create PhotoEditingModal component
2. Create AdvancedPhotoSearch component
3. Integrate both into existing pages

---

## Database Migration Needed

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN two_fa_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN two_fa_backup_codes JSON;

-- Add columns to photos table
ALTER TABLE photos ADD COLUMN original_s3_key VARCHAR(500);
ALTER TABLE photos ADD COLUMN edit_history JSON;

-- Add columns to proofing_selections table
ALTER TABLE proofing_selections ADD COLUMN rating_reason TEXT;

-- Add indexes for search performance
ALTER TABLE photos ADD INDEX idx_exif_make (exif_make);
ALTER TABLE photos ADD INDEX idx_exif_iso (exif_iso);
ALTER TABLE photos ADD INDEX idx_exif_aperture (exif_aperture);
ALTER TABLE photos ADD INDEX idx_created_at (created_at DESC);
ALTER TABLE photos ADD FULLTEXT INDEX ft_title (title);

-- Create watermark_templates table (if Sequelize migration not run yet)
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
```

---

## Testing Checklist for Phase 1

### Backend Tests
- [ ] POST /api/v1/watermarks - create template
- [ ] GET /api/v1/watermarks - list templates
- [ ] POST /api/v1/watermarks/:id/apply-to-photo - apply to single
- [ ] POST /api/v1/watermarks/apply-to-multiple - apply to batch
- [ ] POST /api/v1/photos/:id/crop - test cropping
- [ ] POST /api/v1/photos/:id/rotate - test rotation
- [ ] POST /api/v1/photos/search?camera=Canon - test search
- [ ] POST /api/v1/auth/2fa/enable - generate QR
- [ ] POST /api/v1/auth/2fa/verify - verify TOTP

### Frontend Tests
- [ ] Create watermark template with form
- [ ] Preview watermark in real time
- [ ] Edit existing watermark
- [ ] Delete watermark
- [ ] Apply watermark to photo
- [ ] Search photos by EXIF
- [ ] Date range filtering
- [ ] Enable 2FA with authenticator app
- [ ] Login with 2FA enabled
- [ ] Use backup code if TOTP unavailable

---

## Code Templates Available for Copy-Paste

### Template 1: Basic CRUD Route
```javascript
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!resource) return res.status(404).json({ error: 'Not found' });
    res.json(resource);
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});
```

### Template 2: Frontend API Module
```javascript
export const exampleApi = {
  getAll: () => axiosClient.get('/example'),
  getOne: (id) => axiosClient.get(`/example/${id}`),
  create: (data) => axiosClient.post('/example', data),
  update: (id, data) => axiosClient.put(`/example/${id}`, data),
  delete: (id) => axiosClient.delete(`/example/${id}`),
};
```

### Template 3: Zustand Store
```javascript
import { create } = require('zustand');

export const useExampleStore = create((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

---

## Next Steps

1. **Today:** Devs 1-4 start assigned Phase 1 tasks in parallel
2. **Tomorrow:** Review PRs, test integration
3. **Next:** Deploy Phase 1 to staging, then move to Phase 2

---

## Key Files Reference

**Models:** `/server/models/`
**Services:** `/server/services/`
**Routes:** `/server/routes/`
**Frontend Pages:** `/client/src/pages/dashboard/`
**Frontend Components:** `/client/src/components/`
**API Clients:** `/client/src/api/`

