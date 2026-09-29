# Kontaktstoff: Neon → Supabase

Status: production migrated and verified on 2026-09-29. Neon returned to Free.

Approved destination (2026-09-29): create a separate Kontaktstoff Micro project
inside the existing Temoa Pro organization (approximately USD 10/month additional
compute). Do not create a second paid organization and do not import into Temoa's
existing application database. Organization identity and Pro plan verified in the
signed-in dashboard. No Neon quotas were modified;
the temporary Neon project key was revoked and its local copy removed.

Created destination: `kontaktstoff-production`, project `tpwyirchugjoqangparb`,
organization `temoa` (`hxsdbimmrizbixzitgle`), Micro, Frankfurt (`eu-central-1`).
Dashboard: https://supabase.com/dashboard/project/tpwyirchugjoqangparb
UI confirmed USD 10/month additional compute and status Healthy. Existing org
Spend Cap is enabled (left unchanged). Data API and automatic table exposure
disabled; automatic RLS enabled during creation. The Vercel integration was not reconnected, avoiding POSTGRES_* collisions.
Production DATABASE_URL was changed directly after verified import; the prior
Neon URL is preserved privately for recovery.

## Completed cutover — 2026-09-29

User explicitly approved temporary Neon Launch only if free export was blocked.
A fresh direct SELECT 1 returned PostgreSQL 53000 (quota exceeded), confirming
that free export was unavailable. Launch was enabled only for the migration and
Vercel subsequently confirmed Current Installation Level Plan: Free again.
The other Neon resource and the integration were not deleted.

- Maintenance deployment blocked application writes before export.
- Private mode-600 gzip backup stored under ignored `.data/migration/` (~40 MB).
- All 19 application tables imported and verified by per-table row checksums:
  2 users, 15 library entries, 11 campaigns, 12 reviews, 25 review versions,
  12 encrypted review-link secrets, 5 trash entries and all remaining tables.
- 19/19 application tables have RLS, zero grants to PUBLIC/anon/authenticated.
- Only production DATABASE_URL changed. Existing authentication and link keys
  preserved. Vercel remains hosting provider; database now Supabase.
- Supabase pooler TLS verifies hostname and official CA certificate, included in
  the server function. No certificate-verification bypass.
- Live deployment: kontaktstoff-r98euk6k7-spaceduggs-projects.vercel.app.
- Production /api/health 200, admin login 200, designs and campaigns 200,
  pre-existing BewertungsPush customer link 200 and revision polling returns
  unchanged without re-transferring images. Maintenance disabled.
- 85 tests pass; production build passed.
- Email delivery remains unconfigured (pre-existing, unrelated).

Supabase Micro remains approximately USD 10/month additional in Temoa Pro.
Neon incurred temporary usage only; final charge is provider-calculated, not
asserted to be zero. Source data retained for recovery; credentials and backup
are ignored by git and excluded from deployments.

## Destination

- One dedicated Kontaktstoff project, Pro organization, Micro compute, EU region.
- Leave Spend Cap enabled; no extra projects, compute upgrades or paid add-ons.
- Disable Supabase Data API for this project: the existing server API and login
  remain authoritative. Import also enables RLS and revokes anon/authenticated
  access to every application table as defense in depth.
- Use the session pooler (port 5432) for migrations; use a server-side pooler
  connection with verified TLS for Vercel. Never expose database credentials to
  frontend code. Keep ADMIN_PASSWORD_HASH and REVIEW_LINK_KEY unchanged.

## Export / import

Neon currently reports network-transfer quota exhaustion, not database size.
Export needs quota reset or an explicitly approved temporary plan upgrade.
Before the final export, stop application writes on the old database so late
comments, requests or design changes cannot be omitted. Keep this maintenance
window until destination verification and deployment are complete.

Connection strings go into SOURCE_DATABASE_URL / TARGET_DATABASE_URL via a
private environment file (mode 600, ignored by git), never command arguments or
logs. Remote connections require sslmode=verify-full. The tool copies only the
known application tables, including all versions, sessions and encrypted links.

```
node scripts/database-migration.mjs export output/migration/neon-final.json.gz
node scripts/database-migration.mjs import output/migration/neon-final.json.gz
node scripts/database-migration.mjs verify output/migration/neon-final.json.gz
```

Export is a consistent read-only snapshot. Import refuses nonempty targets and
rolls back on failure. Every row is checksum-verified before commit. A second
verification checks the committed database. Backups contain private data and
password hashes; store privately, never deploy them or commit them to git.

## Live cutover

1. Verify counts and digests for all tables; check public Data API denial.
2. Change only Vercel DATABASE_URL for production to the tested Supabase URL.
   Preserve all unrelated environment variables, especially REVIEW_LINK_KEY.
3. Deploy; check /api/health, admin login, campaigns, design previews, old customer
   review URLs, comments, download PDF and revision updates. Use a temporary
   test review for writes, never approve a customer's actual artwork for testing.
4. Reopen writes only after successful checks. Keep the old database and private
   export available for recovery. Do not delete Neon during the cutover.
5. If Neon was temporarily upgraded, downgrade only after successful migration.
   Do not remove the Vercel integration blindly: it also owns existing env vars.

Rollback: before new writes, restore the old DATABASE_URL and redeploy (Neon must
be accessible). After new writes, first preserve/merge destination changes; never
blindly revert and lose new customer feedback.

Separate image storage is a follow-up migration, not part of the exact data copy.
Do not replace embedded images with public URLs containing customer information.
