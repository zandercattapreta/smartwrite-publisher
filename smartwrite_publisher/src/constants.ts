/**
 * SmartWrite Publisher - Constants
 * Centralized constants for UI text, CSS classes, and settings
 * v0.4.0 - Refactoring Phase
 */

// ==================== UI TEXT ====================

export const UI_TEXT = {
	ERRORS: {
		NO_NOTE_SELECTED: "No note selected.",
		NO_FOLDER_SELECTED: "Please select a folder first.",
		NOT_CONFIGURED: "Please configure cookie and URL first.",
		PUBLISHING_IN_PROGRESS: "Publishing in progress...",
		NO_FILES_SELECTED: "No files selected.",
		NO_FILES_FOUND: "No markdown files found in selected folder.",
		INVALID_FOLDER: "Please select a valid folder.",
		CONNECTION_INCOMPLETE: "Incomplete configuration",
		CONNECTION_EXPIRED: "403 Forbidden: Cookie expired or insufficient permissions",
		UNEXPECTED_ERROR: "Unexpected error while testing connection.",
		SERVICE_NOT_CONFIGURED: "Service not configured",
		SERVICE_NOT_CONNECTED: "Service not configured or not connected",
		PUBLICATION_NOT_FOUND: "Publication not found",
		CRITICAL_ONLOAD_FAILED: "SmartWrite Publisher: Critical failure on load:",
	},

	SUCCESS: {
		DRAFT_CREATED: (title: string) => `Draft created: ${title}`,
		PUBLISHED: (title: string) => `Published: ${title}`,
		CONNECTED: (name: string) => `Successfully connected as: ${name}`,
		LOGS_COPIED: "Logs copied to clipboard.",
		LOGS_CLEARED: "Logs cleared.",
		BATCH_COMPLETE_SUCCESS: (count: number) => `✓ Batch complete: ${count} draft(s) created successfully!`,
		BATCH_COMPLETE_PARTIAL: (success: number, failed: number) =>
			`Batch complete: ${success} success, ${failed} failed. Check logs for details.`,
	},

	ACTIONS: {
		TESTING_CONNECTION: "Testing connection...",
		CREATING_DRAFT: "Creating draft",
		PUBLISHING: "Publishing",
		PUBLISHING_FILE: (name: string, isDraft: boolean) =>
			`${isDraft ? "Creating draft" : "Publishing"}: ${name}...`,
		BATCH_PROGRESS: (current: number, total: number) => `(${current}/${total})`,
		PUBLISHING_BATCH: (current: number, total: number, name: string) =>
			`Publishing (${current}/${total}): ${name}...`,
		DETECTING_VAULTS: "Detecting...",
	},

	LABELS: {
		PLUGIN_TITLE: "SmartWrite Publisher",
		ACTIVE_NOTE: "Active Note",
		BATCH_PUBLISHING: "Batch Publishing",
		SUBSTACK_CONNECTION: "Substack Connection",
		SYSTEM_LOGS: "System Logs",
		COOKIE_SECRET: "Cookie Secret",
		URL_SUBSTACK: "URL Substack",
		NO_NOTE_ACTIVE: "No note selected",
		PENDING_STATUS: "Pending",
		DRAFT_STATUS: "Draft",
		PUBLISHED_STATUS: "Published",
		CREATE_DRAFT_BTN: "Create draft",
		PUBLISH_LIVE_BTN: "Publish live",
		SCHEDULE_BTN: "Schedule",
		PUBLISH_ALL_BTN: "Publish all as drafts",
		TEST_CONNECTION_BTN: "Test connection",
		BROWSE_BTN: "Browse",
		COPY_BTN: "Copy",
		CLEAR_BTN: "Clear",
		CONFIRM_BTN: "CONFIRM",
		CANCEL_BTN: "Cancel",
		CLOSE_BTN: "Close",
		SELECT_ALL_BTN: "Select All",
		UNSELECT_ALL_BTN: "Unselect All",
		YES_CREATE_DRAFTS_BTN: "Yes, create drafts",
		NO_EVENTS: "No events recorded.",
		COMING_SOON: "Coming soon",
		HOW_TO_USE: "How to use",
	},

	PLACEHOLDERS: {
		COOKIE_INPUT: "Paste your connect.sid cookie",
		URL_INPUT: "https://yourname.substack.com",
		FOLDER_INPUT: "Type or select a folder...",
		SELECT_FOLDER: "Select a folder...",
	},

	MODAL: {
		BROWSE_FOLDERS_TITLE: "Browse Folders",
		BROWSE_FOLDERS_SUBTITLE: "Select a folder from your vault:",
		NO_FOLDERS_FOUND: "No folders found in vault.",
		FOLDER_ROOT: "(root)",

		SELECT_FILES_TITLE: "Select Files to Publish",
		FILES_FOUND: (count: number) => `Found ${count} markdown file(s) in the selected folder.`,
		SELECT_FILES_SUBTITLE: "Select which files you want to publish as drafts:",

		BATCH_CONFIRM_TITLE: "Batch Publishing",
		BATCH_CONFIRM_MESSAGE: (count: number) => `You are about to create ${count} draft(s) in Substack.`,
		BATCH_CONFIRM_WARNING: "This action will:",
		BATCH_CONFIRM_PROCESS: (count: number) => `Process ${count} markdown file(s)`,
		BATCH_CONFIRM_CREATE: "Create one draft per file",
		BATCH_CONFIRM_TIME: (count: number) => `Take approximately ${Math.ceil(count * 1.5)} seconds`,
		BATCH_CONFIRM_QUESTION: "Do you want to continue?",

		BATCH_RESULTS_TITLE: "Batch Publishing Results",
		BATCH_RESULTS_COMPLETED: (count: number) => `Completed: ${count} file(s)`,
		BATCH_RESULTS_SUCCESS: (count: number) => `✓ Success: ${count}`,
		BATCH_RESULTS_FAILED: (count: number) => `✗ Failed: ${count}`,
		BATCH_RESULTS_DETAILS: "Details:",
	},
};

