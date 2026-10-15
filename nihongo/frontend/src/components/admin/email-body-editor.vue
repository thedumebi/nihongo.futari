<script setup lang="ts">
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Bold, FileCode, Heading2, Heading3, ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Underline as UnderlineIcon, Undo2, UserRound } from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'

import ImportHtmlModal from '@/components/admin/import-html-modal.vue'

/**
 * The body of an admin email, edited as formatted text.
 *
 * Only what survives in an inbox: headings, paragraphs, bold, italic,
 * underline, lists, quotes, links, images and a divider. HTML drafted
 * elsewhere comes in through Import HTML and becomes editable here.
 */
const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{ 'update:modelValue': [html: string] }>()

// ============ Reactive State ============
const importing = ref(false)
/** The small inline box for a link or image address — no browser prompts. */
const asking = ref<'link' | 'image' | null>(null)
const address = ref('')

// ============ Composables ============
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false, code: false }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Image
  ],
  editorProps: {
    attributes: { class: 'email-body min-h-[18rem] px-4 py-3 focus:outline-none' }
  },
  onUpdate: ({ editor: e }) => emit('update:modelValue', e.getHTML())
})

// ============ Watchers ============
// A body set from outside — loading a draft, importing HTML — replaces the content.
watch(() => props.modelValue, (html) => {
  if (editor.value && html !== editor.value.getHTML())
    editor.value.commands.setContent(html, false)
})

// ============ Lifecycle Hooks ============
onBeforeUnmount(() => editor.value?.destroy())

// ============ Methods ============
function ask(kind: 'link' | 'image') {
  asking.value = kind
  address.value = kind === 'link' ? String(editor.value?.getAttributes('link').href ?? '') : ''
}

function applyAddress() {
  const url = address.value.trim()
  const chain = editor.value?.chain().focus()
  if (asking.value === 'link') {
    if (url)
      chain?.extendMarkRange('link').setLink({ href: url }).run()
    else
      chain?.extendMarkRange('link').unsetLink().run()
  } else if (asking.value === 'image' && url) {
    chain?.setImage({ src: url }).run()
  }
  asking.value = null
}

function insertName() {
  editor.value?.chain().focus().insertContent('{{name}}').run()
}

function onImport(html: string) {
  editor.value?.commands.setContent(html, true)
}
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)]">
    <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] p-2">
      <button type="button" class="tool" :class="{ on: editor.isActive('heading', { level: 2 }) }" aria-label="Heading" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
        <Heading2 class="h-4 w-4" />
      </button>
      <button type="button" class="tool" :class="{ on: editor.isActive('heading', { level: 3 }) }" aria-label="Subheading" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
        <Heading3 class="h-4 w-4" />
      </button>
      <span class="mx-1 h-5 w-px bg-[var(--color-border)]" />
      <button type="button" class="tool" :class="{ on: editor.isActive('bold') }" aria-label="Bold" @click="editor.chain().focus().toggleBold().run()">
        <Bold class="h-4 w-4" />
      </button>
      <button type="button" class="tool" :class="{ on: editor.isActive('italic') }" aria-label="Italic" @click="editor.chain().focus().toggleItalic().run()">
        <Italic class="h-4 w-4" />
      </button>
      <button type="button" class="tool" :class="{ on: editor.isActive('underline') }" aria-label="Underline" @click="editor.chain().focus().toggleUnderline().run()">
        <UnderlineIcon class="h-4 w-4" />
      </button>
      <span class="mx-1 h-5 w-px bg-[var(--color-border)]" />
      <button type="button" class="tool" :class="{ on: editor.isActive('bulletList') }" aria-label="Bulleted list" @click="editor.chain().focus().toggleBulletList().run()">
        <List class="h-4 w-4" />
      </button>
      <button type="button" class="tool" :class="{ on: editor.isActive('orderedList') }" aria-label="Numbered list" @click="editor.chain().focus().toggleOrderedList().run()">
        <ListOrdered class="h-4 w-4" />
      </button>
      <button type="button" class="tool" :class="{ on: editor.isActive('blockquote') }" aria-label="Quote" @click="editor.chain().focus().toggleBlockquote().run()">
        <Quote class="h-4 w-4" />
      </button>
      <button type="button" class="tool" aria-label="Divider" @click="editor.chain().focus().setHorizontalRule().run()">
        <Minus class="h-4 w-4" />
      </button>
      <span class="mx-1 h-5 w-px bg-[var(--color-border)]" />
      <button type="button" class="tool" :class="{ on: editor.isActive('link') }" aria-label="Link" @click="ask('link')">
        <Link2 class="h-4 w-4" />
      </button>
      <button type="button" class="tool" aria-label="Image" @click="ask('image')">
        <ImageIcon class="h-4 w-4" />
      </button>
      <button type="button" class="tool gap-1 px-2 text-xs" aria-label="Insert the reader's name" @click="insertName">
        <UserRound class="h-4 w-4" /> Name
      </button>
      <span class="ml-auto" />
      <button type="button" class="tool" aria-label="Undo" @click="editor.chain().focus().undo().run()">
        <Undo2 class="h-4 w-4" />
      </button>
      <button type="button" class="tool" aria-label="Redo" @click="editor.chain().focus().redo().run()">
        <Redo2 class="h-4 w-4" />
      </button>
      <button type="button" class="tool gap-1 px-2 text-xs" @click="importing = true">
        <FileCode class="h-4 w-4" /> Import HTML
      </button>
    </div>

    <form v-if="asking" class="flex gap-2 border-b border-[var(--color-border)] p-2" @submit.prevent="applyAddress">
      <input
        v-model="address"
        type="url"
        class="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm"
        :placeholder="asking === 'link' ? 'https://… (empty removes the link)' : 'https://… image address'"
        autofocus
      >
      <button type="submit" class="tool px-3 text-sm">
        {{ asking === 'link' ? 'Set link' : 'Insert' }}
      </button>
      <button type="button" class="tool px-3 text-sm" @click="asking = null">
        Cancel
      </button>
    </form>

    <EditorContent :editor="editor" />
    <ImportHtmlModal v-model:open="importing" @import="onImport" />
  </div>
</template>

<style scoped>
.tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: var(--color-muted);
}
.tool:hover,
.tool.on {
  background: var(--color-card);
  color: var(--color-text);
}
:deep(.email-body h1) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
}
:deep(.email-body h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}
:deep(.email-body h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
}
:deep(.email-body p) {
  margin: 0 0 0.75rem;
}
:deep(.email-body ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
:deep(.email-body ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
:deep(.email-body blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-muted);
}
:deep(.email-body a) {
  text-decoration: underline;
}
:deep(.email-body img) {
  max-width: 100%;
  border-radius: 0.5rem;
}
:deep(.email-body hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1rem 0;
}
</style>
