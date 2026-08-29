# Production seeds

`src/db/seed.ts` applies every `*.sql` file in this directory in filename order
(`001-…`, `002-…`) exactly once — a `seed_history` table records what has run, so
the seed step is safe to run on every deploy (it's part of the backend container's
start command).

`001-starter-content.sql` seeds the same starter content as the dev TypeScript
seeds (`nihongo/shared/src/db/seeds/*`): tags, blog posts + notes, projects, and photo
galleries. It's idempotent — unique slugs are `ON CONFLICT DO NOTHING` and photos
are guarded with `NOT EXISTS` — and `seed_history` means it runs once anyway, so it
never clobbers content created through the admin CMS.

To add more starter content later, drop another `NNN-name.sql` file here.

> The admin account is **not** seeded. Create it after the first deploy: register
> through the site (or the auth API), then promote that user to `role = 'admin'`
> in the database.

## After the first deploy, this is the only way in

The server runs Docker and nothing else — no Node, no pnpm — and the app has
real users, so the dump-and-restore in DEPLOY.md step 7 would take their
accounts and review history with it.

Every content correction from here is a numbered seed. The backend runs them on
start, `seed_history` records which have run, and a deploy is the whole
procedure.

Write them to be **derived and idempotent**: `036-cloze-answer-readings.sql`
recomputes readings from `sentence_tokens` rather than carrying 1,659 literals,
and its `WHERE` clause excludes rows that already hold the value, so a second
run reports `UPDATE 0`.
