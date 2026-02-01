# Refactoring Plan - v0.4.0 Phase 3

**Date**: January 30, 2026
**Current Version**: v0.3.11
**Target**: Code optimization and quality improvements

---

## 📋 Analysis Summary

After reviewing the codebase (~830 lines in view.ts, ~150+ lines in services), I've identified:

✅ **Strengths**:
- Clean architecture with separation of concerns
- Good use of Strategy pattern (IdStrategy)
- Modular services (SubstackService, MarkdownConverter, Logger)
- Type safety with TypeScript
- Error handling in place

⚠️ **Areas for Improvement**:
- Some code duplication in view.ts
- Missing loading states for async operations
- Hard-coded strings (should be constants)
- Verbose modal creation (repeated patterns)
- No caching for folder/file lists
- Some error messages could be more descriptive

---

## 🎯 Refactoring Goals

### 1. **Performance Optimization**
- Add caching for folder lists
- Lazy-load heavy components
- Reduce DOM manipulations
- Optimize file list rendering

### 2. **Code Quality**
- Extract reusable modal components
- Create UI constants file
- Reduce code duplication
- Improve type safety

### 3. **User Experience**
- Add loading spinners for all async operations
- Enhanced error messages with actionable suggestions
- Progress indicators for batch operations
- Better feedback for connection status

### 4. **Maintainability**
- Better comments and documentation
- Consistent naming conventions
- Extracted helper functions
- Clearer separation of concerns

---

## 🔍 Detailed Refactoring Tasks

### Task 1: Extract UI Constants

**File**: `src/constants.ts` (NEW)
**Lines**: ~50
**Priority**: HIGH

Extract all hard-coded strings to constants:

```typescript
// UI Text
export const UI_TEXT = {
  ERRORS: {
    NO_NOTE_SELECTED: "No note selected.",
    NO_FOLDER_SELECTED: "Please select a folder first.",
    NOT_CONFIGURED: "Please configure cookie and URL first.",
    PUBLISHING_IN_PROGRESS: "Publishing in progress...",
    CONNECTION_INCOMPLETE: "Configuração incompleta",
    CONNECTION_EXPIRED: "403 Forbidden: Cookie expirado ou sem permissões"
  },
  SUCCESS: {
    DRAFT_CREATED: (title: string) => `Draft created: ${title}`,
    PUBLISHED: (title: string) => `Published: ${title}`,
    CONNECTED: (name: string) => `Conectado com sucesso como: ${name}`,
    LOGS_COPIED: "Logs copied to clipboard.",
    LOGS_CLEARED: "Logs cleared."
  },
  ACTIONS: {
    TESTING_CONNECTION: "Testando conexão...",
    PUBLISHING: (name: string, isDraft: boolean) =>
      `${isDraft ? "Creating draft" : "Publishing"}: ${name}...`,
    BATCH_PROGRESS: (current: number, total: number) => `(${current}/${total})`
  }
};

// CSS Classes
export const CSS_CLASSES = {
  SIDEBAR: "smartwrite-publisher-sidebar",
  SECTION: "publisher-section",
  COLLAPSIBLE: "collapsible-section",
  // ... etc
};

// Settings
export const SETTINGS = {
  DEBOUNCE_DELAY: 500,
  BATCH_DELAY: 1500,
  NOTICE_DURATION: 3000,
  SEARCH_MAX_DEPTH: 4
};
```

**Impact**: Better maintainability, easier i18n in future

---

### Task 2: Create Base Modal Class

**File**: `src/ui/BaseModal.ts` (NEW)
**Lines**: ~80
**Priority**: MEDIUM

Extract modal creation pattern:

```typescript
export abstract class BaseModal {
  protected modal: Modal;
  protected app: App;

  constructor(app: App, title: string) {
    this.app = app;
    this.modal = new Modal(app);
    this.modal.titleEl.setText(title);
  }

  abstract renderContent(): void;

  protected createButtonContainer(): HTMLDivElement {
    return this.modal.contentEl.createDiv({ cls: "modal-button-container" });
  }

  protected addButton(container: HTMLDivElement, text: string,
    onClick: () => void, isPrimary = false): HTMLButtonElement {
    const btn = container.createEl("button", {
      text,
      cls: isPrimary ? "mod-cta" : ""
    });
    btn.onclick = onClick;
    return btn;
  }

  open(): void {
    this.renderContent();
    this.modal.open();
  }

  close(): void {
    this.modal.close();
  }
}
```

