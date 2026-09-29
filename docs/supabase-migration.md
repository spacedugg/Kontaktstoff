# Kontaktstoff: Neon → Supabase

Status: prepared, not switched. Never point production to an empty database.

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
