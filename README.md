# SmartWrite Publisher (Obsidian Plugin)

**Current Version**: v1.0.0 (2026-02-02)

Publishing automation for **Substack** (and soon multiple blogging platforms) directly from your Obsidian vault.

## 🚀 What It Does

### ✅ Current Features (v1.0.0)

- **Native Integration**: Works directly in Obsidian's sidebar
- **Single Note Publishing**: Publish active note as Draft or Live
- **Batch Publishing**: Select a folder and publish multiple files at once
- **File Selection**: Choose which files to publish with interactive checkboxes
- **Sorting & Filtering**: Sort files alphabetically (A-Z / Z-A)
- **Smart Folder Selection**: Input with autocomplete + browse modal
- **Progress Tracking**: Real-time progress indicators (1/10, 2/10...)
- **Results Summary**: Detailed modal showing successes and failures
- **Markdown Conversion**: Automatically converts Markdown to Substack-compatible HTML
- **Error Handling**: Robust individual error handling in batch operations
- **Rate Limiting**: Automatic delay between requests to prevent API blocking

## 🛠️ Installation & Setup

1. **Activate Plugin**: After installing, click the "Broadcast" icon in the left sidebar ribbon.
2. **Configure Your Session**:
    - Go to **Quick Settings** section in the sidebar
    - Enter your `substack.sid` (obtained from browser cookies)
    - Enter your publication URL
3. **Test Connection**: Click "Test Connection". If the dot turns green, you're ready.

For detailed installation instructions, see [USER_GUIDE.md](./docs/USER_GUIDE.md).

## 📦 Development Phases

This project is being developed in phases:

- **v0.1.0**: ✅ Foundation, Sidebar, and Connectivity
- **v0.2.0**: ✅ Active Note Publishing (Phase 2 - Hotfixes v0.2.6.6-v0.2.6.10)
- **v0.3.x**: ✅ **Tiptap JSON Format** (Jan 29, 2026)
    - v0.3.0: Refactored Architecture with separation of concerns
        - Modular architecture with SubstackClient, PayloadBuilder, ErrorHandler, IdStrategy
        - Fixed: Cookie headers, Content-Type, Duplicate endpoints
    - v0.3.2: Tiptap JSON Implementation (Markdown → Tiptap JSON converter)
        - Fixed: HTML literal rendering issue
        - Converted: `draft_body` (string) → `bodyJson` (Tiptap JSON)
        - Added: Type-safe validation for both string (legacy) and Tiptap formats
        - Ready for batch publishing (Phase 3 feature-ready)

### Recent Version History

| Version | Date       | Status     | Description                                          |
| ------- | ---------- | ---------- | ---------------------------------------------------- |
| 0.3.11  | 01/30/2026 | ✅ Current | File list sorting with clickable arrow (▲/▼)         |
| 0.3.10  | 01/30/2026 | ✅ Stable  | Enhanced UI: file checkboxes, folder input + Browse  |
| 0.3.9   | 01/30/2026 | ✅ Stable  | Batch publishing, progress indicators, results modal |
| 0.3.8   | 01/30/2026 | ✅ Stable  | Fix: "Publish live" button now works                 |
| 0.3.7   | 01/29/2026 | ✅ Stable  | UI i18n (English), redesign connection section       |
| 0.3.6   | 01/29/2026 | ✅ Stable  | Collapsible sections, version badge                  |
| 0.3.5   | 01/29/2026 | ✅ Stable  | Multiple content fields test (word_count debug)      |
| 0.3.4   | 01/29/2026 | ✅ Stable  | Plain markdown format, empty posts investigation     |
| 0.3.3   | 01/29/2026 | ✅ Stable  | Parser bug fixes, empty posts correction             |
| 0.3.0   | 01/29/2026 | ✅ Stable  | Complete architecture refactoring                    |

**See full history**: [CHANGELOG.md](./CHANGELOG.md)

---