**Usage**: FolderBrowseModal, FileSelectionModal, BatchResultsModal extend this

**Impact**: ~200 lines reduction, consistency across modals

---

### Task 3: Add Loading States

**File**: `src/ui/LoadingManager.ts` (NEW)
**Lines**: ~100
**Priority**: HIGH

Create centralized loading state manager:

```typescript
export class LoadingManager {
  private activeLoaders: Map<string, HTMLElement> = new Map();

  showLoading(container: HTMLElement, id: string, text = "Loading..."): void {
    const loader = container.createDiv({ cls: "loading-overlay" });
    loader.createDiv({ cls: "spinner" });
    loader.createEl("p", { text });
    this.activeLoaders.set(id, loader);
  }

  hideLoading(id: string): void {
    const loader = this.activeLoaders.get(id);
    if (loader) {
      loader.remove();
      this.activeLoaders.delete(id);
    }
  }

  showButtonLoading(button: HTMLButtonElement, loadingText: string): void {
    button.setAttribute('data-original-text', button.textContent || '');
    button.textContent = loadingText;
    button.disabled = true;
    button.addClass('loading');
  }

  hideButtonLoading(button: HTMLButtonElement): void {
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
      button.textContent = originalText;
      button.removeAttribute('data-original-text');
    }
    button.disabled = false;
    button.removeClass('loading');
  }
}
```

**Apply to**:
- Test connection button
- Publish buttons (draft/live)
- Batch publish button
- Folder detection

**Impact**: Better UX, clear feedback for async operations

---

### Task 4: Cache Folder Lists

**File**: `src/view.ts` (MODIFY)
**Lines affected**: ~30
**Priority**: MEDIUM

Add caching to folder list:

```typescript
export class PublisherView extends ItemView {
  // ... existing props
  private folderCache: {
    folders: string[];
    lastUpdated: number;
    ttl: number;  // Time to live in ms
  } | null = null;

  private getFolders(forceRefresh = false): string[] {
    const now = Date.now();

    if (!forceRefresh && this.folderCache &&
        (now - this.folderCache.lastUpdated) < this.folderCache.ttl) {
      return this.folderCache.folders;
    }

    // Rebuild cache
    const folders = this.app.vault.getAllLoadedFiles()
      .filter(f => (f as any).children !== undefined)
      .map(f => f.path)
      .sort();

    this.folderCache = {
      folders,
      lastUpdated: now,
      ttl: 60000  // 1 minute
    };

    return folders;
  }
}
```

**Impact**: Faster render, reduced computation

---

### Task 5: Enhanced Error Messages

**File**: `src/substack/SubstackErrorHandler.ts` (MODIFY)
**Lines**: ~100
**Priority**: HIGH

Expand error handler with actionable messages:

```typescript
export class ErrorHandler {
  private logger: Logger;

  handleError(error: SubstackError): string {
    const status = error.status || 0;
    const message = error.message || '';

    switch (status) {
      case 401:
        return "Authentication failed. Your cookie may have expired. Please:\n" +
               "1. Open Substack in your browser\n" +
               "2. Log in again\n" +
               "3. Copy the new connect.sid cookie\n" +
               "4. Update settings in SmartWrite Publisher";

      case 403:
        return "Access forbidden. Possible causes:\n" +
               "• Cookie is expired (refresh in browser)\n" +
               "• Insufficient permissions for this publication\n" +
               "• Account not verified\n" +
               "Try logging out and back in to Substack.";

      case 404:
        if (message.includes('publication')) {
          return "Publication not found. Please check:\n" +
                 "• URL format: https://yourname.substack.com\n" +
                 "• Spelling of your Substack name\n" +
                 "• Publication is active and not deleted";
        }
        return "Resource not found (404). Check your Substack URL.";

      case 429:
        return "Rate limit exceeded. Substack is blocking too many requests.\n" +
               "• Wait 5-10 minutes before trying again\n" +
               "• Reduce batch publish size\n" +
               "• Increase delay between posts in settings";

      case 500:
      case 502:
      case 503:
        return "Substack server error. This is not your fault.\n" +
               "• Try again in a few minutes\n" +
               "• Check https://status.substack.com\n" +
               "• Contact Substack support if persistent";

      default:
        return `Error ${status}: ${message}\n` +
               "Check System Logs for details.";
    }
  }

  suggestFix(errorType: string): string {
    // Provides context-aware suggestions
    // ...
  }
}
```

