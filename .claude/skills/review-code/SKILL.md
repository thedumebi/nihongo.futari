---
name: review-code
description: Run comprehensive code quality check (lint, performance, checklist) via parallel specialist agents, verify the findings, score the change, and emit the results to the terminal. Test execution and test-file conventions are handled separately by husky hooks. (optional workspace scope)
argument-hint: "[backend|frontend|shared] [intent]"
---

# Review Code

Act as a **senior TypeScript engineer and review lead**. You orchestrate a fan-out of specialist agents over the current code change, consolidate and verify their findings, score the change, and emit a strict plain-text scored summary to the terminal. This skill never writes files — the scored terminal block is its only output.

**This skill is a gatekeeper for code quality.** It runs in two contexts:
1. **Manually** via `/review-code [workspace] [intent]` while working.
2. **From the pre-commit hook** (`.husky/pre-commit`) via `claude --print "/review-code"` when `RUN_CODE_REVIEW` is set (`git commit-review`). The hook greps stdout for `FINAL SCORE: N / 10` and gates the commit (score <5 rejects, 5–8 prompts, >8 approves).

Because of (2), **the final stdout block in Phase 6 is a hard contract** — see the invariants there. Get everything else right, but never break that block.

## Eval mode

If `$ARGUMENTS` contains the token `--eval`, do NOT run the review. Instead spawn the `skill-eval-runner` agent (`subagent_type: "skill-eval-runner"`) pointing it at `.claude/skills/review-code/evals.md`, relay its results table, and stop. The rest of this document describes normal review mode.

---

## Out of scope (do not change)

- **Never run `pnpm test`** — the husky pre-commit hook does this as a hard gate before this skill runs.
- **Never report missing `.test.ts` files** — `.claude/hooks/check-conventions.sh` enforces that.
- Tests never affect the score here.

---

## Shell prefix (every Bash command)

The non-interactive shell needs node/pnpm on PATH, on the Node `.nvmrc` names. Prefix **every** Bash command with:

```
unset -f pnpm node npm npx 2>/dev/null; export PATH="$HOME/.nvm/versions/node/v$(sed 's/^v//' .nvmrc)/bin:$PATH"; <cmd>
```

---

## Phase 0 — Resolve scope

This repo holds one project, `nihongo` (the product is called `go`). The placeholders are fixed:

| Placeholder | Value |
|---|---|
| `<backend>` | `nihongo/backend` |
| `<frontend>` | `nihongo/frontend` |
| `<shared>` | `nihongo/shared` |
| `<shared-pkg>` | `@nihongo/shared` |

Parse `$ARGUMENTS`:

- If the **first whitespace token** is `backend`, `frontend` or `shared`, set `SCOPE = <token>` and `INTENT = remaining tokens`.
- Otherwise `SCOPE = all` and `INTENT = entire $ARGUMENTS`.
- `INTENT` is a free-text statement of what the change is meant to do; it may be empty. It feeds the requirements agent.

Lint/diff scope:
- `SCOPE = all` → lint `pnpm lint`; diff filter = all changed files.
- `SCOPE = <x>` → lint `pnpm -C nihongo/<x> exec eslint .`; diff filter = files under `nihongo/<x>/`, plus `nihongo/shared/` when `<x>` is `backend` or `frontend` (both import `@nihongo/shared`).

Print: `Reviewing scope: <SCOPE>` (and the intent if non-empty) so the user knows what's being checked.

---

## Phase 1 — Identify the changed lines (orchestrator does this once)

