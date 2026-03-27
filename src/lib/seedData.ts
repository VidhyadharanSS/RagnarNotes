/**
 * Seed data — used during development so the UI has content to render.
 * This is injected into the Zustand stores on app load when no vault
 * path is configured (i.e., first launch / browser dev mode).
 */

import type { Note, Folder } from "@/types";

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

/* ── Folders ── */

export const SEED_FOLDERS: Folder[] = [
  {
    id: "folder-work",
    name: "Work",
    path: "/vault/Work",
    parentId: null,
    children: ["folder-projects", "folder-meetings"],
    isExpanded: true,
  },
  {
    id: "folder-projects",
    name: "Projects",
    path: "/vault/Work/Projects",
    parentId: "folder-work",
    children: [],
    isExpanded: false,
  },
  {
    id: "folder-meetings",
    name: "Meetings",
    path: "/vault/Work/Meetings",
    parentId: "folder-work",
    children: [],
    isExpanded: false,
  },
  {
    id: "folder-personal",
    name: "Personal",
    path: "/vault/Personal",
    parentId: null,
    children: ["folder-journal"],
    isExpanded: false,
  },
  {
    id: "folder-journal",
    name: "Journal",
    path: "/vault/Personal/Journal",
    parentId: "folder-personal",
    children: [],
    isExpanded: false,
  },
];

/* ── Notes ── */

export const SEED_NOTES: Note[] = [
  {
    id: "note-welcome",
    title: "Welcome to Ragnar Notes",
    folderId: "folder-work",
    filePath: "/vault/Work/welcome-to-ragnar-notes.md",
    isUnsaved: false,
    frontmatter: {
      title: "Welcome to Ragnar Notes",
      createdAt: lastWeek,
      updatedAt: now,
      tags: ["welcome", "getting-started"],
      pinned: true,
      aliases: ["intro", "start"],
    },
    content: `# Welcome to Ragnar Notes 🎉

Ragnar Notes is a **sleek, high-performance** macOS note-taking application built with:

- **Tauri** — Rust-powered native backend
- **React + TypeScript** — Type-safe frontend
- **Tiptap** — Superb WYSIWYG Markdown editor (Stage 3)
- **Zustand** — Blazing fast state management

## Key Features

### ✏️ Three Editor Modes
1. **Edit Mode** — Full WYSIWYG or raw Markdown editing
2. **Preview Mode** — Beautifully rendered, read-only view  
3. **Zen Mode** — Distraction-free writing (⌘.)

### ⚡ Command Palette
Press \`⌘K\` to instantly search notes and execute commands.

### 🗂️ File-System First
Your notes are plain \`.md\` files — no lock-in, forever yours.

---

## Code Example

\`\`\`typescript
import { useEditorStore } from "@stores/editorStore";

function MyComponent() {
  const mode = useEditorStore((s) => s.mode);
  return <div>Current mode: {mode}</div>;
}
\`\`\`

## Markdown Support

| Feature | Status |
|---------|--------|
| Headings | ✅ |
| Bold / Italic | ✅ |
| Code blocks | ✅ |
| Tables | ✅ |
| Wiki links | ✅ Stage 5 |
| Images | ✅ Stage 5 |

> "The best note-taking app is the one that gets out of your way."

See [[Getting Started]] for your next steps.
`,
  },
  {
    id: "note-getting-started",
    title: "Getting Started",
    folderId: "folder-work",
    filePath: "/vault/Work/getting-started.md",
    isUnsaved: false,
    frontmatter: {
      title: "Getting Started",
      createdAt: yesterday,
      updatedAt: yesterday,
      tags: ["guide"],
      pinned: false,
      aliases: ["setup", "install"],
    },
    content: `# Getting Started

## Set Your Vault

On first launch, Ragnar Notes will ask you to choose a **vault folder** — a directory on your filesystem where all your notes will be stored as plain \`.md\` files.

## Creating Notes

- Press **⌘N** to create a new note
- Use the **+ New Note** button in the sidebar
- Open the Command Palette (**⌘K**) and type the note name

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`⌘K\` | Command palette |
| \`⌘N\` | New note |
| \`⌘.\` | Toggle zen mode |
| \`⌘/\` | Toggle sidebar |
| \`⌘E\` | Edit mode |
| \`⌘P\` | Preview mode |

## Frontmatter

Every note supports YAML frontmatter for metadata:

\`\`\`yaml
---
title: My Note
tags: [work, ideas]
pinned: false
aliases: [my-note, mn]
---
\`\`\`
`,
  },
  {
    id: "note-ideas",
    title: "Ideas & Inspiration",
    folderId: "folder-personal",
    filePath: "/vault/Personal/ideas.md",
    isUnsaved: false,
    frontmatter: {
      title: "Ideas & Inspiration",
      createdAt: lastWeek,
      updatedAt: yesterday,
      tags: ["ideas", "personal"],
      pinned: false,
      aliases: [],
    },
    content: `# Ideas & Inspiration

## App Ideas
- A tool that converts hand-drawn diagrams to code
- A CLI that reads your meeting notes and drafts follow-up emails
- An AI that understands your note-taking style and suggests connections

## Reading List
- *Building a Second Brain* — Tiago Forte
- *How to Take Smart Notes* — Sönke Ahrens  
- *Deep Work* — Cal Newport

## Quote of the Week

> "The palest ink is better than the best memory." — Chinese Proverb
`,
  },
];
