# Deployment runbook

Everything needed to put `nihongo.futari.live` on the internet, in order.

This app is the **third** on an existing Hetzner box. dmb.futari already runs
there with Postgres, Redis and Caddy; nihongo adds only a backend and a
frontend container and reuses the rest. That is why this runbook is much
shorter than `dmb.futari/DEPLOY.md` — steps 1–3 of that one are already done.

Read `dmb.futari/DEPLOY.md` if you ever need to rebuild the box itself.

**Before anything else**: this repo has no git commits. Step 1 is not optional.

---

## Step 0 — What already exists

Confirm each of these before starting. All should already be true.

```bash
# On the server. The shared containers nihongo depends on:
docker ps --format '{{.Names}}' | grep -E 'dmb-postgres|dmb-redis|dmb-caddy'

# The shared network the compose file joins:
docker network ls | grep futari
```

The `nihongo.futari.live` block is already in `dmb.futari/Caddyfile`, pointing
at `nihongo-frontend:8080`.

But **the running Caddy container may not have that block loaded**. The
Caddyfile is bind-mounted read-only from the dmb repo, so the file on disk
changes the moment that repo is pulled — the process does not re-read it. If
`dmb.futari` has been pulled since Caddy last started, the edge is still
serving the old configuration and `nihongo.futari.live` will not resolve to
anything.

Check before you go further:

```bash
# On the server. Does the RUNNING config know about nihongo?
docker exec dmb-caddy caddy adapt --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null | grep -c nihongo
```

See Step 6a for the reload.

---

## Step 1 — Commit and push this repo

Nothing here is in version control yet, so nothing can be deployed and nothing
is backed up.

```bash
cd ~/Documents/projects/nihongo.futari

# .gitignore already excludes .env, .env.keys, node_modules, dist and .data.
# Check before the first commit that no secret is staged:
git add -A
git status --short | grep -E '\.env($|\.)|\.keys' && echo "STOP — secrets staged" || echo "clean"

git commit -m "Initial commit"
```

Create the GitHub repo and push:

```bash
gh repo create thedumebi/nihongo.futari --private --source=. --remote=origin
git push -u origin master
```

> The `.data/` directory holds ~600 MB of downloaded corpora. It is gitignored
> on purpose — the importers re-download on demand.

---

## Step 2 — DNS

Add an A record at your registrar pointing `nihongo` at the same server IP that
`dmb.futari.live` uses.

| Type | Host      | Value          | TTL       |
| ---- | --------- | -------------- | --------- |
| A    | `nihongo` | *your server IP* | Automatic |

Find the IP with `dig +short dmb.futari.live`. Check it has propagated:

```bash
dig +short nihongo.futari.live
```

Wait for that to return the right address before going further — Caddy cannot
get a certificate until it does.

---

## Step 3 — Create the production database

nihongo shares dmb's Postgres instance but needs its own database.

Two things bite here, and they produce different errors.

**The superuser is not `postgres`.** dmb's Postgres was created with
`POSTGRES_USER: ${PG_USERNAME}` from dmb's own config, so `-U postgres` gives
`role "postgres" does not exist`. Ask the container for its own username rather
than hardcoding one.

**`psql` needs a database to connect to.** With no `-d` it opens one named
after the connecting user, so `psql -U thedumebi` gives
`database "thedumebi" does not exist`. `createdb` does not have this problem —
it uses the `postgres` maintenance database by default, which is why the
command below uses it.

```bash
# On the server
docker exec dmb-postgres sh -c 'createdb -U "$POSTGRES_USER" nihongo'

# Confirm it exists (-d is required for the same reason)
docker exec dmb-postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -lqt' | cut -d\| -f1 | grep nihongo
```

**The rule for the rest of this guide:** every command against `dmb-postgres`
passes both `-U "$POSTGRES_USER"` and an explicit `-d`. Neither defaults to
anything useful. The `pg_restore` in Step 7 and the `pg_dump` in
`scripts/backup-db.sh` already name their database; the `pg_dump` in Step 7
runs on your Mac, where `postgres` genuinely is the user.

---

## Step 4 — Fill in and encrypt the production config

