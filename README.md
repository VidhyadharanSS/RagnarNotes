# 📓 Ragnar Notes

<p align="center">
  <img src="public/ragnar-icon.svg" width="80" alt="Ragnar Notes icon" />
</p>

<p align="center">
  <strong>A sleek, local-first Markdown note-taking app for macOS.</strong><br/>
  Built with Tauri + React. No cloud. No sync. Your notes, your machine.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0-0a84ff?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-0%20Errors-30d158?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tests-132%20Passed-30d158?style=flat-square" />
  <img src="https://img.shields.io/badge/Tauri-1.x-FFC131?style=flat-square&logo=tauri" />
  <img src="https://img.shields.io/badge/Platform-macOS-000000?style=flat-square&logo=apple" />
  <img src="https://img.shields.io/badge/License-MIT-a1a1a6?style=flat-square" />
</p>

---

## 📦 Installation (macOS)

### Option A — Download the DMG Release *(Easiest)*

1. Go to [**Releases →**](https://github.com/VidhyadharanSS/RagnarNotes/releases)
2. Download **`Ragnar.Notes_1.1.0_aarch64.dmg`** (Apple Silicon) or **`_x64.dmg`** (Intel)
3. Open the `.dmg` file
4. **Drag "Ragnar Notes"** into your `/Applications` folder
5. Double-click to launch

> **macOS Gatekeeper warning?**  
> Go to **System Settings → Privacy & Security → scroll down → click "Open Anyway"**  
> This is expected for apps not distributed via the App Store.

---

### Option B — Build from Source

**Prerequisites:**

| Tool | Version | Install |
|------|---------|---------|
| macOS | 12+ (Monterey) | — |
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Xcode CLI | latest | `xcode-select --install` |

**Build steps:**

```bash
# 1. Clone
git clone https://github.com/VidhyadharanSS/RagnarNotes.git
cd RagnarNotes

# 2. Install frontend dependencies
npm install

# 3. Build the macOS app
npm run tauri build

# Output files:
# ▸ src-tauri/target/release/bundle/dmg/Ragnar Notes_1.1.0_aarch64.dmg
# ▸ src-tauri/target/release/bundle/macos/Ragnar Notes.app
```

Open the `.dmg` and drag to **Applications**, or double-click `Ragnar Notes.app` directly.

---

### Option C — Development Mode

```bash
# Web preview (browser, no native shell)
npm run dev           # → http://localhost:1420

# Native window with hot-reload
npm run tauri dev     # spawns real macOS window
```

---

## ✨ What's New in v1.1.0

### 🎨 Font Picker — 14 Fonts in 3 Categories

Open **Settings → Typography** to choose your writing font:

| Category | Fonts |
|----------|-------|
| **Sans-serif** | Inter, Geist, DM Sans, Nunito, Source Sans 3, IBM Plex Sans, Space Grotesk, System Default |
| **Serif** | Merriweather, Lora, Playfair Display, Crimson Pro |
| **Monospace** | JetBrains Mono, Fira Code |

### 🎨 10 Accent Colors

Blue · Purple · Indigo · Green · Teal · Cyan · Orange · Rose · Pink · Amber

### 🏷️ Note Color Labels *(New UI Feature)*

Right-click any note → **Color Label** → pick from 8 colors.
- A colored dot appears next to the note title
- The note row gets a subtle color tint
- Hover actions include a quick color picker button

### 👁️ Hover Preview Cards *(New UI Feature)*

Hover over a note for 600ms → a floating preview card appears showing:
- Note title + excerpt
- Reading time, tags, last modified time

### 🌟 Animated Welcome Screen *(Enhanced UI Feature)*

- Animated concentric rings behind the app icon
- Glowing accent dot animation
- Feature highlight cards (Markdown-first, Local & Private, Instant Search)
- Gradient-tinted New Note button

---

## 🎛️ All Features

| Category | Feature |
|----------|---------|
| **Editor** | Full GFM Markdown — tables, task lists, code blocks, wiki-links |
| **Editor** | Syntax highlighting (150+ languages) |
| **Editor** | Split view (Edit + Preview side-by-side) |
| **Editor** | Zen / Focus mode — distraction-free writing |
| **Editor** | Smart Enter — auto-continues lists, tasks, blockquotes |
| **Editor** | Callout blocks `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]` |
| **Notes** | Pin notes — float to top |
| **Notes** | **Color labels** — 8 colors, visual organization |
| **Notes** | **Hover preview** — floating card on 600ms hover |
| **Notes** | Tags & tag filter chips |
| **Notes** | Bulk select — multi-select for bulk trash/delete/export |
| **Notes** | Import `.md` files — browse or drag-drop |
| **Notes** | Duplicate notes |
| **Export** | PDF, Markdown, HTML export |
| **Export** | Bulk export — select multiple notes → export all |
| **Storage** | Full local persistence (localStorage, survives reload) |
| **Storage** | Storage manager — view usage, import/export, clear data |
| **Settings** | **14 font families** (sans, serif, mono) |
| **Settings** | **10 accent colors** |
| **Settings** | Font size (12–22px), Line height (1.3–2.4) |
| **Settings** | Editor width, compact mode, spell check, word count |
| **Settings** | Auto-save delay (0.5s–10s) |
| **UI** | Dark / Light / Auto theme |
| **UI** | Command palette (`⌘K`) |
| **UI** | Note info panel (outline, backlinks, metadata, history) |
| **UI** | Word goal widget with progress ring |
| **UI** | Reading progress bar |
| **Security** | XSS prevention, HTML sanitization |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command Palette / Search |
| `⌘N` | New Note |
| `⌘/` | Toggle Sidebar |
| `⌘.` | Zen / Focus Mode |
| `⌘E` | Edit Mode |
| `⌘⇧P` | Preview Mode |
| `⌘⇧S` | Split View |
| `⌘⇧E` | Export Note |
| `⌘B` | **Bold** |
| `⌘I` | *Italic* |
| `` ⌘` `` | `Inline Code` |
| `⌘⇧X` | ~~Strikethrough~~ |
| `↑↓` | Navigate note list |
| `Enter` | Open keyboard-focused note |
| `Esc` | Close any modal/panel |

---

## 🧪 Tests

```bash
npm test              # run all 132 tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

**132 tests across 9 files:**

| File | Tests |
|------|-------|
| `utils/sanitize.test.ts` | 26 |
| `utils/format.test.ts` | 22 |
| `utils/markdown.test.ts` | 19 |
| `utils/keyboard.test.ts` | 14 |
| `stores/notesStore.test.ts` | 17 |
| `stores/editorStore.test.ts` | 12 |
| `stores/appStore.test.ts` | 9 |
| `utils/cn.test.ts` | 8 |
| `stores/searchStore.test.ts` | 5 |

---

## 🏗️ Architecture

```
RagnarNotes/
├── src/
│   ├── components/
│   │   ├── editor/         MarkdownEditor, EditorToolbar, MarkdownPreview, StatusBar
│   │   ├── features/       CommandPalette, ExportModal, BulkExportModal,
│   │   │                   SettingsPanel, StorageManager, NoteInfoPanel, …
│   │   ├── layout/         Sidebar, NoteList, EditorPane, TitleBar
│   │   ├── onboarding/     VaultPicker
│   │   └── ui/             Toast, Tooltip, ContextMenu, HoverPreview,
│   │                       NoteColorPicker, ThemeToggle, …
│   ├── hooks/              useTheme, useAutoSave, useKeyboardShortcut, …
│   ├── stores/             appStore, editorStore, notesStore, searchStore
│   ├── utils/              format, sanitize, keyboard, markdown, fonts, exportPdf
│   ├── lib/                seedData, tauri bridge
│   ├── styles/             globals.css, highlight.css
│   └── types/              index.ts (all TypeScript types)
├── src-tauri/              Rust / Tauri backend
│   └── src/commands/       fs.rs, app.rs
├── package.json            v1.1.0
└── tauri.conf.json         macOS bundle config
```

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
| Syntax | `highlight.js` (150+ languages) |
| PDF | `html2pdf.js` |
| Fonts | Google Fonts (Inter, Geist, Merriweather, …) |
| Testing | Vitest + Testing Library |
| Build | Vite 5 |

---

## 📄 License

MIT © 2024 [VidhyadharanSS](https://github.com/VidhyadharanSS)
