# Backup and Recovery Documentation

## Objectives

- Protect metadata in Neon PostgreSQL and media in Amazon S3.
- Define recovery flow for accidental deletion, corruption, or region-level outage.
- Maintain clear RTO and RPO targets.

## Target Recovery Metrics

- RPO (Recovery Point Objective): <= 24 hours
- RTO (Recovery Time Objective): <= 2 hours for API read availability

## Data Scope

- Primary DB: Neon PostgreSQL
- Primary object storage: Amazon S3 bucket for originals and derived images
- Config source of truth: deployment environment variables in Render and Vercel

## Backup Strategy

### 1. Database (Neon)

- Enable automatic backups and point-in-time restore.
- Keep at least 7 to 14 days retention.
- Weekly export logical dump to secure storage.
- Validate backup integrity with restore test to staging.

### 2. Media (S3)

- Enable S3 Versioning on the primary bucket.
- Enable Cross-Region Replication to a secondary bucket.
- Apply lifecycle policies to control storage cost.
- Keep delete markers and previous versions for rollback window.

### 3. Configuration

- Keep `.env` secrets out of git.
- Store production env values in Render/Vercel dashboards.
- Export and securely archive env variable inventory monthly.

## Recovery Runbook

### Scenario A: Accidental DB data deletion

1. Pause write traffic to API if possible.
2. Restore Neon to the latest valid point in time.
3. Validate key tables (`users`, `galleries`, `photos`, `orders`).
4. Re-enable traffic.
5. Record incident timeline and root cause.

### Scenario B: S3 object deletion/corruption

1. Locate object version history in S3.
2. Restore previous object version.
3. Verify object URLs from API responses.
4. Reprocess derivatives if required.

### Scenario C: Region outage

1. Switch app read/write to standby DB region or restored instance.
2. Point media reads to replicated S3 bucket.
3. Update DNS/config and monitor error rates.
4. Run smoke tests (auth, upload, gallery fetch).

## Verification and Drills

- Perform quarterly restore drill (DB + sample media).
- Document:
  - start time
  - recovery completion time
  - data consistency checks
- Keep drill report with action items.

## Checklist

- [ ] Neon PITR enabled
- [ ] Neon retention configured
- [ ] S3 Versioning enabled
- [ ] S3 replication enabled
- [ ] Lifecycle policies reviewed
- [ ] Quarterly restore drill scheduled
- [ ] Incident response contacts updated