Compute the diff once and share it with every agent (so 7 agents don't each recompute it).

1. Author: `git config user.name` and `git config user.email`.
2. Staged check: `git diff --cached --name-only --diff-filter=ACMRD`.
   - **If staged files exist:** review ONLY the staged set. Diff = `git diff --cached`.
   - **If none staged:** fall back to unpushed commits:
     - `git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null` — if an upstream exists, use range `@{upstream}..HEAD`; else use `master..HEAD`. Filter commits by the current author. Diff = `git diff <range>`.
3. Apply the Phase 0 scope filter to the changed-file list.
4. Capture three things to pass to agents: the **raw unified diff**, the **changed-file list**, and the **per-file changed line ranges**. Remember which **range** you used (staged / `@{upstream}..HEAD` / `master..HEAD`) — file-integrity and requirements agents need it.

**Focus rule:** only changed lines are in scope. Agents may read surrounding code for context but must not report issues on untouched lines.

**Empty diff:** if nothing is in scope, skip to Phase 6 and emit a valid output with `FINAL SCORE: 10 / 10` and a note that there were no changes. Do not spawn agents.

---

## Phase 2 — Lint once (orchestrator)

Run the resolved lint command **once** (agents must not run lint). Turbo caches lint, so a passing `turbo lint` can hide errors from a cached run — when `SCOPE = all` and the diff touches a workspace, also run `pnpm -C nihongo/<x> exec eslint <changed files in x>` for that workspace:

```
unset -f pnpm node npm npx 2>/dev/null; export PATH="$HOME/.nvm/versions/node/v$(sed 's/^v//' .nvmrc)/bin:$PATH"; pnpm lint                              # SCOPE=all
unset -f pnpm node npm npx 2>/dev/null; export PATH="$HOME/.nvm/versions/node/v$(sed 's/^v//' .nvmrc)/bin:$PATH"; pnpm -C nihongo/<x> exec eslint .    # SCOPE=<x>
```

Record the count of lint **errors** (not warnings) on changed files — this feeds scoring.

---

## Phase 3 — Spawn the 7 dimension agents in parallel

In a **single message**, make 7 `Agent` tool calls, one per `subagent_type`:

`code-review-code-quality`, `code-review-error-handling`, `code-review-file-integrity`, `code-review-performance`, `code-review-requirements`, `code-review-security`, `code-review-type-design`.

Each agent prompt MUST include:

- The **raw unified diff** + changed-file list + per-file changed line ranges (the shared payload from Phase 1).
- `PROJECT=nihongo` and the placeholder map from Phase 0.
- `INTENT` (the requirements agent depends on it; others get it as context).
- For file-integrity and requirements: the **git range** you used in Phase 1.
- A reminder that lint already ran (don't suggest "run lint") and that tests are out of scope.
- A pointer to the repo's non-negotiables in `CLAUDE.md` ("Types: define once" and "Domain rules that are not negotiable") and to the path-scoped rules in `.claude/rules/` that match the changed files (e.g. `srs.md`, `etymology.md`, `migrations.md`, `shared-types.md`). A diff that breaks one of those is a finding even when the generic checklist is silent: a `payload jsonb` on `study_items`, a counter incremented instead of keyed by log id, a hand-written migration, a user-scoped query without `userId`, AI output reaching a user unreviewed.

Each agent already knows its checklist slice, finding format, and return contract from its definition file. Agents return plain-markdown finding blocks (or `NO FINDINGS`).

**Sampling:** agents grep for risk patterns first, then read targeted files — they should not read every file.

---

## Phase 4 — Verification

After the 7 agents return, spawn **one** `code-review-verification` agent (`subagent_type: "code-review-verification"`). Pass it: all raw findings concatenated, the unified diff + changed line ranges, `PROJECT` + placeholders, and the git range. It re-reads cited lines, drops hallucinations and out-of-scope findings, adjusts line numbers, deduplicates overlaps, and returns the **cleaned finding set** + a verification summary table. Use its cleaned set for scoring.

---

## Phase 5 — Consolidate & score (orchestrator)

Classify each verified finding as **WARNING** or **ERROR** (the agents already did; keep their call unless verification overrode it). ERROR = validation gap, missing env var, security vuln, breaking change without migration, accidental deletion, materially incomplete change, broken domain invariant from `CLAUDE.md`. WARNING = style/minor/suggestion.

Compute the score. **Start at 10**, apply deductions:

| Source | Deduction |
|---|---|
| Lint error (changed files) | −1 each |
| Performance **major** issue (perf finding marked major / ERROR) | −1 each |
| Security issue (any real `security`-dimension vuln) | −2 each |
| File-integrity ERROR (accidental deletion, conflict marker, dropped export) | −2 each |
| Requirements ERROR (incomplete / intent-not-met / broken migration) | −1 each |
| Pattern violation | −0.5 each |

**The "pattern violation" bucket is the catch-all for everything else**, so scoring is fully determined — never improvise a new rule. It covers, at −0.5 each:
- every `code-quality` finding (maintainability, consistency, frontend/api/constants conventions),
- every `type-design` finding (`as any`, non-exhaustive switch, duplicated/un-derived type, etc.),
- every `error-handling` finding (unhandled rejection, missing timeout, swallowed error) — **unless** it is security-relevant, in which case it's a security issue (−2),
- any `WARNING`-severity finding from any dimension.

Requirements **WARNING**s (e.g. scope creep) are informational — list them, no deduction.

**Hard cap:** if any **security vulnerability** is present, `score = min(score, 5)`.

Clamp to `[0, 10]`. The `FINAL SCORE` line must be an **integer** — round to nearest. (You may state a fractional value in the reasoning.)

Score bands for the recommendation text: 10 = clean; 8–9 = minor warnings only; 5–7 = moderate issues; 3–4 = significant; 1–2 = multiple critical failures.

---

## Phase 6 — Emit the hook-compatible plain-text block (the ONLY and LAST output)

This is the **final and only output** of the skill — the scored terminal block. No report is written to disk. It must be in **plain text only — no markdown**, using EXACTLY these labels. Invariants the pre-commit hook depends on:

- Exactly **one** line matching `^FINAL SCORE: <integer> / 10` (spaces around the slash exactly as shown).
- This block is emitted **last** (after any narration).
- Plain text — do not wrap `FINAL SCORE` in markdown bold.

```
WARNINGS (<count>):
<filename> line <line_number>
category: <Category Name>
sub category: <Subcategory Name>
test case: <Test Case Description>
description: <Concise description>
suggestion: <Actionable suggestion>

<repeat per WARNING>

ERRORS (<count>):
<filename> line <line_number>
category: <Category Name>
sub category: <Subcategory Name>
test case: <Test Case Description>
description: <Concise description>
suggestion: <Actionable suggestion>

<repeat per ERROR>

POTENTIAL ISSUES (<count>):
Issue: <Brief description>
Confidence: <LOW/MEDIUM/HIGH>
Evidence: <Brief explanation>

<repeat per LOW/MEDIUM-confidence finding>

FINAL SCORE: <Score> / 10
FINAL SCORE REASONING: <Concise explanation referencing the number and severity of issues>

SCORING RULES APPLIED:
- Lint errors: -1 per error
- Performance major issues: -1 per issue
- Security issues: -2 per issue
- File-integrity errors: -2 per issue
- Requirements errors: -1 per issue
- Pattern violations (code-quality / type-design / error-handling / any WARNING): -0.5 per issue
- Security vulnerability present: score capped at 5

OVERALL RECOMMENDATION: <Brief recommendation>

ACTION REQUIRED: <Specific actionable steps, or "None" if clean>
```

---

## Rules

1. **Tests are out of scope** — never run `pnpm test`, never report missing test files, never factor tests into the score.
2. **Focus on changed lines only** — never review the whole working tree.
3. **Relevance** — only report categories that apply to the change; do not pad.
4. **Confidence** — surface LOW/MEDIUM-confidence items under POTENTIAL ISSUES, not as hard ERRORs.
5. **Env vars = ERROR** — a referenced env var that isn't declared in `@nihongo/shared/env` is an ERROR, but **never read `.env` files** (access-denied); check the env schema or `.env.example` instead.
6. **Lint runs once** — in the orchestrator (Phase 2), never inside an agent.
7. **No nesting beyond one level** — dimension and verification agents are leaf agents; only the eval-runner spawns leaf agents, and only in `--eval` mode.
8. **Never write files** — no report on disk, no `code-reviews/` folder. Never modify source. This skill only reviews and prints the scored block to the terminal.
9. **Shell prefix** — every Bash command gets the nvm/PATH guard.
10. **Score contract** — Phase 6's block, with a single integer `FINAL SCORE: N / 10` line emitted last, is non-negotiable.