## 🗺️ Roadmap

### ✅ Phase v0.3.x - Batch Publishing & UI (COMPLETED)

**Status**: ✅ Completed (2026-01-30)

**Delivered**:

- Publish live button fix
- Batch publishing (multiple drafts from folder)
- File selection with checkboxes
- Select all/unselect all
- Folder input with autocomplete + Browse
- File list sorting (A-Z / Z-A)
- Progress indicators and results summary

**See**: [PHASE_SUMMARY_v0.3_BatchPublishing.md](./../\_ docs/PHASE_SUMMARY_v0.3_BatchPublishing.md)

---

**Current Version**: v1.1.0 (2026-02-02)

Publishing automation for **Substack** (and soon multiple blogging platforms) directly from your Obsidian vault.

### Version v1.2.0: Professional Release (IN PROGRESS)

**Status**: In Progress (2026-02-02)
**Priority**: High
**Estimated Timeline**: 20-25 sessions (~6 weeks)

**Vision**: Transform SmartWrite Publisher into a professional-grade multi-platform publishing tool

**Components**:

1.  **Official Documentation** (COMPLETED)
    - Comprehensive USER_GUIDE.md
    - FAQ.md with common questions
    - TROUBLESHOOTING.md guide
    - API_DOCUMENTATION.md for developers
    - CONTRIBUTING.md for contributors

2.  **GUI Installer** (IN PROGRESS)
    - Electron-based cross-platform installer
    - Auto-detect Obsidian vaults
    - One-click installation
    - Windows, macOS, Linux support

3.  **Code Refactoring** (PLANNED)
    - Performance optimization
    - Remove redundancies
    - Enhanced error messages
    - Loading states and animations

4.  **Multi-Platform Publishing** (PLANNED)
    - Medium adapter (Tier 1)
    - WordPress adapter (Tier 1)
    - Ghost adapter (Tier 1)
    - Publish to multiple platforms simultaneously
    - Platform-specific settings

**See**: [PLAN_v1.2.0_Professional_Release.md](./../\_ docs/PLAN_v1.2.0_Professional_Release.md)

---

### Version v1.3.0: Advanced Features (FUTURE)

**Status**: Backlog
**Priority**: Medium

**Planned**:

- Additional platforms (Dev.to, Hashnode, Blogger, Tumblr, LinkedIn)
- Analytics dashboard (compare platform performance)
- Content sync across platforms
- A/B testing (different titles per platform)
- Automated cross-posting rules
- Platform templates
- Image optimization per platform
- Scheduling (if platforms support)

**See**: [PLAN_v1.3.0_Advanced_Features.md](./../\_ docs/PLAN_v1.3.0_Advanced_Features.md)

---

## 🛠️ Build & Development

For developers:

```bash
npm install
npm run build
```

The automated build copies necessary files to your vault's plugin folder (as configured in `esbuild.config.mjs`).

### Project Structure & Repository Refactoring

**Last Refactoring**: 2026-02-01

This repository recently underwent a significant refactoring to simplify its structure and improve maintainability.

- **Monorepo Structure**: The project is now a single, self-contained repository. The previous submodule-based approach has been eliminated.
- **Source Code Location**: All source code, documentation, and project files for the `smartwrite-publisher` plugin are located directly within this repository.
- **Ignored Directories**: Local development folders (`_ BKPs`, `_ docs`, `_ skills`, `_ test files`) and environment-specific configuration files (`.agent`, `.claude`) are now explicitly ignored by Git and will not be part of the repository.

This change ensures that cloning the repository provides the full source code without requiring extra steps to initialize submodules.

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📚 Documentation

- **[User Guide](./docs/USER_GUIDE.md)** - Complete installation and usage guide
- **[FAQ](./docs/FAQ.md)** - Frequently asked questions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Technical details for developers
- **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute to the project

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Developed by [Zander Catta Preta](https://github.com/zandercpzed/smartwrite-publisher).
