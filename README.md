# 📓 Ragnar Notes

<p align="center">
  <img src="public/ragnar-icon.svg" width="80" alt="Ragnar Notes icon" />
</p>

<p align="center">
  <strong>A sleek, local-first Markdown note-taking app built with Tauri + React.</strong>
  <br/>
  macOS-native aesthetics. Blazing fast. Plain-file storage. No cloud lock-in.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stage-4%20Complete-0a84ff?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-0%20Errors-30d158?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Tauri-1.x-FFC131?style=flat-square&logo=tauri" />
  <img src="https://img.shields.io/badge/License-MIT-a1a1a6?style=flat-square" />
</p>

---

## ✨ Features

### 🎨 UI / Design
| Feature | Details |
|---------|---------|
| macOS-native design | Frosted glass, native colour tokens, smooth transitions |
| Dark / Light / Auto theme | Persists across reloads via localStorage; FOUC-free bootstrap |
| Three-pane layout | Sidebar → Note list → Editor, all independently animated |
| Framer Motion animations | Every transition, mount, and exit is fluid |
| Resizable Zen Mode | Hide all chrome; ultra-focused writing area |
| Split view | Edit + Preview side-by-side |
| Command Palette | `⌘K` — search notes, run commands, change theme |

### ✏️ Editor
| Feature | Details |
|---------|---------|
| Raw Markdown textarea | Monospace, syntax-aware, performant |
| Full Markdown preview | `marked` + GFM — tables, task lists, strikethrough, blockquotes |
| Syntax highlighting | `highlight.js` — 150+ languages, One Dark Pro theme |
| Callout blocks | `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, `> [!CAUTION]` |
| Code block copy button | One click to copy any code block |
| Wiki-links | `[[Note Title\|alias]]` — navigates to the target note |
| Keyboard formatting | `⌘B` Bold · `⌘I` Italic · `` ⌘` `` Code · `⌘⇧X` Strikethrough |
| Smart Enter | Auto-continues lists, task lists, ordered lists, blockquotes |
| Auto-close pairs | Wraps selected text with `()` `[]` `{}` `""` `` `` `` `**` `__` |
| AI paste normalization | Cleans AI-generated Markdown on paste |
| Font size & line height | Configurable per-user in Settings Panel |
| Spell check toggle | Browser-native, respects user preference |
| Auto-save | Configurable interval (0.5s – 10s), persists preferences |

### 📤 Export (Stage 4)
| Format | Details |
|--------|---------|
| **PDF** | Styled, print-optimized via `html2pdf.js`; A4 / Letter / Legal |
| **Markdown** | Raw `.md` file download |
| **HTML** | Standalone self-contained web page with embedded styles |
| Export Modal | Beautiful dialog with note metadata summary |

### 🗂️ Notes Management
| Feature | Details |
|---------|---------|
| Folder tree | Hierarchical sidebar, expand/collapse |
| Pin notes | Float to top of list |
| Tag filter chips | One-click filter by tag in NoteList |
| Sort modes | Recent (newest first) → A–Z → Oldest |
| Duplicate note | Copies content + metadata |
| Trash & restore | Soft-delete with restore; bulk "Empty Trash" |
| Context menu | Right-click for Pin / Duplicate / Export / Trash |
| Note statistics | Word count, char count, sentence count, reading time |

### ⚙️ Settings
| Setting | Options |
|---------|---------|
| Theme | Dark · Light · System (auto) |
| Font size | 12–22px slider |
| Line height | 1.3×–2.2× slider |
| Spell check | On / Off toggle |
| Auto-save interval | 0.5s, 1s, 2s, 5s, 10s |
| Reset to defaults | One-click restore |

---

## 🏗️ Architecture

