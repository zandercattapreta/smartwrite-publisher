/**
 * SmartWrite Publisher - Loading Manager
 * Centralized loading state management for async operations
 * v0.4.0 - Refactoring Phase
 */

import { CSS_CLASSES } from '../constants';

/**
 * Manages loading states across the application
 * Provides consistent loading UI for async operations
 */
export class LoadingManager {
	private activeLoaders: Map<string, HTMLElement> = new Map();
	private buttonStates: Map<HTMLButtonElement, ButtonState> = new Map();

	/**
	 * Shows a loading overlay on a container
	 * @param container - Parent container to show loader in
	 * @param id - Unique identifier for this loader
	 * @param text - Loading text to display
	 */
	showLoading(container: HTMLElement, id: string, text = "Loading..."): void {
		// Remove existing loader if present
		this.hideLoading(id);

		// Create overlay
		const overlay = container.createDiv({ cls: CSS_CLASSES.LOADING_OVERLAY });

		// Create spinner
		overlay.createDiv({ cls: CSS_CLASSES.SPINNER });

		// Create text
		if (text) {
			overlay.createEl("p", { text });
		}

		// Store reference
		this.activeLoaders.set(id, overlay);
	}

	/**
	 * Hides a loading overlay
	 * @param id - Unique identifier of the loader to hide
	 */
	hideLoading(id: string): void {
		const loader = this.activeLoaders.get(id);
		if (loader) {
			loader.remove();
			this.activeLoaders.delete(id);
		}
	}

	/**
	 * Shows loading state on a button
	 * Disables button and changes text
	 * @param button - Button element
	 * @param loadingText - Text to show while loading
	 */
	showButtonLoading(button: HTMLButtonElement, loadingText: string): void {
		// Store original state
		const originalState: ButtonState = {
			text: button.textContent || '',
			disabled: button.disabled
		};
		this.buttonStates.set(button, originalState);

		// Apply loading state
		button.textContent = loadingText;
		button.disabled = true;
		button.addClass(CSS_CLASSES.LOADING);
	}

	/**
	 * Hides loading state on a button
	 * Restores original text and state
	 * @param button - Button element
	 */
	hideButtonLoading(button: HTMLButtonElement): void {
		const originalState = this.buttonStates.get(button);
		if (originalState) {
			button.textContent = originalState.text;
			button.disabled = originalState.disabled;
			button.removeClass(CSS_CLASSES.LOADING);
			this.buttonStates.delete(button);
		}
	}

	/**
	 * Shows inline loading spinner next to an element
	 * @param element - Element to show spinner next to
	 * @param id - Unique identifier
	 */
	showInlineLoading(element: HTMLElement, id: string): void {
		this.hideInlineLoading(id);

		const spinner = element.createSpan({ cls: `${CSS_CLASSES.SPINNER} inline-spinner` });
		this.activeLoaders.set(id, spinner);
	}

	/**
	 * Hides inline loading spinner
	 * @param id - Unique identifier
	 */
	hideInlineLoading(id: string): void {
		this.hideLoading(id);
	}

	/**
	 * Clears all active loaders
	 */
	clearAll(): void {
		// Remove all overlays
		this.activeLoaders.forEach(loader => loader.remove());
		this.activeLoaders.clear();

		// Restore all buttons
		this.buttonStates.forEach((state, button) => {
			button.textContent = state.text;
			button.disabled = state.disabled;
			button.removeClass(CSS_CLASSES.LOADING);
		});
		this.buttonStates.clear();
	}

	/**
	 * Checks if a specific loader is active
	 * @param id - Unique identifier
	 */
	isLoading(id: string): boolean {
		return this.activeLoaders.has(id);
	}

	/**
	 * Gets count of active loaders
	 */
	getActiveCount(): number {
		return this.activeLoaders.size;
	}
}

/**
 * Button state storage
 */
interface ButtonState {
	text: string;
	disabled: boolean;
}
