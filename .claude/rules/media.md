---
paths:
  - "*/backend/src/pipeline/generate-audio.ts"
  - "*/backend/src/pipeline/import-images.ts"
  - "*/backend/src/pipeline/upload-assets.ts"
  - "*/shared/src/lib/imagery/**/*.ts"
  - "*/frontend/public/images/**"
---

# Audio and illustrations

Both are produced on a laptop by a CLI and served from a Cloudflare R2 bucket.

**The bucket is the only copy.** `public/audio` and `public/images` are staging
areas, not stores: git ignores both, `.dockerignore` keeps both out of the
deployed image, and either can be deleted at any time. Audio never lands there
at all any more — `generate-audio.ts` synthesises to a temp file and uploads
straight to R2. Illustrations are drawn there and cleared once uploaded.

Because of that, **"does this asset already exist" is a question for the bucket,
not the filesystem.** Every generator and importer asks `listKeys()` from
`pipeline/lib/bucket.ts`. Asking disk would report all eleven thousand
already-generated clips as missing the moment the staging tree was cleared, and
a re-run would regenerate and re-upload the lot. One listing per run, not a HEAD
per file: at this many objects that is the difference between seconds and most
of an hour.

Before deleting a staging tree, prove the bucket has it:

```bash
pnpm -C nihongo/backend verify:assets          # or: verify:assets images
rm -rf nihongo/frontend/public/{audio,images}
```

It compares every local file against the bucket by key and size and exits
non-zero if anything is missing. Objects the bucket has and disk does not are
the expected steady state, not a problem. Since
**`R2_PUBLIC_BASE_URL` is required and the backend refuses to boot in
production without it**. Development reads from the same bucket, deliberately:
an environment that serves media from disk cannot reproduce a broken bucket, a
missing CORS header, or a clip that was generated but never uploaded.

## Audio

macOS `say` plus `afconvert`. This is a local step; there is no audio service.

```bash
pnpm -C nihongo/backend audio:all         # kana, words, sentences, dialogues
pnpm -C nihongo/backend audio:dialogues   # or one kind at a time
```

No upload step: clips go straight to the bucket. Idempotent — a clip the bucket
already holds is skipped, so re-running after adding content only makes what is
new. Roughly 11,100 clips and 103 MB at full coverage.

Filenames are derived from database ids, never from text:

| Kind | Path | Keyed by |
| --- | --- | --- |
| kana | `audio/kana/<script>-<romaji>.m4a` | script + romaji |
| words | `audio/words/<entSeq>.m4a` | JMdict `ent_seq` |
| sentences | `audio/sentences/<id>.m4a` | `sentences.id` |
| dialogues | `audio/dialogues/<id>.m4a` | turn id AND reply id |

**Two voices in conversations.** Kyoko speaks the other party, Reed speaks the
learner's lines and every reply option. A dialogue read in one voice is a
monologue with line breaks — you cannot hear whose turn it is, which is most of
what makes an exchange followable.

**Every clip has a 20 second timeout.** `say` has been seen to hang for ever on
one input; a words run once sat for eight hours having produced nothing. A
stuck clip must cost one timeout, not the run. A failed clip is simply absent
from the bucket, so the next run picks it up on its own.

## Illustrations

**They are hand-authored SVG, written as code.** No image model is involved and
no image API is configured. This is the single most important thing to know
here, because `shared/src/lib/imagery/prompts.ts` builds prompts for a
generator that does not exist — it is there for the day one does, and following
it toward an API call is a dead end.

What `imagery/` IS for: `art-direction.ts` and `palette.ts` are the house style,
and they are binding. Every drawing composes from them so that hundreds of
separate files read as one family.

### The rules a drawing must satisfy

- **Palette only.** Every colour comes from `PALETTE` in `palette.ts`. The
  moment a drawing reaches for a colour outside that list it stops belonging.
- **`dustyRose` is an accent, used at most once per drawing**, and never as the
  fill of a main shape. A cushion, a bucket, a mug, an awning stripe.
- **One ink, one weight.** `#2F4858` at `stroke-width="2.5"`.
- **No text of any kind** — no kana, no kanji, no letters, no numbers. The app
  renders the word beside the image so it stays selectable and translatable;
  lettering inside the artwork is a defect. This constrains more than it looks:
  the hiragana and katakana units are a brush on practice paper and a pen on
  grid paper, with abstract marks, because the characters themselves are
  forbidden.
- **Reads at thumbnail size.** Plain or near-plain ground, generous breathing
  room, no crowded scenes. Figures stay small and none dominates.
