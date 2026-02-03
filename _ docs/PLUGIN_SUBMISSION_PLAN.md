# Plan for Obsidian Plugin Submission

This document outlines the necessary steps and proposed changes to the SmartWrite Publisher plugin to prepare it for submission to the official Obsidian community plugin list.

## 1. Summary of Obsidian Plugin Submission Requirements

Based on the official developer documentation (`https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin`), key requirements include:

*   **GitHub Repository**: Publicly accessible with `README.md`, `LICENSE`, and `manifest.json`.
*   **GitHub Releases**: Each release must include `main.js`, `manifest.json`, and optionally `styles.css` as assets.
*   **Submission Process**: Create a Pull Request to the `community-plugins.json` file in the official Obsidian plugins repository.
*   **Quality & Security**: Plugin must be stable, functional, secure, and adhere to Obsidian's guidelines.

*(For full details, refer to `_ docs/OBSIDIAN_PLUGIN_SUBMISSION_RULES.md`)*

## 2. Analysis of Local Repository vs. Obsidian Sample Plugin

We compared our local repository structure and build process with the common practices observed in the `obsidian-sample-plugin` (`https://github.com/obsidianmd/obsidian-sample-plugin`).

### Current Local Repository Structure:

The plugin's source code is in `src/`. Compiled assets are currently outputted directly to the project root (e.g., `main.js`). We have `esbuild.config.mjs` for compilation, `package.json` for scripts, and `manifest.json` at the root.

### Key Differences/Areas for Alignment:

*   **Compiled Assets Location**: The sample plugin often uses a `dist/` or `build/` directory for compiled JavaScript and CSS. Our current setup outputs `main.js` to the root. Adopting a `dist/` folder is a cleaner and more standardized approach.
*   **Release Asset Management**: While we have release scripts, they need to be aligned with the new `dist/` output structure for creating GitHub release assets.
*   **`manifest.json` `main` field**: Needs to point to the correct path of `main.js` after compilation to `dist/`.

## 3. Proposed Changes to Local Repository

The following changes are proposed to align the SmartWrite Publisher with Obsidian's plugin submission best practices and streamline the release process. **No changes will be executed until approved.**

### 3.1. Update `esbuild.config.mjs`

**Goal**: Modify the build configuration to output all compiled assets (`main.js`, `manifest.json`, `styles.css`) into a dedicated `dist/` directory.

**Specific Actions**:
*   Change the `outfile` path for `main.js` to `dist/main.js`.
*   Add a step to copy `manifest.json` from the root to `dist/manifest.json`.
*   Add a step to copy `styles.css` from the root to `dist/styles.css`.
*   Ensure the build process handles any necessary transformations for `styles.css`.

### 3.2. Update `package.json` Scripts

**Goal**: Adjust existing build and release scripts to work with the new `dist/` output structure.

**Specific Actions**:
*   Review and update the `build` script to ensure it triggers `esbuild.config.mjs` correctly and cleans the `dist/` directory before building.
*   Review `dev-watch.sh` to ensure it watches the correct files and outputs to `dist/` during development.
*   Review `release.sh` and `auto-release.sh` to ensure they correctly identify and package `main.js`, `manifest.json`, and `styles.css` from the `dist/` directory for GitHub releases.

### 3.3. Update `manifest.json`

**Goal**: Ensure the plugin's entry point is correctly specified.

**Specific Actions**:
*   Change the `"main"` field in `manifest.json` from `"main.js"` to `"dist/main.js"`.

### 3.4. Update `.gitignore` (No Change Expected)

**Goal**: Ensure `dist/` is tracked for releases, but unnecessary temporary build artifacts are ignored.

**Specific Actions**:
*   `dist/` should *not* be added to `.gitignore`, as the compiled assets within it (`main.js`, `manifest.json`, `styles.css`) are intended to be committed as part of release tags for easier plugin installation via Obsidian's community plugins browser.
*   Ensure any temporary build files *within* `dist/` that should not be committed are correctly ignored by appropriate `.gitignore` entries (though `esbuild` typically produces clean output).

### 3.5. Review Release Process and Assets

**Goal**: Confirm that the overall release workflow is robust and produces the required assets for submission.

**Specific Actions**:
*   Test the full build and release process locally to ensure `main.js`, `manifest.json`, and `styles.css` are correctly generated in `dist/` and bundled as release assets.
*   Verify that `versions.json` is correctly updated during releases to reflect plugin compatibility.

---

## Conclusion

By implementing these changes, the SmartWrite Publisher will have a more standardized and robust build and release process, making it fully compliant with Obsidian's plugin submission requirements. This will streamline future updates and simplify the review process.

**Next Action**: Review and approval of this plan before execution.
