---
paths:
  - "*/shared/src/db/migrations/**"
  - "*/shared/src/db/schema/**/*.ts"
---

# Migrations

## Never hand-write a migration file

Change the schema in `shared/src/db/schema/`, then GENERATE:

```bash
pnpm -C nihongo/shared drizzle:generate
```

Only once the file exists may you edit it — rename it to something descriptive,
add the comment explaining WHY the change is being made, and adjust the SQL if
the generated version is not quite what the change needs.

**Writing the `.sql` by hand and adding a journal entry yourself is forbidden**,
however small the change and however obvious the SQL. It appears to work and it
silently breaks the next person's generate.

### Why this rule exists

It was broken three times in a row. Migrations `0007_dialogue_image`,
`0008_reminder_minute` and `0009_drop_quiet_hours` were each hand-written and
hand-registered in `_journal.json`. Every one of them applied cleanly, so
nothing looked wrong.

But `drizzle-kit` does not read your migrations to work out the current schema.
It reads `meta/<n>_snapshot.json`, and only `generate` writes those. Three
hand-written migrations meant three missing snapshots, so Drizzle still believed
the schema was at `0006` — quiet-hours columns present, `reminder_minute`
absent. The next real `generate` therefore diffed against a state that had not
existed for weeks, saw columns appear and disappear at once, and stopped to ask
whether each new column was a RENAME of one it thought had been dropped.

That prompt needs a TTY, which a coding agent does not have, so the whole
migration workflow was blocked until the snapshot chain was rebuilt by hand.
Answering it wrongly would have been worse than blocking: a rename migration
moves data instead of adding a column.

The cost is entirely deferred. The person who hand-writes the migration sees it
work; the person who runs `generate` weeks later inherits the mess.

### Repairing a broken chain

If snapshots are already missing, do NOT try to reconstruct the intermediate
ones. Generate a fresh full snapshot against an empty output directory — with no
prior state there is nothing to rename, so it never prompts — and adopt it as
the latest snapshot with its `prevId` pointing at the last good one:

```bash
sed "s#out: '../shared/src/db/migrations'#out: '/tmp/baseline'#" \
  nihongo/backend/drizzle.config.ts > nihongo/backend/drizzle.baseline.config.ts
NODE_OPTIONS='--import tsx' pnpm -C nihongo/backend exec dotenvx run -f .env -- \
  drizzle-kit generate --config=drizzle.baseline.config.ts
# then copy /tmp/baseline/meta/0000_snapshot.json in as <latest>_snapshot.json,
# setting its "prevId" to the id of the last snapshot that exists.
```

Confirm with `pnpm -C nihongo/shared drizzle:generate`, which must print
`No schema changes, nothing to migrate` without prompting.

### The hook does not save you here

`protect-files.sh` guards `migrations/meta/_journal.json` and now runs on
**Bash as well as Edit and Write**, so a `python` heredoc or a `sed -i` aimed at
the journal is refused the same way an Edit is. It matches the path in WRITE
position only — reading the journal with `cat`, `grep`, `git diff` or
`json.load(open(...))` is untouched.

It is still only a backstop. It knows the shapes of writes it has been taught,
not every possible one, so the rule above is the guard.

## Never `drizzle-kit push`

`push` mutates the database directly and writes no migration, so production and
the migration history diverge silently. Generate, review, commit, apply.

## Applying is not authoring

`drizzle-kit migrate` — what the container runs on boot — is non-interactive and
only reads `_journal.json`. A generate prompt on a laptop never blocks a deploy.
Do not confuse the two when diagnosing.

## Data changes are seeds, not migrations

A migration changes the SHAPE of the database. Content — new cards, corrected
answers, attaching media — goes in `backend/src/db/seeds/` as a numbered `.sql`
file. See `.claude/rules/media.md` for the generated-seed pattern.

Seeds are tracked by FILENAME with no content hash, so a seed that has already
run in production will never run again however much it is edited. To change
what an applied seed did, add a new one.
