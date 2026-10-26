# review-code self-eval scenarios

These scenarios test whether the `review-code` dimension agents catch the bugs they should
(recall) without crying wolf (precision). The `skill-eval-runner` agent loads this file, runs
the single dimension agent named in each scenario against the scenario `input`, and grades.

## Grading model

For each scenario:
- **recall** = matched `expected_findings` / total `expected_findings`. A produced finding matches an
  expected one when it shares the `dimension` AND its text contains the expected `anchor` substring
  OR every string in `must_mention`.
- **precision** = good findings / total produced (a finding is "good" if it matches an expected one
  or is a reasonable true positive). Findings in `allowed_false_positive_dimensions` that fire are penalties.
- **band_ok** = the score computed from the expected findings satisfies `expected_score_band`. Compare the
  **unrounded** score: one −0.5 finding is 9.5, which the skill would print as 10.
- **PASS** = recall on ERROR-class expected findings is 1.0, precision ≥ 0.6, and band_ok.

Scoring rules (for band computation): start 10; lint −1; perf-major −1; security −2; pattern −0.5;
file-integrity ERROR −2; requirements ERROR −1; security vuln present → cap ≤5.

Scenario fields: `id`, `dimension`, `intent`, `input_kind` (diff|files), `input`, `expected_findings`
(each with `category`, `subcategory`, `severity`, `anchor` and/or `must_mention`), `expected_score_band`,
optional `allowed_false_positive_dimensions`, optional `notes`. A scenario with empty `expected_findings`
is a **clean** scenario — the agent should return `NO FINDINGS` (tests precision / false-positive rate).

---

## scenario: SEC-001
- dimension: security
- intent: "add word search by meaning"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/words.service.ts
    +++ b/nihongo/backend/src/services/words.service.ts
    @@ -40,6 +40,11 @@
    +export async function searchByMeaning(q: string) {
    +  return db.execute(
    +    sql.raw(`SELECT * FROM words WHERE meaning ILIKE '%${q}%'`)
    +  )
    +}
    ```
- expected_findings:
    - dimension: security
      category: security
      subcategory: injection
      severity: ERROR
      anchor: "sql.raw"
      must_mention: ["parameter", "injection"]
- expected_score_band: "<=5"
- notes: "Raw string interpolation into SQL — classic injection. Security vuln triggers the hard cap."

## scenario: SEC-002
- dimension: security
- intent: "render the reading passage notes in the reading view"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/frontend/src/views/reading.vue
    +++ b/nihongo/frontend/src/views/reading.vue
    @@ -12,6 +12,7 @@
    -      <p>{{ reading.notes }}</p>
    +      <div v-html="reading.notes"></div>
    ```
- expected_findings:
    - dimension: security
      category: security
      subcategory: injection
      severity: ERROR
      anchor: "v-html"
      must_mention: ["XSS"]
- expected_score_band: "<=5"
- notes: "v-html on server-influenced content is a stored-XSS sink."

## scenario: SEC-003
- dimension: security
- intent: "let a learner fetch the review history for one card"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/study.service.ts
    +++ b/nihongo/backend/src/services/study.service.ts
    @@ -80,6 +80,11 @@
    +export async function getCardLogs(userId: string, cardId: string) {
    +  return db.select().from(srsReviewLogs)
    +    .where(eq(srsReviewLogs.cardId, cardId))
    +    .orderBy(asc(srsReviewLogs.reviewedAt))
    +}
    ```
- expected_findings:
    - dimension: security
      category: security
      subcategory: authorization
      severity: ERROR
      anchor: "eq(srsReviewLogs.cardId, cardId)"
      must_mention: ["userId"]
- expected_score_band: "<=5"
- notes: "userId is accepted but never used in the WHERE — any learner can read another learner's review log by guessing a card id."

## scenario: SEC-004-clean
- dimension: security
- intent: "look up a word by id with a parameterized Drizzle query"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/words.service.ts
    +++ b/nihongo/backend/src/services/words.service.ts
    @@ -40,6 +40,9 @@
    +export async function findWordById(id: string) {
    +  return db.query.words.findFirst({ where: eq(words.id, id) })
    +}
    ```
- expected_findings: []
- expected_score_band: ">=8"
- notes: "Parameterized, public catalogue content, no user scope needed — agent must NOT invent a vuln (precision test)."

---

