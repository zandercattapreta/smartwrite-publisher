/**
 * SmartWrite Publisher - Type Definitions
 * Centralized type definitions for the application
 * v0.4.0 - Refactoring Phase
 */

import { TFile } from 'obsidian';

// ==================== BATCH PUBLISHING TYPES ====================

/**
 * Result of a batch publish operation
 */
export interface BatchResult {
	file: string;
	success: boolean;
	error?: string;
	postUrl?: string;
	duration?: number;
}

/**
 * Batch publish status
 */
export interface BatchStatus {
	current: number;
	total: number;
	fileName: string;
	success: number;
	failed: number;
}

// ==================== MODAL TYPES ====================

/**
 * Modal callback type
 */
export type ModalCallback<T> = (result: T | null) => void;

/**
 * Folder browse result
 */
export interface FolderBrowseResult {
	folder: string | null;
}

/**
 * File selection result
 */
export interface FileSelectionResult {
	files: TFile[];
}

/**
 * Batch results modal data
 */
export interface BatchResultsData {
	results: BatchResult[];
}

// ==================== UI COMPONENT TYPES ====================

/**
 * UI element references
 */
export interface UIElements {
	noteNameEl: HTMLParagraphElement;
	statusBadgeEl: HTMLSpanElement;
	connectionDotEl: HTMLSpanElement;
	publishBtns: HTMLButtonElement[];
}

/**
 * Folder cache entry
 */
export interface FolderCache {
	folders: string[];
	lastUpdated: number;
	ttl: number;
}

/**
 * Loading state identifier
 */
export type LoadingId =
	| 'connection-test'
	| 'publish-draft'
	| 'publish-live'
	| 'batch-publish'
	| 'folder-detect';

// ==================== PLUGIN TYPES ====================

/**
 * Platform type identifier
 */
export type PlatformType = 'substack' | 'medium' | 'wordpress';

/**
 * Platform-specific credential storage
 */
export interface PlatformCredentials {
	substack?: {
		cookie: string;
	};
	medium?: {
		integrationToken: string;
	};
	wordpress?: {
		username: string;
		applicationPassword: string;
	};
}

/**
 * Configuration for a single platform
 */
export interface PlatformConfig {
	type: PlatformType;
	url: string;
	credentials: PlatformCredentials;
}

/**
 * Frontmatter metadata extracted from markdown
 */
export interface FrontmatterData {
	title?: string;
	subtitle?: string;
	description?: string;
	tags?: string[] | string;
	categories?: string | string[];
	category?: string;
	author?: string;
	visibility?: string;
	date?: string;
	[key: string]: any; // Allow any additional fields
}

/**
 * Platform capability flags
 */
export interface PlatformCapabilities {
	supportsTags: boolean;
	supportsCategories: boolean;
	supportsScheduling: boolean;
	supportsVisibility: boolean;
	supportsMultipleAuthors: boolean;
	supportsUpdate: boolean;
	supportsDelete: boolean;
	tagLimit?: number;
}

/**
 * Plugin settings
 */
export interface PluginSettings {
	// Legacy settings (deprecated, kept for migration)
	cookies?: string;
	substackUrl?: string;
	
	// New multi-platform settings
	platforms: PlatformConfig[];
	activePlatform: PlatformType;
	defaultAuthor?: string;
	defaultVisibility?: 'public' | 'private' | 'password';
	autoExtractFrontmatter: boolean;
}

// ==================== CONVERSION TYPES ====================

/**
 * Markdown conversion result
 */
export interface ConversionResult {
	title: string;
	subtitle: string;
	html: string | any;
}

// ==================== UTILITY TYPES ====================

/**
 * Sleep utility return type
 */
export type SleepPromise = Promise<void>;

/**
 * Async operation status
 */
export interface OperationStatus {
	isLoading: boolean;
	error?: string;
	success?: boolean;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * File sort state
 */
export interface FileSortState {
	direction: SortDirection;
	files: TFile[];
}

// ==================== RE-EXPORTS ====================

// Re-export Substack types for convenience
export type {
	SubstackUserInfo,
	PublishOptions,
	PublishResult,
	ConnectionConfig,
	SubstackError
} from '../substack/types';