```bash
cd ~/Documents/projects/nihongo.futari
cp nihongo/backend/.env.production.example nihongo/backend/.env.production
```

Edit it. The values that must change from the template:

| Key | Value |
| --- | --- |
| `PG_HOST` / `PG_DATABASE` | `dmb-postgres` / `nihongo` |
| `PG_PASSWORD` | the same password dmb uses |
| `REDIS_HOST` | `dmb-redis` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` / `FRONTEND_URL` / `ALLOWED_ORIGINS` | `https://nihongo.futari.live` |
| `VITE_API_URL` | `https://nihongo.futari.live/api` |
| `BREVO_API_KEY`, `EMAIL_FROM` | reuse dmb's Brevo account |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:` and your address |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `S3_*`, `AWS_*` | reuse dmb's Cloudflare R2 backup bucket |

Then encrypt it. dotenvx encrypts the values in place and writes the private
key to `.env.keys`, which is gitignored:

```bash
npx @dotenvx/dotenvx encrypt -f nihongo/backend/.env.production

# Confirm every value is now ciphertext before committing:
grep -c 'encrypted:' nihongo/backend/.env.production

git add nihongo/backend/.env.production
git commit -m "Add encrypted production config"
git push
```

> The encrypted file is committed on purpose; `.env.keys` never is.
>
> **Back the key up somewhere outside the repo** — a password manager entry is
> ideal. It is gitignored, so it is invisible to `git status` and is deleted by
> anything that sweeps ignored files (`git clean -fdX`, a "remove all .env
> files" tidy-up). Nothing warns you: the encrypted values stay perfectly
> readable as ciphertext and only fail when something tries to decrypt them.
> Losing it means regenerating every secret in the file.

---

## Step 5 — Put the code and the key on the server

The checkout is named `nihongo`, not `nihongo.futari` — `git clone` takes the
directory as its last argument, otherwise it uses the repository name.

```bash
# On the server, as the deploy user
cd ~
git clone git@github.com:thedumebi/nihongo.futari.git nihongo
cd nihongo
```

Already cloned it as `nihongo.futari`? Rename it — nothing inside the checkout
refers to its own directory name, so this is safe:

```bash
# On the server
cd ~ && mv nihongo.futari nihongo
```

If you had already deployed from the old path, the containers hold no path
state, but Compose derives its project name from the directory. Bring the old
stack down BEFORE renaming, or it is orphaned under the old name:

```bash
cd ~/nihongo.futari && docker compose -f docker-compose.prod.yml down
cd ~ && mv nihongo.futari nihongo
```

Copy the decryption key across from your Mac — this is the one secret the
server holds:

```bash
# On your Mac
scp nihongo/backend/.env.keys deploy@YOUR_SERVER_IP:~/nihongo/nihongo/backend/.env.keys
```

```bash
# Back on the server, lock it down
chmod 600 nihongo/backend/.env.keys
```

---

## Step 6 — First deploy

The frontend's API URL and title are **build arguments**, substituted by
Compose before the image is built. They live in the encrypted
`.env.production`, so the deploy has to run under `dotenvx` — plain
`docker compose up` would bake in the defaults and the built SPA would call
the wrong origin.

```bash
# On the server, from the repo root
dotenvx run -f nihongo/backend/.env.production -- \
  docker compose -f docker-compose.prod.yml up -d --build

docker compose -f docker-compose.prod.yml ps
```

Check the URL really was baked in — this is easy to get wrong and only shows
up as a CORS failure in the browser much later:

```bash
docker compose -f docker-compose.prod.yml exec frontend \
  grep -ro 'https://[a-z.]*/api' /usr/share/nginx/html/assets | head -1
```

> The backend does NOT need `dotenvx` at runtime: it reads the encrypted file
> from the read-only mount and decrypts it in-process using the key in
> `.env.keys`, which Compose injects via `env_file`. Only the *build* needs the
> values in the shell.

The backend container runs migrations and seeds on start, so the schema and all
the content seeds apply themselves. Watch it happen:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

### 6a. Reload Caddy on the dmb side

Caddy will not route to the new container until it has re-read its config. The
file is mounted read-only, so a reload is enough — no restart, no downtime for
dmb or abm.

```bash
# On the server, in the DMB repo — that is where the Caddyfile lives
cd ~/dmb.futari
git pull

# Validate before applying. A malformed Caddyfile taken live would drop all
# three sites, so never skip this.
docker exec dmb-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

# Apply it in place. `reload` swaps the config without dropping connections.
docker exec -w /etc/caddy dmb-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

If `validate` fails, fix the Caddyfile first — the running config is untouched
until `reload` succeeds, so a failed validate has cost nothing.

Confirm the new host is live and that the other two survived:

```bash
docker exec dmb-caddy caddy adapt --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null | grep -c nihongo
docker logs --tail 20 dmb-caddy          # certificate issuance for the new host
curl -I https://nihongo.futari.live/health
curl -I https://dmb.futari.live/health
curl -I https://abm.futari.live/health
```

The first HTTPS request triggers a Let's Encrypt certificate for the new
hostname, which takes a few seconds. A 502 immediately after reload usually
means the nihongo containers are still starting, not that routing is wrong.

> If `reload` is ever refused, `docker compose -f docker-compose.prod.yml
> restart caddy` from the dmb repo works too — but it drops connections for all
> three sites for a second or two, so prefer the reload.

---

## Step 7 — Import the content

The database is empty of corpus data. Imports are heavy (JMdict is 63 MB of
XML) and are meant to run on your Mac against a local database, then be
restored — **not** run on the server.

```bash
# On your Mac, against the local DB you have already imported into.
# `postgres` IS correct here — this is your local instance, not dmb's.
pg_dump -h localhost -U postgres -d nihongo -Fc -f nihongo.dump

# Ship it up
scp nihongo.dump deploy@YOUR_SERVER_IP:/tmp/nihongo.dump
```

```bash
# On the server. Note the user differs from the dump above: your Mac's local
# Postgres is `postgres`, dmb's container is not — same trap as Step 3.
docker cp /tmp/nihongo.dump dmb-postgres:/tmp/nihongo.dump
docker exec -i dmb-postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d nihongo --clean --if-exists /tmp/nihongo.dump'
docker exec -i dmb-postgres rm /tmp/nihongo.dump
```

Audio and illustrations live in `nihongo/frontend/public/{audio,images}` on
your Mac and are **not** in the image — `.dockerignore` excludes both and R2
serves them. See Step 7a, which is not optional.

---

## Step 7a — Media on R2

Audio and illustrations are served from an object bucket rather than the
frontend image. Cloudflare R2 charges nothing for egress, which is the whole
reason for choosing it over ImageKit: ImageKit's free tier *stops serving* at
20 GB/month rather than billing overage, and its value is image transformation,
which hand-drawn SVGs and pre-generated `.m4a` files do not need.

The R2 account already exists — the nightly backups use it.

### 7a-i. A second, public bucket

Backups must stay private and assets must be public, so this is a **separate
bucket with its own token**. Do not widen the backup credentials.

In the Cloudflare dashboard: R2 → Create bucket → `nihongo-assets`. Then
Settings → Public access → allow, which gives a public URL. Add a CORS policy
allowing `GET` from `https://nihongo.futari.live` — without it the service
worker caches opaque responses it cannot measure, and its quota accounting
silently stops working.

Create an API token scoped to **this bucket only**, with Object Read & Write.

#### The r2.dev hostname is a stopgap

Cloudflare labels the `pub-<hash>.r2.dev` URL rate-limited and not recommended
for production, and Access and Caching do not apply to it. That is accurate but
not urgent here: the service worker caches every clip per device for 90 days,
so a reader fetches a given file once, and the app is invite-only. The volume
is nowhere near the limit.

The real fix is a **custom domain on the bucket** — `assets.nihongo.futari.live`
— which requires the `futari.live` zone to be on Cloudflare DNS. It is on
Namecheap today (`dns1.registrar-servers.com`). Moving it is the only awkward
part, because Caddy obtains its own Let's Encrypt certificates over HTTP-01 and
a proxied (orange-cloud) record would put Cloudflare's TLS in front instead.

If you do move it, set every existing record — `dmb`, `abm`, `nihongo`, the
apex and `www` — to **DNS only (grey cloud)**. Caddy then behaves exactly as it
does now, and only the new `assets` record is proxied, which is what the R2
custom domain needs.

Because the base is an env var and the database stores root-relative paths, the
switch is one line in `.env.production` and a redeploy. No migration, no
re-upload, no re-import.

### 7a-ii. Config

Add to `nihongo/backend/.env.production` (then re-encrypt, as in Step 4):

```
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET=nihongo-assets
R2_ACCESS_KEY_ID=<the new token's id>
R2_SECRET_ACCESS_KEY=<the new token's secret>
R2_PUBLIC_BASE_URL=https://<the bucket's public URL>
```

`R2_PUBLIC_BASE_URL` is the only one the running app reads, and it is required
— the backend throws on boot in production without it. The other four are for
the upload script, which runs on your Mac. Set the same base in
`nihongo/backend/.env` so development reads from the bucket too.

### 7a-iii. Upload

Generated audio lives on your machine, not in git. Make sure it is complete
first — the importers reference a clip for every published word, and running
`audio:words` to completion is what makes those references real:

```bash
# On your Mac. Skips anything already generated, so it is cheap to re-run.
# `all` runs the four in order; they can also be run individually.
pnpm -C nihongo/backend audio:all

# Then push it. Idempotent: an object already present at the same size is
# skipped, so re-running after generating more only uploads the new clips.
pnpm -C nihongo/backend upload:assets
```

Roughly 11,100 clips and 90 MB when complete: 138 kana, 8,240 words, 1,826
sentences and 927 conversation lines. The last group is generated in two
voices, so an exchange sounds like two people rather than one reading a
transcript.

**Both `public/audio` and `public/images` are in `.dockerignore`**, so the
image carries neither. The bucket is the single source, and there is
deliberately no origin fallback left: `R2_PUBLIC_BASE_URL` is required, and the
backend refuses to boot in production without it rather than silently serving
paths nginx cannot satisfy.

Development points at the same bucket. That is the whole reason for having one
source — a dev environment reading from disk is a dev environment that cannot
reproduce a broken bucket, a missing CORS header, or a clip that was generated
but never uploaded.

The files still live in `public/` on your Mac, because that is where `audio:all`
writes and where the SVGs are authored. They are kept out of the precache
manifest (`globIgnores` in `vite.config.ts`) so a local build and the deployed
one produce the same service worker; both trees are cached at runtime instead,
`go-audio` and `go-images`.

The SVG source stays in git. R2 is the source of truth for *serving*, not for
the artwork — a hand-drawn file whose only copy is a bucket is one accidental
delete from being gone. The audio is different: it is regenerated from the
database by `audio:all`, so it is gitignored.

### 7a-iv. Verify

```bash
# A clip is publicly readable, with the immutable cache header and CORS
curl -I https://<bucket-public-url>/audio/kana/hiragana-a.m4a
curl -sI -H 'Origin: https://nihongo.futari.live' \
  https://<bucket-public-url>/audio/kana/hiragana-a.m4a | grep -i access-control

# And the API now hands out bucket URLs rather than paths
curl -s https://nihongo.futari.live/api/study/queue?languageCode=ja \
  -H "Cookie: <your session>" | grep -o 'https://[^"]*\.m4a' | head -1
```

In the browser: play a card's audio, confirm in DevTools Network that it comes
from the bucket with a CORS header, then go offline and confirm it still plays
from the `go-audio` cache.

---

## Step 8 — Schedule the study reminders

There is no in-app scheduler. Host cron calls an authenticated endpoint, the
same pattern as the nightly backup.

```bash
# On the server
crontab -e
```

```cron
*/15 * * * * curl -fsS -X POST https://nihongo.futari.live/api/notifications/run-reminders \
  -H "x-cron-secret: YOUR_CRON_SECRET" >> /home/deploy/nihongo-reminders.log 2>&1
```

Every 15 minutes, not hourly: the endpoint decides internally who is due in
their own timezone, and a coarser tick would miss people whose reminder hour
falls between runs. Sends are idempotent, so an overlapping or retried run
cannot double-send.

---

## Step 9 — Add nihongo to the nightly backup

```bash
# On the server, check whether the backup script already covers it
grep -c nihongo ~/nihongo/scripts/backup-db.sh
```

The script is already written for this database. Add its cron line if it is not
there:

```cron
30 3 * * * cd /home/deploy/nihongo && /usr/local/bin/dotenvx run -f nihongo/backend/.env.production -- ./scripts/backup-db.sh >> /home/deploy/nihongo-backup.log 2>&1
```

---

## Step 10 — Enable automatic deploys

Add these repository secrets on GitHub (Settings → Secrets and variables →
Actions):

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | server IP |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | the **private** key whose public half is in the server's `authorized_keys` |
| `DEPLOY_PATH` | `/home/deploy/nihongo` |
| `DEPLOY_PORT` | only if SSH is not on 22 |

After that, every push to `master` runs lint, typecheck and tests, then
fast-forwards and rebuilds on the server.

---

## Step 11 — Verify

```bash
# The app answers over HTTPS with a real certificate
curl -I https://nihongo.futari.live/health

# The other two sites still work — Caddy and Postgres are now load-bearing
# for three apps, so this is the check that matters most
curl -I https://dmb.futari.live/health
curl -I https://abm.futari.live/health

# Containers are healthy
docker compose -f docker-compose.prod.yml ps
```

Then in a browser:

1. Sign up, confirm the verification email arrives.
2. Open `/course` — it should show N5 stage 1 with kana.
3. Study a card and check it comes back in Progress.
4. Settings → turn on push. In production the service worker registers, so this
   should now succeed where it cannot in dev.
5. Trigger a reminder by hand to prove the cron path works:

```bash
curl -X POST https://nihongo.futari.live/api/notifications/run-reminders \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

---

## What is in the images

Beyond compiled code:

| Where | What | Size |
| --- | --- | --- |
| frontend | Generated audio, `public/audio` | none — excluded by `.dockerignore`, served from R2 (Step 7a) |
| frontend | Hand-drawn SVG illustrations | none — excluded by `.dockerignore`, served from R2 (Step 7a) |
| backend | 26 `.sql` seed files | small |
| backend | 6 Drizzle migrations | small |
| backend | 7 compiled email templates | small |

The audio dominates. It is macOS `say` output committed to the repo, and
moving it to R2 is on the backlog — until then every image build carries it and
every deploy ships it again.

**Not** in the images, and deliberately:

- **`.data/`** — 575 MB of JMdict, KANJIDIC, KanjiVG, Tatoeba and wiktextract.
  Nothing COPYs it, and it is now in `.dockerignore` so Docker no longer
  uploads it as build context either.
- **The corpus itself** — words, kanji, sentences, grammar all live in
  Postgres, restored from a dump in Step 7. KanjiVG stroke paths are a column
  on `kanji`, not files.
- **GeoLite2** — bind-mounted from `/opt/futari`, shared with dmb rather than
  baked into a third copy.
- **Fonts** — Inter and Noto Sans JP are fetched from Google Fonts at runtime.

Nothing else needs building or uploading. There is no CDN step, no asset
bucket, and no separate migration job: the backend container runs migrations
and seeds itself on start.

## Rollback

```bash
# On the server
cd ~/nihongo
git log --oneline -5
git checkout <previous-sha>
dotenvx run -f nihongo/backend/.env.production -- \
  docker compose -f docker-compose.prod.yml up -d --build
```

Migrations are not rolled back automatically. Restore from the nightly dump if
a migration is the problem.

---

## Things that will bite

- **`vue-tsc` gets OOM-killed on a small box.** dmb hit this. The CI workflow
  runs the typecheck on GitHub's runners and the server only builds Docker
  images, which avoids it — keep it that way.
- **Three apps now share one Postgres and one Caddy.** A mistake in either
  takes down dmb and abm as well. Check all three after any change to them.
- **No media is in the image.** `R2_PUBLIC_BASE_URL` must be set or the
  backend refuses to boot in production. That is on purpose: without the guard
  the failure would be quiet — cards still work, the play button just does
  nothing and the deck art is blank.
