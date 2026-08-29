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