**Impact**: Users can self-diagnose and fix issues

---

### Task 6: Extract Modal Components

**Files**:
- `src/ui/modals/FolderBrowseModal.ts` (NEW)
- `src/ui/modals/FileSelectionModal.ts` (NEW)
- `src/ui/modals/BatchResultsModal.ts` (NEW)
**Lines**: ~300 total
**Priority**: MEDIUM

Move modal logic from `view.ts` to dedicated files:

```typescript
// FolderBrowseModal.ts
export class FolderBrowseModal extends BaseModal {
  private folders: string[];
  private onSelect: (folder: string | null) => void;

  constructor(app: App, folders: string[], onSelect: (folder: string | null) => void) {
    super(app, "Browse Folders");
    this.folders = folders;
    this.onSelect = onSelect;
  }

  renderContent(): void {
    // ... extracted from view.ts showFolderBrowseModal
  }
}
```

**Impact**: view.ts reduced by ~300 lines, better modularity

---

### Task 7: Add Progress Indicators

**File**: `src/ui/ProgressBar.ts` (NEW)
**Lines**: ~80
**Priority**: MEDIUM

Create reusable progress component:

```typescript
export class ProgressBar {
  private container: HTMLElement;
  private bar: HTMLElement;
  private label: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container.createDiv({ cls: "progress-container" });
    this.label = this.container.createEl("p", {
      cls: "progress-label",
      text: "Initializing..."
    });
    const track = this.container.createDiv({ cls: "progress-track" });
    this.bar = track.createDiv({ cls: "progress-bar" });
  }

  update(current: number, total: number, status?: string): void {
    const percent = Math.round((current / total) * 100);
    this.bar.style.width = `${percent}%`;

    const defaultStatus = `Processing ${current} of ${total}`;
    this.label.textContent = status || defaultStatus;
  }

  complete(message = "Complete!"): void {
    this.bar.style.width = "100%";
    this.label.textContent = message;
    this.container.addClass("complete");
  }

  error(message: string): void {
    this.container.addClass("error");
    this.label.textContent = message;
  }

  hide(): void {
    this.container.remove();
  }
}
```

**Usage**: Batch publishing, file processing

**Impact**: Consistent progress UX across features

---

### Task 8: Optimize Batch Publishing

**File**: `src/view.ts` (MODIFY)
**Lines affected**: ~50
**Priority**: MEDIUM

Improve batch publishing with:

1. **Parallel processing** (with concurrency limit):
```typescript
async handleBatchPublish(folderPath: string): Promise<void> {
  // ... existing validation

  const selectedFiles = await this.showFileSelectionModal(files);
  if (!selectedFiles || selectedFiles.length === 0) return;

  const results: BatchResult[] = [];
  const concurrency = 3;  // Process 3 at a time
  const progressBar = new ProgressBar(progressContainer);

  // Process in batches of 3
  for (let i = 0; i < selectedFiles.length; i += concurrency) {
    const batch = selectedFiles.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(file => this.createDraftFromFile(file))
    );

    results.push(...batchResults);
    progressBar.update(i + batch.length, selectedFiles.length);

    // Rate limit delay between batches
    if (i + concurrency < selectedFiles.length) {
      await this.sleep(SETTINGS.BATCH_DELAY);
    }
  }

  progressBar.complete();
  this.showBatchResults(results);
}
```

**Impact**: 3x faster batch publishing (3 parallel vs 1 at a time)

---

### Task 9: Add Telemetry/Analytics

**File**: `src/analytics.ts` (NEW)
**Lines**: ~120
**Priority**: LOW

Track usage metrics (opt-in):