// ==================== CSS CLASSES ====================

export const CSS_CLASSES = {
	// Main container
	SIDEBAR: "smartwrite-publisher-sidebar",

	// Sections
	SECTION: "publisher-section",
	COLLAPSIBLE_SECTION: "collapsible-section",
	SETTINGS_SECTION: "settings-section",
	LOG_SECTION: "log-section",

	// Headers
	SIDEBAR_HEADER: "sidebar-header",
	SECTION_HEADER: "section-header",
	SECTION_TITLE_WITH_STATUS: "section-title-with-status",
	SECTION_CONTENT: "section-content",
	TITLE_CONTAINER: "title-container",

	// Icons and badges
	VERSION_BADGE: "version-badge",
	HELP_ICON: "help-icon",
	COLLAPSE_ICON: "collapse-icon",
	CLICKABLE_ICON: "clickable-icon",
	SORT_ARROW: "sort-arrow",

	// Note info
	NOTE_INFO: "note-info",
	NOTE_NAME: "note-name",
	STATUS_BADGE: "status-badge",
	STATUS_DOT: "status-dot",

	// States
	COLLAPSED: "collapsed",
	GREEN: "green",
	RED: "red",
	DRAFT: "draft",
	PUBLISHED: "published",
	LOADING: "loading",
	COMPLETE: "complete",
	ERROR: "error",

	// Buttons
	ACTION_BUTTONS: "action-buttons",
	MOD_CTA: "mod-cta",
	MOD_WARNING: "mod-warning",
	BROWSE_BTN: "browse-btn",
	SELECT_ALL_BTN: "select-all-btn",
	LOG_COPY_BTN: "log-copy-btn",
	LOG_CLEAR_BTN: "log-clear-btn",

	// Input
	INPUT_LABEL: "input-label",
	FOLDER_INPUT_CONTAINER: "folder-input-container",
	FOLDER_INPUT: "folder-input",
	SELECT_ALL_CONTAINER: "select-all-container",

	// Progress
	BATCH_PROGRESS: "batch-progress",
	PROGRESS_CONTAINER: "progress-container",
	PROGRESS_LABEL: "progress-label",
	PROGRESS_TRACK: "progress-track",
	PROGRESS_BAR: "progress-bar",
	LOADING_OVERLAY: "loading-overlay",
	SPINNER: "spinner",

	// Logs
	LOG_HEADER: "log-header",
	LOG_CONSOLE: "log-console",
	LOG_LINE: "log-line",
	LOG_TIME: "log-time",
	LOG_LEVEL: "log-level",
	LOG_MSG: "log-msg",
	EMPTY_LOG: "empty-log",

	// Modals
	FOLDER_BROWSE_MODAL: "folder-browse-modal",
	FOLDER_BROWSE_SUBTITLE: "folder-browse-subtitle",
	FOLDER_BROWSE_LIST: "folder-browse-list",
	FOLDER_BROWSE_ITEM: "folder-browse-item",
	EMPTY_FOLDER_LIST: "empty-folder-list",

	FILE_SELECTION_MODAL: "file-selection-modal",
	FILE_SELECTION_INFO: "file-selection-info",
	FILE_SELECTION_SUBTITLE: "file-selection-subtitle",
	FILE_LIST_WRAPPER: "file-list-wrapper",
	FILE_LIST_HEADER: "file-list-header",
	FILE_HEADER_TEXT: "file-header-text",
	FILE_LIST_CONTAINER: "file-list-container",
	FILE_ITEM: "file-item",
	FILE_CHECKBOX: "file-checkbox",
	FILE_LABEL: "file-label",

	MODAL_BUTTON_CONTAINER: "modal-button-container",

	BATCH_SUMMARY: "batch-summary",
	BATCH_SUMMARY_TOTAL: "batch-summary-total",
	BATCH_SUMMARY_SUCCESS: "batch-summary-success",
	BATCH_SUMMARY_ERROR: "batch-summary-error",
	BATCH_CONFIRM_WARNING: "batch-confirm-warning",
	BATCH_CONFIRM_QUESTION: "batch-confirm-question",
	BATCH_RESULTS_LIST: "batch-results-list",
	BATCH_RESULT_SUCCESS: "batch-result-success",
	BATCH_RESULT_ERROR: "batch-result-error",
	BATCH_ERROR_DETAIL: "batch-error-detail",
};

// ==================== SETTINGS ====================

export const SETTINGS = {
	// Performance
	DEBOUNCE_DELAY: 500,           // ms - delay for active-leaf-change event
	BATCH_DELAY: 1500,             // ms - delay between batch publish requests
	NOTICE_DURATION: 3000,         // ms - duration for notices
	FOLDER_CACHE_TTL: 60000,       // ms - folder list cache time-to-live (1 min)

	// Limits
	MAX_SEARCH_DEPTH: 4,           // max depth for vault searches
	BATCH_CONCURRENCY: 3,          // max parallel batch operations

	// Notice durations (0 = permanent until manually closed)
	NOTICE_PERMANENT: 0,
	NOTICE_SHORT: 2000,
	NOTICE_MEDIUM: 3000,
	NOTICE_LONG: 5000,
};

// ==================== DEFAULTS ====================

export const DEFAULTS = {
	COOKIE: '',
	SUBSTACK_URL: '',
};

// ==================== LOG LEVELS ====================

export const LOG_LEVELS = {
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
