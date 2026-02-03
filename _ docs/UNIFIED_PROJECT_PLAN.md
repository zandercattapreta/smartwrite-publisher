# Unified SmartWrite Publisher Project Plan

This document synthesizes the development plan for v0.4.0 (Professional Release) and the necessary steps for preparing the plugin for Obsidian submission into a single, phased project plan.

## Phase 0: Project Setup & Review

**Status: In Progress (Awaiting User Review and Approval)**

*   **Review Obsidian plugin submission rules**:
    *   Location: `_ docs/OBSIDIAN_PLUGIN_SUBMISSION_RULES.md`
    *   Description: Familiarize yourself with the official guidelines for submitting Obsidian plugins.
*   **Review the project's current status and identified changes**:
    *   Location: `_ docs/PLUGIN_SUBMISSION_PLAN.md`
    *   Description: Understand the proposed changes based on the comparison with the Obsidian sample plugin.
*   **Approve this unified plan**:
    *   Description: Confirm your agreement with the overall strategy and task breakdown before execution begins.

## Phase 1: Codebase Preparation for Multi-Platform & Submission Readiness

**Goal**: Establish a robust architectural foundation for multi-platform support and align the build process with Obsidian plugin submission requirements.

*   **1.1. Refactor Architecture for Multi-Platform (v0.4.0 Phase 1/2 from original plan)**:
    *   Design `BlogPlatformAdapter` interface.
    *   Plan `UniversalPost` abstraction.
    *   Design `PlatformManager` orchestration.
    *   Create adapter pattern diagrams.
    *   Define platform configuration structure.
    *   Extract Substack-specific code into `SubstackAdapter`.
    *   Create `BlogPlatformAdapter` interface (`src/core/BlogPlatformAdapter.ts`).
    *   Build `UniversalPost` abstraction (`src/core/UniversalPost.ts`).
    *   Create `PlatformManager` to handle multiple platforms (`src/core/PlatformManager.ts`).
    *   Refactor UI to be platform-agnostic.
*   **1.2. Implement Obsidian Plugin Submission Build Process Changes**:
    *   **Update `esbuild.config.mjs`**:
        *   Change the `outfile` path for `main.js` to `dist/main.js`.
        *   Add a step to copy `manifest.json` from the root to `dist/manifest.json`.
        *   Add a step to copy `styles.css` from the root to `dist/styles.css`.
        *   Ensure the build process handles any necessary transformations for `styles.css`.
    *   **Update `package.json` scripts**:
        *   Adjust build scripts to ensure they trigger `esbuild.config.mjs` correctly and clean the `dist/` directory before building.
        *   Review `dev-watch.sh` to ensure it watches the correct files and outputs to `dist/` during development.
        *   Review `release.sh` and `auto-release.sh` to ensure they correctly identify and package `main.js`, `manifest.json`, and `styles.css` from the `dist/` directory for GitHub releases.
    *   **Update `manifest.json`**:
        *   Change the `"main"` field in `manifest.json` from `"main.js"` to `"dist/main.js"`.
    *   **Verify `.gitignore`**:
        *   Ensure `dist/` is *not* in `.gitignore` if compiled assets are to be committed for releases, as is common practice for Obsidian plugins.

## Phase 2: Multi-Platform Implementation (v0.4.0 Phase 3 from original plan)

**Goal**: Integrate support for additional blogging platforms and enhance multi-platform publishing capabilities.

*   Implement `MediumAdapter`.
*   Implement `WordPressAdapter`.
*   Add platform registration system.
*   Create platform configuration storage.
*   Add platform status checking.
*   Implement platform selection UI.
*   Add platform selection checkboxes.
*   Create multi-platform confirmation modal.
*   Add per-platform status indicators.
*   Implement parallel publishing.
*   Create results dashboard.
*   Implement platform-specific features (Medium: Publication selection, canonical URLs; WordPress: Categories, featured images).

## Phase 3: GUI Installer (v0.4.0 Phase 5 from original plan)

**Goal**: Develop a user-friendly graphical installer for the plugin.

*   Choose installer framework (Electron/Tauri/Native).
*   Set up project structure for installer.
*   Implement Obsidian vault detection.
*   Implement installation logic (copy files, handle updates).
*   Design and implement installer UX (welcome, vault selection, progress, success/error screens).
*   Test installer on Windows, macOS, Linux.
*   Create platform-specific installers.

## Phase 4: Comprehensive Documentation & Polish (v0.4.0 Phase 4 from original plan)

**Goal**: Ensure all aspects of the plugin are thoroughly documented and the user experience is polished.

*   Write/Update `USER_GUIDE.md` (English, comprehensive, screenshots, tutorials).
*   Write/Update `API_DOCUMENTATION.md` (adapters, interfaces, config options, code examples).
*   Write/Update `FAQ.md` (common issues, platform-specific FAQs, error code reference).
*   Write/Update `TROUBLESHOOTING.md` (detailed error solutions).
*   Write/Update `CONTRIBUTING.md` (how to add new platforms, code standards, testing, PR process).
*   Add loading states with spinners.
*   Improve error message clarity.
*   Add tooltips and help text.
*   Enhance visual feedback.
*   Add keyboard shortcuts.
*   Clean up console logs.

## Phase 5: Final Testing & Submission

**Goal**: Conduct final testing and formally submit the plugin to the Obsidian community.

*   Comprehensive testing across platforms.
*   Update `CHANGELOG.md` and `README.md`.
*   Create release notes.
*   Tag v0.4.0 in Git.
*   Publish to GitHub releases (attach `main.js`, `manifest.json`, `styles.css` from `dist/`).
*   Submit plugin for review to Obsidian community.
*   Address review comments.
