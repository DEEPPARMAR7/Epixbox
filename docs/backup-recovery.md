# Backup and Recovery Documentation

# Objectives

- Protect metadata in Neon PostgreSQL and media in Amazon S3.
- Define recovery flow for accidental deletion, corruption, or region-level outage.
- Maintain clear RTO and RPO targets.

# Target Recovery Metrics

- RPO (Recovery Point Objective): <= 24 hours
- RTO (Recovery Time Objective): <= 2 hours for API read availability

# Data Scope

- Primary DB: Neon PostgreSQL
- Primary object storage: Amazon S3 bucket for originals and derived images
- Config source of truth: deployment environment variables in Render and Vercel

# Backup Strategy

## 1. Database (Neon)

- Enable automatic backups and point-in-time restore.
- Keep at least 7 to 14 days retention.
- Weekly export logical dump to secure storage.
- Validate backup integrity with restore test to staging.

## 2. Media (S3)

- Enable S3 Versioning on the primary bucket.
- Enable Cross-Region Replication to a secondary bucket.
- Apply lifecycle policies to control storage cost.
- Keep delete markers and previous versions for rollback window.

## 3. Configuration

- Keep `.env` secrets out of git.
- Store production env values in Render/Vercel dashboards.
- Export and securely archive env variable inventory monthly.

## 4. Cloud Integration Setup

- Enable Neon Point-in-Time Recovery (PITR) in the Neon dashboard.
- Keep retention enabled for at least 7 to 14 days.
- Use the app's database deployment variables for Neon connectivity:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
- If your deployment platform supports a single database URL, map that value into the database config before release.
- Enable S3 Versioning on the main media bucket in AWS.
- Enable Cross-Region Replication if the bucket policy and budget allow it.
- Keep these cloud settings configured in deployment:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `S3_BUCKET_NAME`
- Set monitoring values for backend and frontend error capture:
  - `SENTRY_DSN`
  - `VITE_SENTRY_DSN`

## 5. Cloud Sync Test

- Upload a photo from the app and confirm the file appears in S3.
- Create or update a user record and confirm the data persists in Neon.
- Trigger a test error and confirm it appears in Sentry.
- Verify each step through the app response and the matching cloud dashboard.

# Recovery Runbook

## Scenario A: Accidental DB data deletion

1. Pause write traffic to API if possible.
2. Restore Neon to the latest valid point in time.
3. Validate key tables (`users`, `galleries`, `photos`, `orders`).
4. Re-enable traffic.
5. Record incident timeline and root cause.

## Scenario B: S3 object deletion/corruption

1. Locate object version history in S3.
2. Restore previous object version.
3. Verify object URLs from API responses.
4. Reprocess derivatives if required.

## Scenario C: Region outage

1. Switch app read/write to standby DB region or restored instance.
2. Point media reads to replicated S3 bucket.
3. Update DNS/config and monitor error rates.
4. Run smoke tests (auth, upload, gallery fetch).

# Verification and Drills

- Perform quarterly restore drill (DB + sample media).
- Document:
  - start time
  - recovery completion time
  - data consistency checks
- Keep drill report with action items.

# Checklist

- [ ] Neon PITR enabled
- [ ] Neon retention configured
- [ ] S3 Versioning enabled
- [ ] S3 replication enabled
- [ ] Lifecycle policies reviewed
- [ ] Database deployment variables configured
- [ ] S3 deployment variables configured
- [ ] Sentry DSNs configured
- [ ] Cloud sync test completed
- [ ] Quarterly restore drill scheduled
- [ ] Incident response contacts updated