## scenario: PERF-001
- dimension: performance
- intent: "attach the kanji to each word in a lesson"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/lesson.service.ts
    +++ b/nihongo/backend/src/services/lesson.service.ts
    @@ -20,6 +20,12 @@
    +export async function lessonWordsWithKanji(lessonId: string) {
    +  const rows = await db.query.words.findMany({ where: eq(words.lessonId, lessonId) })
    +  for (const w of rows) {
    +    w.kanji = await db.query.kanji.findMany({ where: inArray(kanji.character, [...w.written]) })
    +  }
    +  return rows
    +}
    ```
- expected_findings:
    - dimension: performance
      category: performance
      subcategory: complexity
      severity: ERROR
      anchor: "for (const w of rows)"
      must_mention: ["N+1"]
- expected_score_band: "<=8"
- notes: "Query inside a loop — N+1. Major perf issue (−1)."

## scenario: PERF-002
- dimension: performance
- intent: "refresh the due count every second on Today"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/frontend/src/components/due-count.vue
    +++ b/nihongo/frontend/src/components/due-count.vue
    @@ -8,6 +8,9 @@
    +onMounted(() => {
    +  setInterval(() => refreshDue(), 1000)
    +})
    ```
- expected_findings:
    - dimension: performance
      category: performance
      subcategory: memory
      severity: ERROR
      anchor: "setInterval"
      must_mention: ["onUnmounted"]
- expected_score_band: "<=8"
- notes: "setInterval never cleared on unmount → leak + duplicate timers."

---

## scenario: ERR-001
- dimension: error-handling
- intent: "send a welcome email after an invite is redeemed"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/routes/invites/invites.handlers.ts
    +++ b/nihongo/backend/src/routes/invites/invites.handlers.ts
    @@ -30,6 +30,8 @@
       const user = await redeemInvite(input)
    +  // fire and forget
    +  sendWelcomeEmail(user.email)
       return c.json(user, 201)
    ```
- expected_findings:
    - dimension: error-handling
      category: error_handling
      subcategory: api_errors
      severity: ERROR
      anchor: "sendWelcomeEmail(user.email)"
      must_mention: ["await", "unhandled"]
- expected_score_band: "<=9.5"
- notes: "Un-awaited promise → unhandled rejection if the email call throws."

## scenario: ERR-002
- dimension: error-handling
- intent: "ask the model to explain an etymology grounding packet"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/enrichment.service.ts
    +++ b/nihongo/backend/src/services/enrichment.service.ts
    @@ -50,6 +50,9 @@
    +export async function explain(packet: GroundingPacket) {
    +  const res = await fetch(ANTHROPIC_URL, { method: 'POST', body: JSON.stringify({ packet }) })
    +  return res.json()
    +}
    ```
- expected_findings:
    - dimension: error-handling
      category: error_handling
      subcategory: edge_cases
      severity: ERROR
      anchor: "fetch(ANTHROPIC_URL"
      must_mention: ["timeout"]
- expected_score_band: "<=9.5"
- notes: "External HTTP call with no timeout, no res.ok check, no error handling."

---

## scenario: TYPE-001
- dimension: type-design
- intent: "coerce the answer body to the expected shape"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/routes/study/study.handlers.ts
    +++ b/nihongo/backend/src/routes/study/study.handlers.ts
    @@ -15,6 +15,8 @@
    -  const body = c.req.valid('json')
    +  const body = (await c.req.json()) as any
    +  const rating = body.rating as number
    ```
- expected_findings:
    - dimension: type-design
      category: type_safety
      subcategory: type_assertions
      severity: ERROR
      anchor: "as any"
      must_mention: ["any"]
- expected_score_band: "<=9.5"
- notes: "`as any` bypasses validation/typing; also drops Zod validation."

## scenario: TYPE-002
- dimension: type-design
- intent: "add a Kanji API type"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/shared/src/types/kanji.ts
    +++ b/nihongo/shared/src/types/kanji.ts
    @@ -1,3 +1,9 @@
    +export interface KanjiDto {
    +  id: string
    +  character: string
    +  strokeCount: number
    +  createdAt: Date
    +}
    ```
- expected_findings:
    - dimension: type-design
      category: shared_package
      subcategory: types
      severity: ERROR
      anchor: "KanjiDto"
      must_mention: ["derive"]
- expected_score_band: "<=9.5"
- notes: "Restates the kanji table row. Must derive via `$inferSelect` / `Pick` (CLAUDE.md: define once, never redefine)."

---

## scenario: CQ-001
- dimension: code-quality
- intent: "call the words list endpoint from the frontend"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/frontend/src/api/words.ts
    +++ b/nihongo/frontend/src/api/words.ts
    @@ -5,6 +5,8 @@
    +export const listWords = () =>
    +  client.get('/words')
    ```
- expected_findings:
    - dimension: code-quality
      category: frontend
      subcategory: api_layer
      severity: WARNING
      anchor: "'/words'"
      must_mention: ["endpoint", "constant"]
- expected_score_band: ">=8"
- notes: "Hardcoded URL string instead of API_ENDPOINTS from @nihongo/shared/constants."

## scenario: CQ-002
- dimension: code-quality
- intent: "show a primary button on the lesson end screen"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/frontend/src/components/lesson-end.vue
    +++ b/nihongo/frontend/src/components/lesson-end.vue
    @@ -2,3 +2,3 @@
    -  <button class="bg-primary text-on-primary">Done</button>
    +  <button class="bg-[#c0392b] text-white">Done</button>
    ```
