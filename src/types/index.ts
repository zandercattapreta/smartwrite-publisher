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
 * Plugin settings
 */
export interface PluginSettings {
	cookies: string;
	substackUrl: string;
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
