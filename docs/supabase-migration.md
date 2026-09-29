# Kontaktstoff: Neon → Supabase

Status: destination created and healthy, not switched. Never point production to an empty database.

Approved destination (2026-09-29): create a separate Kontaktstoff Micro project
inside the existing Temoa Pro organization (approximately USD 10/month additional
compute). Do not create a second paid organization and do not import into Temoa's
existing application database. Organization identity and Pro plan verified in the
signed-in dashboard. No Neon paid upgrade or quotas were activated;
the temporary Neon project key was revoked and its local copy removed.

Created destination: `kontaktstoff-production`, project `tpwyirchugjoqangparb`,
organization `temoa` (`hxsdbimmrizbixzitgle`), Micro, Frankfurt (`eu-central-1`).
Dashboard: https://supabase.com/dashboard/project/tpwyirchugjoqangparb
UI confirmed USD 10/month additional compute and status Healthy. Existing org
Spend Cap is enabled (left unchanged). Data API and automatic table exposure
disabled; automatic RLS enabled during creation. No application data imported,
no Vercel env variables changed, no connection added yet: the integration writes
POSTGRES_* keys that conflict with Neon's existing keys. Connect only as part of
the verified cutover, preserving the old DATABASE_URL for rollback.

Remaining blocker: Neon network-transfer suspension (live backend returns 503).
User was asked whether to wait for 2026-10-01 reset or temporarily upgrade Neon
for the export. Do not infer an answer. Supabase target provisioning is complete.

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
