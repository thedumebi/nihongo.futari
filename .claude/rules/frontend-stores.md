---
paths:
  - "*/frontend/src/store/**/*.ts"
  - "*/frontend/src/stores/**/*.ts"
  - "*/web/src/store/**/*.ts"
  - "*/web/src/stores/**/*.ts"
---

# Pinia Store Rules

> **Project Resolution.** Applies to any project's Pinia stores (`<project>/<frontend>/src/store/` or `src/stores/`). Type imports come from the matching `@<project>/shared/types` package. See `.claude/project-profiles.md`.

## Store Definition Pattern

Use the Options API style with `defineStore`:

```typescript
import { defineStore } from 'pinia'

interface StoreState {
  items: ItemType[];
  loading: boolean;
}

export const useItemStore = defineStore('item', {
  state: (): StoreState => ({
    items: [],
    loading: false
  }),

  getters: {
    activeItems: state => state.items.filter(i => i.active),
    itemCount: state => state.items.length
  },

  actions: {
    async fetchItems() {
      this.loading = true
      try {
        // ...
      } finally {
        this.loading = false
      }
    },

    clearData() {
      this.items = []
    }
  }
})
```

## Conventions

- Export name: `useXxxStore` (e.g., `useAuthStore`, `useTeamStore`)
- File name: kebab-case matching the domain (e.g., `auth.ts`, `team.ts`)
- State: typed via interface, returned from a function
- Cross-store access: import and call other stores inside actions (`const teamStore = useTeamStore()`)
- Persistence: use `localStorage` with a namespaced key pattern (e.g., `${appTitle}-store-key` for nihongo; pick a similar prefix per project)
- Types: import from `@<project>/shared/types`
