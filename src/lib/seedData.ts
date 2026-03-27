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
  {
    id: "note-project-plan",
    title: "Project Planning Guide",
    folderId: "folder-projects",
    filePath: "/vault/Work/Projects/project-planning.md",
    isUnsaved: false,
    frontmatter: {
      title: "Project Planning Guide",
      createdAt: lastWeek,
      updatedAt: now,
      tags: ["planning", "productivity", "work"],
      pinned: true,
      aliases: ["planning"],
    },
    content: `# Project Planning Guide

A lightweight framework for planning any project in Ragnar Notes.

## Task List

- [x] Define project scope and objectives
- [x] Create initial folder structure
- [ ] Set up development environment
- [ ] Write comprehensive tests
- [ ] Deploy to production

## Priority Matrix

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 High | Core architecture | Team Lead | In Progress |
| 🟡 Medium | UI polish | Designer | Pending |
| 🟢 Low | Documentation | Tech Writer | Draft |

## Code Snippet

\`\`\`typescript
interface ProjectConfig {
  name: string;
  version: string;
  stages: Stage[];
  deadline: Date;
}

function calculateProgress(tasks: Task[]): number {
  const completed = tasks.filter(t => t.done).length;
  return Math.round((completed / tasks.length) * 100);
}
\`\`\`

## Timeline

> **Week 1**: Research & Planning
> **Week 2**: Core Development  
> **Week 3**: Testing & QA  
> **Week 4**: Launch 🚀

See also: [[Getting Started]], [[Ideas & Inspiration]]
`,
  },
  {
    id: "note-meeting-notes",
    title: "Weekly Standup Notes",
    folderId: "folder-meetings",
    filePath: "/vault/Work/Meetings/weekly-standup.md",
    isUnsaved: false,
    frontmatter: {
      title: "Weekly Standup Notes",
      createdAt: yesterday,
      updatedAt: yesterday,
      tags: ["meetings", "standup"],
      pinned: false,
      aliases: ["standup"],
    },
    content: `# Weekly Standup Notes

## Monday — Sprint Review

### What was accomplished
- Completed the sidebar component with folder tree
- Implemented command palette with fuzzy search
- Set up CI/CD pipeline on GitHub Actions

### What's planned
- Full markdown rendering with \`marked\` + \`highlight.js\`
- Toast notification system
- Toolbar formatting actions

### Blockers
- None currently — clear path forward 🎯

---

## Action Items

1. Review PR for editor refactor
2. Schedule design review meeting
3. Update project README

> **Next meeting**: Friday at 10:00 AM
`,
  },
  {
    id: "note-journal",
    title: "Today's Journal Entry",
    folderId: "folder-journal",
    filePath: "/vault/Personal/Journal/today.md",
    isUnsaved: false,
    frontmatter: {
      title: "Today's Journal Entry",
      createdAt: now,
      updatedAt: now,
      tags: ["journal", "reflection"],
      pinned: false,
      aliases: [],
    },
    content: `# Today's Journal Entry

## 🌅 Morning Reflection

Started the day with a clear mind and a cup of coffee. The sunrise was beautiful — golden light streaming through the window.

## 📝 Key Thoughts

- **Creativity** flows best when you're not trying to force it
- Small consistent actions beat big sporadic efforts
- Writing down ideas helps crystallize them

## 🎯 Goals for Today

- [x] Write morning pages
- [ ] Read 20 pages of current book
- [ ] Take a 30-minute walk
- [ ] Work on Ragnar Notes for 2 hours

## 💡 Random Ideas

> "We do not remember days; we remember moments." — Cesare Pavese

---

*This is the kind of note that makes Ragnar Notes feel like home.*
`,
  },
];
