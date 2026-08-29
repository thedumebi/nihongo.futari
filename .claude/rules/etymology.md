---
paths:
  - "*/backend/src/services/enrichment.service.ts"
  - "*/backend/src/prompts/**/*.ts"
  - "*/shared/src/lib/enrichment/**/*.ts"
  - "*/frontend/src/components/why/**/*.vue"
---

# The "Why" Layer

The product differentiator, and the easiest thing to quietly ruin. Kanji
etymology is a contested field full of confident-sounding folk etymology; the
popular app ecosystem presents invented origins as settled fact. These rules
exist so this app doesn't.

## Sourced history and invented mnemonics never mix

`etymology_entries` and `mnemonics` are **separate tables with different
shapes**, different API responses, and different Vue components that share zero
code. Etymology carries citations, confidence, period and disputed markers.
A mnemonic carries none of that and is always rendered labelled *"Memory aid —
invented, not historical."*

You cannot accidentally render one as the other. Keep it that way.

## Publication is gated by the database

```
check: status <> 'published' or sourceCount > 0
check: status <> 'published' or reviewedBy is not null
```

An unsourced or unreviewed etymology **cannot physically be published**. Do not
add a code path that works around this; if you need to publish, add the source
and the reviewer.

## Enrichment is grounded, never free-generated

The model is **never** asked "what is the etymology of X". Every call is:

1. **Retrieve first.** Build the grounding packet from the database only —
   KANJIDIC readings, KanjiVG components, CHISE IDS, the EDRDG phonetic-series
   row, JMdict `lsource`, verbatim wiktextract text, existing
   `etymology_sources.quote` rows.
2. **If the packet is empty for that aspect, skip the item** and queue it
   `needs-source`. No packet, no generation. This single rule is most of the
   defence.
3. **Constrain the output** with a strict schema: `claim`, `body`, `aspect`,
   `confidence`, `period`, `isDisputed`, `competingTheories[]`, `citations[]`,
   `unsupportedClaims[]`. Every `citations[].sourceId` must be one that was
   passed in.
4. **Validate mechanically before a human sees it:**
   - every `sourceId` ∈ the input packet, else **auto-reject** (hallucinated citation)
   - every `quote` is a **literal substring** of the corresponding input text,
     else **auto-reject** — this is the check that makes fabricated support
     impossible to sneak past a tired reviewer
   - at least one citation, else auto-reject
   - no verbatim run > 25 words from any input (copyright)
   - `confidence: 'attested'` with no tier-1 source → auto-downgrade to `plausible`
5. Land in `content_review_queue` as `pending`.

Nothing with `generatedBy = 'ai'` reaches `published` without a human reviewer.

## Competing theories

Where scholarship disagrees, write both as separate `etymology_entries` sharing
a `competingGroupId`, and let the UI show "Theory 1 / Theory 2". Do not pick a
winner silently. `isPrimary` marks the one we lead with.

## Grammar prose is authored, never imported

Only the *list* of JLPT grammar points is sourced. `grammar_points.meaningLong`,
`nuance` and the mistake explanations are written here and human-reviewed. No
importer writes to them — which is also why nothing third-party can be
plagiarised in by accident.

## Reviewing is the bottleneck

The admin review UI is keyboard-driven for a reason: thousands of human
decisions gate this feature. Auto-reject aggressively so reviewers only ever see
plausible drafts. **Shipping a kanji with no etymology is correct; shipping one
with an unsourced etymology is not.**
