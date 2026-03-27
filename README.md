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
  <img src="https://img.shields.io/badge/Stage-5%20Complete-0a84ff?style=flat-square" />
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
| Dark / Light / Auto theme | Fully themed — code, prose, UI all adapt correctly |
| Three-pane layout | Sidebar → Note list → Editor, independently animated |
| Framer Motion animations | Every transition, mount, and exit is fluid |
| Zen Mode | Hide all chrome; ultra-focused writing area |
| Split view | Edit + Preview side-by-side |
| Command Palette | `⌘K` — search notes, run commands, change theme |
| Note Info Panel | Right slide-out: outline, backlinks, metadata, history |

### ✏️ Editor
| Feature | Details |
|---------|---------|
| Raw Markdown textarea | Monospace, syntax-aware, performant |
| Full Markdown preview | `marked` + GFM — tables, task lists, strikethrough, blockquotes |
| Syntax highlighting | `highlight.js` — 150+ languages, light + dark themes |
| Callout blocks | `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, `> [!CAUTION]` |
| Code block copy button | One click to copy any code block |
| Wiki-links | `[[Note Title\|alias]]` — navigates to the target note |
| Keyboard formatting | `⌘B` Bold · `⌘I` Italic · `` ⌘` `` Code · `⌘⇧X` Strikethrough |
| Smart Enter | Auto-continues lists, task lists, ordered lists, blockquotes |
| Auto-close pairs | Wraps selected text with `()` `[]` `{}` `""` `` `` `` `**` `__` |
| Font size & line height | Configurable per-user in Settings Panel |
| Spell check toggle | Browser-native, respects user preference |
| Auto-save | Configurable interval (0.5s – 10s) |

### 📤 Export (Stage 4 → Fixed in Stage 5)
| Format | Details |
|--------|---------|
| **PDF** | Theme-aware — dark mode = dark PDF, light mode = light PDF ✅ |
| **Markdown** | Raw `.md` file download |
| **HTML** | Standalone themed web page with embedded styles |
| Export Modal | Beautiful dialog with note metadata summary |

### 🗂️ Notes Management
| Feature | Details |
|---------|---------|
| Folder tree | Hierarchical sidebar, expand/collapse |
| Pin notes | Float to top (right-click or double-click) |
| Tag filter chips | One-click filter by tag in NoteList |
| Sort modes | Recent → A–Z → Oldest |
| Duplicate note | Copies content + metadata |
| Trash & restore | Soft-delete with restore; bulk "Empty Trash" |
| Context menu | Right-click for Pin / Duplicate / Export / Trash |
| Keyboard navigation | ↑↓ arrows to navigate notes, Enter to open |
| Search highlighting | Matched text highlighted in search results |

### 🔍 Stage 5: New Features
| Feature | Details |
|---------|---------|
| **Note Info Panel** | Slide-out right panel with outline, backlinks, stats, history |
| **Table of Contents** | Live-updating heading outline from note content |
| **Backlinks** | Shows all notes that link to the current note via `[[wiki-links]]` |
| **Note History** | Timeline showing creation and last edit dates |
| **Word Goal Widget** | Set daily word goals (100–5000), compact progress ring in status bar |
| **Reading Progress** | Thin progress bar at top when in preview mode |
| **Search Highlighting** | Search query text highlighted yellow in note titles |
| **Keyboard Navigation** | Arrow keys to select notes, Enter to open |
| **Double-click to Pin** | Quick pin toggle on double-click |
| **XSS Sanitization** | Input sanitization, HTML entity encoding, safe URL validation |
| **Theme-aware Export** | PDF/HTML export now matches current dark/light theme |
| **Light Mode Polish** | Improved text contrast, code highlighting, border colors |
| **Vault Statistics** | Welcome screen shows total notes, words, folders, tags |

### ⚙️ Settings
| Setting | Options |
|---------|---------|
| Theme | Dark · Light · System (auto) |
| Font size | 12–22px slider |
| Line height | 1.3×–2.2× slider |
| Spell check | On / Off toggle |
| Auto-save interval | 0.5s, 1s, 2s, 5s, 10s |
| Word goal | 100, 250, 500, 1k, 2k, 5k |
| Reset to defaults | One-click restore |

---

## 🏗️ Architecture

