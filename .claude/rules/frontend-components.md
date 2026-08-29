---
paths:
  - "*/frontend/src/components/**/*.vue"
  - "*/frontend/src/views/**/*.vue"
  - "*/web/src/components/**/*.vue"
  - "*/web/src/views/**/*.vue"
---

# Vue Component & View Rules

> **Project Resolution.** Paths use `<project>` and `<frontend>` placeholders — `<project>` is the leading folder of the file you're editing, `<frontend>` is `frontend/` for nihongo or `web/` for doca and projects from `/new-project`. Resolve `@<project>/shared/...` imports to the matching scope. See `.claude/project-profiles.md`.

> **Note:** the conventions below are documented for nihongo, which has the most established frontend. Smaller / newer projects (doca, fresh `/new-project` scaffolds) may not yet have all the same composables, UI primitives, or design-system constants. **Check `<project>/<frontend>/src/...` for what actually exists** before assuming an import is available — build the analogue or skip the convention with a note rather than inventing imports.

## Script Setup Structure

All components and views MUST use `<script setup lang="ts">`. Organize the script section in this exact order:

```
1. Type imports (import type { ... } from '@<project>/shared/types')
2. Vue imports (import { ref, computed, onMounted, watch } from 'vue')
3. Router imports (import { useRoute, useRouter } from 'vue-router')
4. API function imports (import { ... } from '@/api/...')
5. Component imports (import ... from '@/components/...')
6. Composable imports (import { useToast } from '@/composables/...')
7. Constant imports (import { ICONS, ROUTES } from '@/constants')
8. Store imports (import { useTeamStore } from '@/store/...')
```

Then organize the logic in this order with section comments:

```typescript
// ============ Stores ============
// ============ Composables ============
// ============ Reactive State ============
// ============ Computed Properties ============
// ============ Watchers ============
// ============ Lifecycle Hooks ============
// ============ Methods ============
```

## Props & Emits

Define props using an interface with `withDefaults`:

```typescript
interface Props {
  visible: boolean;
  title: string;
  maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-md'
})

const emit = defineEmits<{
  close: [];
  save: [data: SomeType];
}>()
```

## Icons - CRITICAL (when the project has an icon catalogue)

- NEVER inline SVG path strings in templates
- ALL icon paths MUST be defined in `<project>/<frontend>/src/constants/lucide-vue-next`
- Import and use: `import { ICONS } from '@/constants'`
- Reference in templates: `:d="ICONS.ICON_NAME"`

If the project doesn't yet have `constants/lucide-vue-next`, create it as part of your work — don't inline SVGs.

## Color System

The color rules below are **nihongo-specific**. Other projects may have their own palette — check existing components/views in `<project>/<frontend>/` before applying these blindly.

- Primary action color: **Olive** (`the @theme colour tokens`, `text-olive-600`)
- NEVER use green (`bg-green-*`) for primary actions - use olive
- Error states: crimson
- Warning states: yellow
- Info states: blue
- Dark background cards: `style="background-color: #303030;"` with `border border-gray-700`

## Reuse Existing UI Components

ALWAYS check `<project>/<frontend>/src/components/ui/` before building common UI from scratch. The components below are documented for **nihongo**; check what your project actually exports.

| Component | Import | Usage |
|-----------|--------|-------|
| `modal.vue` | `import Modal from '@/components/ui/modal.vue'` | Wrap modal content: `<Modal :visible="show" title="Title" @close="show = false">` |
| `tooltip.vue` | `import Tooltip from '@/components/ui/tooltip.vue'` | Wrap any element: `<Tooltip content="Help text">` |
| `toast-notification.vue` | Use `useToast()` composable | `showSuccess('Done!')`, `showError('Failed')`, `showWarning('Careful')` |
| `confirm-dialog.vue` | Use `useConfirm()` composable | `const confirmed = await showConfirm({ title, message, confirmText })` |
| `loading-state.vue` | `import LoadingState from '@/components/ui/loading-state.vue'` | Loading spinners and skeleton states |
| `page-dropdown.vue` | `import PageDropdown from '@/components/ui/page-dropdown.vue'` | Dropdown menus for page actions |
| `json-viewer.vue` | `import JsonViewer from '@/components/ui/json-viewer.vue'` | Display formatted JSON data |
| `feature-gate.vue` | `import FeatureGate from '@/components/ui/feature-gate.vue'` | Conditionally show content based on feature flags |

If the project doesn't have an equivalent for one of these, either build it or fall back to a minimal inline implementation — flag the gap so it can be addressed later.

## Reuse Composables — Never Redefine Existing Utilities

Before defining any helper or utility function inline in a component, ALWAYS check `<project>/<frontend>/src/composables/` first. If the function already exists in a composable, import and use it — do not redefine it.

**Example violation**: Defining a local `formatDate()` function when `useDate` composable already provides it.

```typescript
// WRONG — formatDate already exists in useDate composable (if the project has one)
function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

// RIGHT — import from the composable
import { useDate } from '@/composables/use-date'
const { formatDate } = useDate()
```

Additionally, when you notice the same logic repeated across multiple components (formatting, validation, API state management, etc.), extract it into a composable in `<project>/<frontend>/src/composables/` rather than duplicating it.

## Component Extraction

- Extract modals into separate component files (e.g., `create-prompt-modal.vue`)
- Modals MUST use the `Modal` wrapper from `@/components/ui/modal.vue` instead of reimplementing overlay/backdrop/close logic (when the project has one)
- Do NOT inline large modal templates in view files
- Views should focus on layout and data orchestration

## Template Patterns

- Loading states: spinner SVG with `animate-spin` and the project's primary color (`text-olive-600` for nihongo)
- Empty states: centered icon + heading + description
- Data grids: use `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`
- Card hover: project-specific (nihongo uses `hover:bg-[#414141] cursor-pointer transition-colors`)
- Navigation: use `ROUTES` constants, e.g., `router.push(ROUTES.PROMPT_EDITOR(id))`

## Error Handling in Views

```typescript
try {
  loading.value = true
  // ... api call
} catch (e: any) {
  showError(e.message || 'Failed to ...')
} finally {
  loading.value = false
}
```

## File Naming

- Components: `kebab-case.vue` (e.g., `create-prompt-modal.vue`)
- Views: `kebab-case.vue` (e.g., `prompt-editor.vue`)

## Tooltips
- Use `Tooltip` component for any UI element that may require user explanation, especially icons and headings. Provide clear, concise content that explains the purpose and functionality of the element. Position tooltips appropriately (e.g., `position="bottom"` for icons in headers).