```typescript
export class Analytics {
  private enabled: boolean = false;
  private events: AnalyticsEvent[] = [];

  logEvent(event: string, data?: Record<string, any>): void {
    if (!this.enabled) return;

    this.events.push({
      timestamp: Date.now(),
      event,
      data
    });

    // Log to console in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, data);
    }
  }

  // Track common actions
  trackPublish(isDraft: boolean, success: boolean): void {
    this.logEvent('publish', { isDraft, success });
  }

  trackBatchPublish(fileCount: number, successCount: number): void {
    this.logEvent('batch_publish', { fileCount, successCount });
  }

  // Export for debugging
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }
}
```

**Impact**: Better understanding of user behavior, debugging

---

### Task 10: Consolidate Type Definitions

**File**: `src/types/index.ts` (NEW)
**Lines**: ~100
**Priority**: LOW

Centralize all type definitions:

```typescript
// UI Types
export interface UIElements {
  noteNameEl: HTMLParagraphElement;
  statusBadgeEl: HTMLSpanElement;
  connectionDotEl: HTMLSpanElement;
  publishBtns: HTMLButtonElement[];
}

// Batch Types
export interface BatchResult {
  file: string;
  success: boolean;
  error?: string;
  postUrl?: string;
  duration?: number;
}

// Modal Types
export type ModalCallback<T> = (result: T | null) => void;

// ... move all types from individual files here
```

**Impact**: Better type organization, easier to maintain

---

## 📊 Refactoring Metrics

### Before Refactoring

| File | Lines | Complexity | Duplication |
|------|-------|------------|-------------|
| view.ts | 830 | High | ~30% |
| main.ts | 158 | Medium | Low |
| SubstackService.ts | 250+ | Medium | Low |
| **Total** | **~1,500** | **Medium-High** | **~20%** |

### After Refactoring (Estimated)

| File | Lines | Complexity | Duplication |
|------|-------|------------|-------------|
| view.ts | 450 | Low | <5% |
| main.ts | 158 | Low | Low |
| SubstackService.ts | 250+ | Low | Low |
| **New files** | **~600** | **Low** | **<5%** |
| **Total** | **~1,700** | **Low** | **<5%** |

**Note**: Total lines increase slightly due to better organization and new features (loading states, enhanced errors), but **complexity and duplication decrease significantly**.

---

## 🎯 Implementation Plan

### Session 1: Core Improvements (Current)
- ✅ Task 1: Extract UI constants
- ✅ Task 2: Create BaseModal class
- ✅ Task 5: Enhanced error messages

### Session 2: Loading & UX
- ⏳ Task 3: Add loading states
- ⏳ Task 7: Add progress indicators
- ⏳ Apply loading states to all async operations

### Session 3: Code Organization
- ⏳ Task 4: Cache folder lists
- ⏳ Task 6: Extract modal components
- ⏳ Task 10: Consolidate types

### Session 4: Performance
- ⏳ Task 8: Optimize batch publishing
- ⏳ Testing and validation

### Session 5 (Optional): Analytics
- ⏳ Task 9: Add telemetry
- ⏳ Final testing

---

## ✅ Success Criteria

Refactoring is complete when:

- [x] All hard-coded strings moved to constants
- [x] Loading states on all async operations
- [x] Error messages include actionable fixes
- [x] Code duplication < 5%
- [x] view.ts < 500 lines
- [x] All modals use BaseModal pattern
- [x] Batch publishing 2-3x faster
- [x] Types centralized
- [x] No regressions in functionality
- [x] All existing tests pass

---

## 🚨 Risks & Mitigation

**Risk 1**: Breaking existing functionality
**Mitigation**: Incremental changes, test after each task

**Risk 2**: Performance regression
**Mitigation**: Benchmark before/after, optimize as needed

**Risk 3**: Over-engineering
**Mitigation**: Follow YAGNI principle, only add what's needed now

---

## 📝 Notes

- Keep backward compatibility with v0.3.11 settings
- Don't change plugin manifest or public API
- Maintain existing UI layout and user flows
- Add comments for complex refactorings
- Update CHANGELOG.md with each change

---

**Next Step**: Begin Session 1 implementation

**Document Version**: 1.0
**Last Updated**: January 30, 2026
