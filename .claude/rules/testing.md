# Testing Standards

Applies to: `**/*.test.ts`, `**/*.spec.ts`

## Banned Patterns — Zero Tolerance

These patterns produce tests that pass without validating anything. Never write them:

1. **Literal-to-literal assertions**
   ```ts
   // BANNED — always passes, tests nothing
   expect(true).toBe(true)
   expect(1).toBe(1)
   expect('hello').toBe('hello')
   ```

2. **Module-exists-only tests**
   ```ts
   // BANNED — if the import fails, the test file itself errors; this adds no value
   import { handler } from './handler'
   it('should export correctly', () => {
     expect(handler).toBeDefined()
   })
   ```

3. **Self-validating object tests**
   ```ts
   // BANNED — constructs data then asserts on the same data without calling real code
   const data = { name: 'test', value: 42 }
   expect(data.name).toBe('test')
   ```

4. **Placeholder tests**
   ```ts
   // BANNED — empty or stub tests that exist only to satisfy a test-count gate
   it('should work', () => {})
   it('TODO', () => { expect(true).toBeTruthy() })
   ```

## What Every Test Must Do

Every `it()` block must:

1. **Exercise real code** — call a function, method, handler, or render a component
2. **Assert on the outcome** — check return values, side effects, thrown errors, or rendered output
3. **Test a specific behavior** — the test name describes what the code does, and the assertion proves it

## Assertion Strength

Prefer specific assertions over existence checks:

| Weak (avoid)                          | Strong (prefer)                                 |
|---------------------------------------|------------------------------------------------|
| `expect(result).toBeDefined()`        | `expect(result).toEqual({ id: '...', ... })`  |
| `expect(el).toBeDefined()`            | `expect(el.text()).toBe('Submit')`             |
| `expect(fn).toHaveBeenCalled()`       | `expect(fn).toHaveBeenCalledWith(id, data)`    |
| `expect(arr.length).toBeGreaterThan(0)` | `expect(arr).toHaveLength(3)`               |

`toBeDefined()` is acceptable only when testing that an optional/nullable value is present **as part of a larger assertion block** — never as the sole assertion in a test.

## When Not to Write Tests

If a module genuinely has no testable logic yet (e.g., pure re-exports, type-only files, config), **do not create a placeholder test file**. It's better to have no test than a fake test that inflates coverage numbers. Track it as tech debt instead.