```
src/
├── App.tsx                       # Root: theme, overlays, global events
├── components/
│   ├── editor/
│   │   ├── EditorToolbar.tsx     # 16-button formatting toolbar
│   │   ├── MarkdownEditor.tsx    # Raw textarea with smart behaviour
│   │   ├── MarkdownPreview.tsx   # marked + hljs + wiki-link navigation
│   │   └── StatusBar.tsx         # Stats + word goal + export + info
│   ├── features/
│   │   ├── BacklinksPanel.tsx    # ★ Notes linking to current note
│   │   ├── CommandPalette.tsx    # ⌘K — notes + commands + export
│   │   ├── ExportModal.tsx       # PDF / Markdown / HTML export
│   │   ├── FolderTree.tsx        # Recursive folder tree
│   │   ├── NoteHistory.tsx       # ★ Created/updated timeline
│   │   ├── NoteInfoPanel.tsx     # ★ Right panel: outline + backlinks + meta
│   │   ├── OutlinePanel.tsx      # ★ Live heading outline (ToC)
│   │   ├── SettingsPanel.tsx     # Slide-out preferences panel
│   │   └── WordGoalWidget.tsx    # ★ Daily word goal progress ring
│   ├── layout/
│   │   ├── EditorPane.tsx        # Welcome screen + editor routing + info panel
│   │   ├── NoteList.tsx          # Note cards + keyboard nav + search highlight
│   │   ├── Sidebar.tsx           # Nav + vault header + new note CTA
│   │   ├── ResizeHandle.tsx      # Drag-to-resize panels
│   │   └── TitleBar.tsx          # macOS traffic-light region + controls
│   ├── onboarding/
│   │   └── VaultPicker.tsx       # First-launch vault selection
│   └── ui/
│       ├── ContextMenu.tsx       # Right-click context menu
│       ├── EmptyState.tsx        # Reusable empty state component
│       ├── NotificationBadge.tsx # Animated count badge
│       ├── ProgressBar.tsx       # Animated progress bar
│       ├── ReadingProgress.tsx   # ★ Thin scroll progress bar
│       ├── ThemeToggle.tsx       # Dark/Light/Auto pill selector
│       ├── Toast.tsx             # Global toast notification system
│       └── Tooltip.tsx           # Hover tooltip
├── hooks/
│   ├── useAutoSave.ts            # Debounced auto-save
│   ├── useClickOutside.ts        # Dismiss on outside click
│   ├── useDebounce.ts            # Value debounce hook
│   ├── useKeyboardShortcut.ts    # Global keyboard shortcut binder
│   ├── useLocalStorage.ts        # Typed localStorage hook
│   ├── useResizable.ts           # Drag-to-resize panels
│   └── useTheme.ts               # Theme applicator (dark/light/system)
├── stores/
│   ├── appStore.ts               # UI state + preferences (persisted)
│   ├── editorStore.ts            # Active note, mode, split, counts
│   ├── notesStore.ts             # Notes, folders, trash, pins
│   └── searchStore.ts            # Search query + recent notes
├── utils/
│   ├── cn.ts                     # clsx + tailwind-merge helper
│   ├── exportPdf.ts              # PDF / MD / HTML export (theme-aware)
│   ├── format.ts                 # Time, word count, byte formatting
│   ├── keyboard.ts               # Key event helpers
│   ├── markdown.ts               # AI paste normalization
│   └── sanitize.ts               # ★ XSS prevention + input sanitization
├── lib/
│   ├── seedData.ts               # 6 rich seed notes for demo
│   └── tauri.ts                  # Tauri API bridge (typed wrappers)
├── styles/
│   ├── globals.css               # Design tokens + ragnar-prose + light mode
│   └── highlight.css             # Syntax theme (dark + light)
└── types/
    ├── index.ts                  # Core type definitions
    ├── html2pdf.d.ts             # html2pdf.js type declaration
    └── vite-env.d.ts             # Vite env types
```

---

## 🗺️ Roadmap

| Stage | Status | Description |
|-------|--------|-------------|
| **Stage 1** | ✅ Done | Project scaffold, Tauri setup, basic layout |
| **Stage 2** | ✅ Done | Zustand stores, note list, editor, command palette |
| **Stage 3** | ✅ Done | Markdown rendering, syntax highlighting, toolbar, zen mode |
| **Stage 4** | ✅ Done | PDF export, theme fix, settings persistence, tag filter, callouts |
| **Stage 5** | ✅ Done | Note info panel, backlinks, outline, word goal, search highlight, light mode polish, XSS security, theme-aware export |
| **Stage 6** | 🔜 Next | Full-text search with fuzzy match + index |
| **Stage 7** | 🔜 Future | Graph view — note connection visualization |
| **Stage 8** | 🔜 Future | AI assistant — summarization + suggestions |

---

## 🔐 Security (Stage 5)

| Measure | Details |
|---------|---------|
| HTML entity encoding | User input escaped before rendering |
| Script tag stripping | `<script>` and `<iframe>` removed from rendered HTML |
| Event handler removal | `on*` attributes stripped from HTML output |
| Safe URL validation | `javascript:` and `data:text/html` URIs blocked |
| File name sanitization | Dangerous characters stripped from export filenames |
| Rate limiting utility | Prevents rapid repeated operations |

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
| `↑` `↓` | Navigate notes in list |
| `Enter` | Open selected note |
| `Tab` | Indent 2 spaces |
| `Esc` | Close overlay / palette |

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