- expected_findings:
    - dimension: code-quality
      category: frontend
      subcategory: components
      severity: WARNING
      anchor: "#c0392b"
      must_mention: ["token"]
- expected_score_band: ">=8"
- notes: "Raw hex in a template instead of the @theme tokens in style.css; also breaks dark mode."

---

## scenario: FILEINT-001
- dimension: file-integrity
- intent: "rename getWord to fetchWord in the words service"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/words.service.ts
    +++ /dev/null
    @@ -1,40 +0,0 @@
    -export async function getWord(id: string) {
    -  // ... entire 40-line file deleted ...
    -}
    ```
- expected_findings:
    - dimension: file-integrity
      category: file-integrity
      subcategory: accidental-deletion
      severity: ERROR
      must_mention: ["deleted", "service"]
- expected_score_band: "<5"
- notes: "A rename should touch one symbol, not delete the whole file. −2, near-certain commit blocker."

## scenario: FILEINT-002
- dimension: file-integrity
- intent: "resolve the merge and update the progress handler"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/routes/progress/progress.handlers.ts
    +++ b/nihongo/backend/src/routes/progress/progress.handlers.ts
    @@ -22,6 +22,11 @@
    +<<<<<<< HEAD
    +  const total = sumXp(rows)
    +=======
    +  const total = rows.reduce((a, b) => a + b.amount, 0)
    +>>>>>>> feature/xp
    ```
- expected_findings:
    - dimension: file-integrity
      category: file-integrity
      subcategory: conflict-marker
      severity: ERROR
      anchor: "<<<<<<< HEAD"
      must_mention: ["conflict"]
- expected_score_band: "<5"
- notes: "Committed merge-conflict markers — will not compile."

---

## scenario: REQ-001
- dimension: requirements
- intent: "implement DELETE /friends/:id so a learner can remove a friend"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/routes/friends/friends.handlers.ts
    +++ b/nihongo/backend/src/routes/friends/friends.handlers.ts
    @@ -60,6 +60,9 @@
    +export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
    +  // TODO: actually remove the friendship
    +  throw new Error('not implemented')
    +}
    ```
- expected_findings:
    - dimension: requirements
      category: requirements
      subcategory: incomplete-implementation
      severity: ERROR
      anchor: "not implemented"
      must_mention: ["incomplete", "TODO"]
- expected_score_band: "<=9"
- notes: "Handler is a stub — the stated feature is not delivered."

## scenario: REQ-002
- dimension: requirements
- intent: "add a non-nullable jlpt_level column to kanji"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/shared/src/db/schema/kanji.ts
    +++ b/nihongo/shared/src/db/schema/kanji.ts
    @@ -8,6 +8,7 @@ export const kanji = pgTable('kanji', {
       id: uuid('id').primaryKey().defaultRandom(),
    +  jlptLevel: integer('jlpt_level').notNull(),
    ```
- expected_findings:
    - dimension: requirements
      category: database
      subcategory: migrations
      severity: ERROR
      anchor: "jlptLevel"
      must_mention: ["default", "existing"]
- expected_score_band: "<=9"
- notes: "New NOT NULL column with no default breaks existing rows; also no drizzle-kit generated migration in the diff."

## scenario: REQ-003
- dimension: requirements
- intent: "award XP for every review"
- input_kind: diff
- input: |
    ```diff
    --- a/nihongo/backend/src/services/progress.service.ts
    +++ b/nihongo/backend/src/services/progress.service.ts
    @@ -30,6 +30,10 @@
    +export async function awardReviewXp(userId: string, amount: number) {
    +  await db.update(userProgress)
    +    .set({ xp: sql`${userProgress.xp} + ${amount}` })
    +    .where(eq(userProgress.userId, userId))
    +}
    ```
- expected_findings:
    - dimension: requirements
      category: requirements
      subcategory: domain-invariant
      severity: ERROR
      anchor: "userProgress.xp} + ${amount}"
      must_mention: ["replay", "xp_events"]
- expected_score_band: "<=9"
- notes: "An increment double-counts when the review log is replayed. XP must be keyed by log id in xp_events (CLAUDE.md: derived aggregates must be replay-safe)."
