/**
 * Literals for the seed SQL the pipeline writes. Seeds are plain .sql files run
 * once at boot, so values are inlined rather than bound.
 */

/** A string literal: `it's` → `'it''s'`. */
export const sqlText = (s: string) => `'${s.replace(/'/g, '\'\'')}'`

/** A jsonb literal of any JSON value. */
export const sqlJsonb = (v: unknown) => `${sqlText(JSON.stringify(v))}::jsonb`