```
src/
├── App.tsx                    # Root: theme hook, overlay state, global events
├── components/
│   ├── editor/
│   │   ├── EditorToolbar.tsx  # 16-button formatting toolbar
│   │   ├── MarkdownEditor.tsx # Raw textarea editor with smart behaviour
│   │   ├── MarkdownPreview.tsx# marked + hljs renderer with callouts
│   │   └── StatusBar.tsx      # Word/char/reading time + export shortcut
│   ├── features/
│   │   ├── CommandPalette.tsx # ⌘K palette — notes + commands + export
│   │   ├── ExportModal.tsx    # PDF / Markdown / HTML export dialog
│   │   ├── FolderTree.tsx     # Recursive folder tree
│   │   └── SettingsPanel.tsx  # Slide-out preferences panel
│   ├── layout/
│   │   ├── EditorPane.tsx     # Welcome screen + editor/preview routing
│   │   ├── NoteList.tsx       # Note cards with tag chips + context menu
│   │   ├── Sidebar.tsx        # Nav + vault header + new note CTA
│   │   └── TitleBar.tsx       # macOS traffic-light region + controls
│   └── ui/
│       ├── ContextMenu.tsx    # Right-click context menu
│       ├── EmptyState.tsx     # Reusable empty state component
│       ├── ThemeToggle.tsx    # Dark/Light/Auto pill selector
│       ├── Toast.tsx          # Global toast notification system
│       └── Tooltip.tsx        # Hover tooltip
├── hooks/
│   ├── useAutoSave.ts         # Debounced auto-save to notesStore
│   ├── useClickOutside.ts     # Dismiss modals on outside click
│   ├── useDebounce.ts         # Value debounce hook
│   ├── useKeyboardShortcut.ts # Global keyboard shortcut binder
│   ├── useLocalStorage.ts     # Typed localStorage hook
│   ├── useResizable.ts        # Drag-to-resize panels
│   └── useTheme.ts            # Theme class applicator (FIXED Stage 4)
├── stores/
│   ├── appStore.ts            # UI state + preferences (persisted)
│   ├── editorStore.ts         # Active note, mode, split, word counts
│   ├── notesStore.ts          # All notes, folders, trash, pins
│   └── searchStore.ts         # Search query + recent notes
├── utils/
│   ├── exportPdf.ts           # PDF / Markdown / HTML export logic
│   ├── format.ts              # Time, word count, byte formatting
│   ├── keyboard.ts            # Key event helpers
│   ├── markdown.ts            # AI paste normalization
│   └── cn.ts                  # clsx + tailwind-merge helper
└── lib/
    └── seedData.ts            # 6 rich seed notes for demo
```

---

## 🗺️ Roadmap

| Stage | Status | Description |
|-------|--------|-------------|
| **Stage 1** | ✅ Done | Project scaffold, Tauri setup, basic layout |
| **Stage 2** | ✅ Done | Zustand stores, note list, editor, command palette |
| **Stage 3** | ✅ Done | Markdown rendering, syntax highlighting, toolbar, zen mode |
| **Stage 4** | ✅ Done | PDF export, theme fix, settings persistence, tag filter, callouts |
| **Stage 5** | 🔜 Next | Tauri filesystem integration — real vault read/write |
| **Stage 6** | 🔜 Future | Full-text search with fuzzy match + index |
| **Stage 7** | 🔜 Future | Graph view — note connection visualization |
| **Stage 8** | 🔜 Future | AI assistant — note summarization + suggestions |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Rust** (for Tauri backend)
- **pnpm** or **npm**

### Development (web-only mode)

```bash
git clone https://github.com/VidhyadharanSS/RagnarNotes.git
cd RagnarNotes
npm install
npm run dev        # Vite dev server → http://localhost:1420
```

### Development (Tauri desktop)

```bash
npm run tauri dev  # Spawns Vite + Tauri window
```

### Production build

```bash
npm run build          # TypeScript + Vite bundle
npm run tauri build    # Full Tauri .app / .dmg / .exe
```

---

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open Command Palette |
| `⌘N` | New Note (sidebar) |
| `⌘/` | Toggle Sidebar |
| `⌘.` | Toggle Zen / Focus Mode |
| `⌘E` | Edit Mode |
| `⌘⇧P` | Preview Mode |
| `⌘⇧S` | Toggle Split View |
| `⌘⇧E` | Export Current Note |
| `⌘B` | **Bold** (wraps selection) |
| `⌘I` | *Italic* (wraps selection) |
| `` ⌘` `` | `Code` (wraps selection) |
| `⌘⇧X` | ~~Strikethrough~~ |
| `Tab` | Indent 2 spaces |
| `Esc` | Close overlay / palette |

---

## 🧩 State Management

### Stores (Zustand)

```
appStore    → Theme, sidebar, command palette, preferences (persisted to localStorage)
editorStore → Active note, mode, split view, word/char counts
notesStore  → All notes, folders, trash, pinned list
searchStore → Search query, recent notes list
```

### Theme System (Stage 4 Fix)

The theme toggle was broken in Stage 3 because `useTheme()` was never called.

**Root cause:** The hook existed but wasn't invoked anywhere in the component tree.

**Fix:**
1. `useTheme()` is now called at the top of `App.tsx`
2. `appStore` uses `zustand/persist` — theme preference survives reload
3. `index.html` has a blocking `<script>` that reads localStorage and applies the class before React mounts (prevents FOUC)
4. `useTheme` sets both `document.documentElement.classList` AND `style.colorScheme`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 1.x (Rust) |
| Frontend | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Animations | Framer Motion 11 |
| State | Zustand 4 (devtools + persist) |
| Markdown | `marked` (GFM) + custom renderer |
| Syntax highlight | `highlight.js` (150+ languages) |
| PDF export | `html2pdf.js` (jsPDF + html2canvas) |
| Icons | Lucide React |
| Build | Vite 5 |

---

## 📄 License

MIT © 2024 [VidhyadharanSS](https://github.com/VidhyadharanSS)
