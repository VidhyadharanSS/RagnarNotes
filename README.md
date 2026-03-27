<p align="center">
  <img src="https://raw.githubusercontent.com/VidhyadharanSS/RagnarNotes/main/public/ragnar-icon.svg" width="80" />
</p>

<h1 align="center">Ragnar Notes</h1>

<p align="center">
  <strong>A sleek, high-performance macOS-style note-taking application</strong>
  <br />
  <em>Built with Tauri • React • TypeScript • Tailwind CSS</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stage-3%20%E2%9C%93-brightgreen" />
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue" />
  <img src="https://img.shields.io/badge/Framework-Tauri%20%2B%20React-orange" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## ✨ Features

### 🎨 Beautiful UI
- **macOS-native** design with frosted glass vibrancy and smooth animations
- **Three-pane layout** — Sidebar, Note List, and Editor with resizable panels
- **Dark / Light / System** theme support with seamless transitions
- **Framer Motion** powered micro-interactions on every element

### ✏️ Powerful Editor
- **Three editor modes**: Edit (raw Markdown), Preview (rendered), Zen (focus)
- **Split view** — Edit and preview side by side
- **Full Markdown rendering** with syntax-highlighted code blocks (powered by `marked` + `highlight.js`)
- **Formatting toolbar** — Bold, Italic, Code, Headings, Lists, Blockquotes, Code blocks with working actions
- **Tab indentation**, AI-paste normalization, auto-save

### ⚡ Command Palette
- Press **⌘K** to instantly search notes and run commands
- Fuzzy search across titles and content
- Built-in app commands with keyboard navigation
- Recent notes history

### 📂 File Organization
- **Folder tree** with recursive expand/collapse
- **Pin** your important notes for quick access
- **Trash** with restore capability
- **Tags** via YAML frontmatter
- **Context menus** on every note (right-click)

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command Palette |
| `⌘N` | New Note |
| `⌘/` | Toggle Sidebar |
| `⌘.` | Zen / Focus Mode |
| `⌘E` | Edit Mode |
| `⌘⇧P` | Preview Mode |
| `⌘⇧S` | Split View |
| `⌘B` | Bold |
| `⌘I` | Italic |
| `` ⌘` `` | Inline Code |

### 🦀 Rust Backend (Tauri)
- Atomic file read/write operations
- Native OS file/folder dialogs
- Minimal memory footprint — no Electron bloat
- Cross-platform (macOS, Windows, Linux)

---

## 🏗️ Architecture

```
RagnarNotes/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── editor/               # MarkdownEditor, Preview, Toolbar, StatusBar
│   │   ├── features/             # CommandPalette, FolderTree
│   │   ├── layout/               # TitleBar, Sidebar, NoteList, EditorPane
│   │   ├── onboarding/           # VaultPicker
│   │   └── ui/                   # Tooltip, ContextMenu, ThemeToggle, Toast, etc.
│   ├── hooks/                    # useKeyboardShortcut, useAutoSave, useTheme, etc.
│   ├── stores/                   # Zustand stores (app, editor, notes, search)
│   ├── utils/                    # cn, format, markdown, keyboard
│   ├── lib/                      # seedData, tauri bridge
│   ├── styles/                   # globals.css, highlight.js theme
│   └── types/                    # TypeScript type definitions
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── commands/             # fs.rs, app.rs — Tauri IPC commands
│   │   ├── error.rs              # AppError type
│   │   ├── models.rs             # NoteModel, FolderModel
│   │   └── main.rs               # Tauri builder
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/workflows/            # CI/CD pipeline
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## 🧩 State Management

Four Zustand stores with devtools middleware:

| Store | Purpose |
|-------|---------|
| `appStore` | Sidebar, routes, command palette, theme, preferences |
| `editorStore` | Active note, draft content, editor mode, word count |
| `notesStore` | Notes CRUD, folders, pins, trash, selectors |
| `searchStore` | Query, results, recent notes MRU list |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/VidhyadharanSS/RagnarNotes.git
cd RagnarNotes

# Install dependencies
npm install

# Start development server
npm run dev

# Run with Tauri (requires Rust toolchain)
npm run tauri dev
```

### Prerequisites

- **Node.js** ≥ 18
- **Rust** toolchain (for Tauri builds)
- **npm** ≥ 9

---

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 1420 |
| `npm run build` | TypeScript check + Vite production build |
| `npm run typecheck` | Run TypeScript compiler (no emit) |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format all source files |
| `npm run test` | Run Vitest test suite |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Tauri](https://tauri.app/) (Rust + Webview) |
| **Frontend** | [React 18](https://react.dev/) + TypeScript 5 |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **State** | [Zustand 4](https://github.com/pmndrs/zustand) |
| **Animation** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown** | [marked](https://marked.js.org/) + [highlight.js](https://highlightjs.org/) |
| **Build** | [Vite 5](https://vitejs.dev/) |
| **CI/CD** | GitHub Actions |

---

## 📍 Roadmap

- [x] **Stage 1** — Project scaffold, Zustand stores, all components, Tauri backend
- [x] **Stage 2** — Resizable panels, theme system, vault picker, keyboard shortcuts
- [x] **Stage 3** — Full markdown rendering, syntax highlighting, toolbar actions, toast system, UI polish
- [ ] **Stage 4** — Real Tauri filesystem integration, vault read/write
- [ ] **Stage 5** — Wiki-link navigation, backlinks panel, tag explorer
- [ ] **Stage 6** — Tiptap WYSIWYG editor, inline formatting
- [ ] **Stage 7** — Cloud sync, import/export, plugin system

---

## 📄 License

MIT © [VidhyadharanSS](https://github.com/VidhyadharanSS)