- **Culturally specific.** A Japanese house for 家, not a suburban Western one.
  A generator or an author with no instruction defaults to the wrong thing.
- **Skip a word rather than fake it.** Some words have no honest picture at
  thumbnail size: grammatical abstractions (`風` as "-style"), taxonomic ranks
  (`目` as an order), bare numbers, senses that exist only as a suffix. A card
  with no image is fine; one showing the wrong thing teaches the wrong thing.
  Around 4% of a noun set falls out this way, and the rate climbs sharply above
  N4 as the vocabulary gets more abstract.
- **The palette has no yellow and no brown**, so a word whose entire meaning is
  one of those colours — `黄色`, `茶色` — cannot be drawn within these rules at
  all. That is a genuine conflict between "palette only" and "draw the thing",
  not an oversight to work around: leave them undrawn unless the palette gains
  a colour, and never reach outside it to fill the gap.

### Sizes and filenames

| Kind | Path | Keyed by | viewBox |
| --- | --- | --- | --- |
| vocabulary | `images/vocab/<entSeq>.svg` | JMdict `ent_seq` | `0 0 120 120` |
| unit scene | `images/scenes/<unitCode>.svg` | `curriculum_units.code` | `0 0 160 120` |
| conversation | `images/dialogues/<dialogueCode>.svg` | `dialogues.code` | `0 0 160 120` |

Vocabulary is square because a flashcard is square and shows one object. Scenes
and conversations are 4:3 because they show a situation — and the frames that
display them are `aspect-[4/3]` with `object-contain`, so a drawing in any
other ratio will letterbox.

**One drawing per conversation, not per unit.** Unit art was tried for
conversations first and was wrong: fourteen conversations in the Errands unit
all showed the same counter, so the picture repeated the group heading instead
of saying which moment this is. A unit scene now only backs the deck cards, and
serves as a fallback for a conversation that has not been drawn.

### The shape of a file

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120"
     role="img" aria-label="A short description for a screen reader">
  <!-- Which conversation this is, and what the drawing chose to show. -->
  <g fill="none" stroke="#2F4858" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="160" height="120" fill="#FBFAF7" stroke="none"/>
    <!-- shapes -->
  </g>
</svg>
```

### After drawing

Upload FIRST. Existence is a question for the bucket now, so an importer run
before the upload sees nothing and attaches nothing.

```bash
pnpm -C nihongo/backend upload:assets images   # 1. the bucket is the store
pnpm -C nihongo/backend verify:assets images   # 2. prove it landed
pnpm -C nihongo/backend import:images          # 3. local database only
pnpm -C nihongo/backend seed:images            # 4. how it reaches production
rm -rf nihongo/frontend/public/images          # 5. staging area, clear it
```

`import:images` never points a row at a file that is not there — a card with no
image beats a card with a broken one. `dialogues.image_url` and
`curriculum_units.image_url` are set by it; vocabulary art rides in
`exercise_prompts.assets` alongside the audio.

**Production never runs a pipeline script**, so step 3 is a local convenience
and step 4 is what actually ships. `seed:images` reads the bucket and writes the
next numbered seed containing every drawing that exists.

Always a NEW file, never an edit to the last one: `seed_history` records seeds
by filename with no content hash, so a seed that has already run in production
will never run again however much it is changed. Each new seed carries the
complete list rather than only the new ids — re-attaching a drawing a card
already has is a no-op, so a superset is safe and cannot leave a gap if a batch
is missed.

### Check the work before claiming it is done

These are cheap and catch the mistakes that actually happen:

```bash
D=nihongo/frontend/public/images/dialogues
# 1. every file is valid XML
for f in $D/*.svg; do python3 -c "import xml.dom.minidom,sys;xml.dom.minidom.parse(sys.argv[1])" "$f" || echo "INVALID $f"; done
# 2. no colour outside the palette
ALLOWED="2F4858 C7DAE8 A9C6DC DCE6EC 7FA5C0 FBFAF7 F2EBDD E3D8C6 B7C5AE 8FA394 CFD6D9 B3BEC4 D8A7A0"
grep -ohE '#[0-9A-Fa-f]{6}' $D/*.svg | tr -d '#' | tr 'a-f' 'A-F' | sort -u |
  while read -r c; do echo "$ALLOWED" | grep -qw "$c" || echo "OFF-PALETTE #$c"; done
# 3. filenames match content codes exactly — no orphans either way
```

The third one matters most: a drawing whose filename does not match a
`dialogues.code` is invisible, and a code with no drawing silently falls back
to its unit. Diff the two lists rather than trusting a count.
