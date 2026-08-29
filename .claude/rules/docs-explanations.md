---
paths:
  - "*/docs/explanations/**/*.md"
---

# Documentation Explanations

> Applies to any project's `<project>/docs/explanations/` folder. Each project keeps its own explanations so a doc reads in the context of one app.

## Where explanations live

Explanatory documents go in the relevant project's `<project>/docs/explanations/` folder. When implementing a non-trivial feature that involves statistics, algorithms, or domain-specific concepts, write a companion explanation doc in that project's folder. If the project doesn't have a `docs/explanations/` folder yet, create it.

## Audience

Explanations must be accessible to **both technical and non-technical readers**:

- Start with a plain-English summary of what the feature does and why it exists (no jargon)
- Use concrete examples with real numbers — walk through the math step by step
- Include tables to make data and comparisons scannable
- Define every term before using it (e.g., explain "precision" before referencing it)
- Add a "when to care about this" section so readers know when the feature is relevant to them

## Structure

Follow this general pattern:

1. **What problem does this solve?** (1-2 paragraphs, no jargon)
2. **Core idea** (the mental model)
3. **Each metric/concept explained** (with worked numerical examples)
4. **When to care / practical guidance**
5. **Prerequisites or dependencies**
6. **Code location** (service, types, frontend view, API endpoint — use `<project>/...` paths)

## File naming

Use kebab-case matching the feature name: `evaluator-calibration.md`, `ab-testing-statistics.md`, `percentile-latency.md`.
