---
paths:
  - "*/frontend/src/composables/**/*.ts"
  - "*/web/src/composables/**/*.ts"
---

# Composable Rules

> Applies to any project's frontend composables folder (`<project>/<frontend>/src/composables/`). Naming/structure conventions below are universal.

## Naming

- File: `use-{name}.ts` (kebab-case with `use-` prefix)
- Export: `useXxx` function (camelCase)

## Structure

```typescript
import { ref } from 'vue'

// Module-level shared state (if state should be shared across components)
const sharedState = ref<SomeType>(initialValue)

export function useExample() {
  // Local state (if state should be per-component)
  const localState = ref(false)

  function doSomething() {
    // ...
  }

  // Return an object with all public API
  return {
    sharedState,
    localState,
    doSomething
  }
}
```

## Conventions

- Return an object (not array) with named properties
- Use `ref()` for reactive state, `computed()` for derived values
- Expose only the public API in the return object
- For shared state across components, define refs at module level (outside the function)
- For per-instance state, define refs inside the function
- Common composables (where established — e.g., nihongo): `useToast`, `useConfirm`, `useDate`, `useFormat`, `useStream`. Check what the current project provides before reimplementing.
