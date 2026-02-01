/**
 * SmartWrite Publisher - Base Modal Class
 * Reusable modal component to reduce code duplication
 * v0.4.0 - Refactoring Phase
 */

import { App, Modal } from 'obsidian';
import { CSS_CLASSES } from '../constants';

/**
 * Abstract base class for modals
 * Provides common functionality and reduces boilerplate
 */
export abstract class BaseModal<T = any> {
	protected modal: Modal;
	protected app: App;
	protected resolveCallback: ((value: T | null) => void) | null = null;

	constructor(app: App, title: string) {
		this.app = app;
		this.modal = new Modal(app);
		this.modal.titleEl.setText(title);
	}

	/**
	 * Abstract method to be implemented by subclasses
	 * Renders the modal content
	 */
	abstract renderContent(): void;

	/**
	 * Opens the modal
	 */
	open(): Promise<T | null> {
		return new Promise((resolve) => {
			this.resolveCallback = resolve;
			this.renderContent();
			this.modal.open();
		});
	}

	/**
	 * Closes the modal
	 */
	close(result: T | null = null): void {
		this.modal.close();
		if (this.resolveCallback) {
			this.resolveCallback(result);
			this.resolveCallback = null;
		}
	}

	/**
	 * Creates a button container div
	 */
	protected createButtonContainer(): HTMLDivElement {
		return this.modal.contentEl.createDiv({
			cls: CSS_CLASSES.MODAL_BUTTON_CONTAINER
		});
	}

	/**
	 * Adds a button to a container
	 * @param container - Parent container element
	 * @param text - Button text
	 * @param onClick - Click handler
	 * @param isPrimary - Whether button is primary (CTA style)
	 * @returns The created button element
	 */
	protected addButton(
		container: HTMLDivElement,
		text: string,
		onClick: () => void,
		isPrimary = false
	): HTMLButtonElement {
		const btn = container.createEl("button", {
			text,
			cls: isPrimary ? CSS_CLASSES.MOD_CTA : ""
		});
		btn.onclick = onClick;
		return btn;
	}

	/**
	 * Creates a paragraph element
	 */
	protected createParagraph(
		text: string,
		className?: string
	): HTMLParagraphElement {
		return this.modal.contentEl.createEl("p", {
			text,
			cls: className
		});
	}

	/**
	 * Creates a heading element
	 */
	protected createHeading(
		level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
		text: string,
		className?: string
	): HTMLHeadingElement {
		return this.modal.contentEl.createEl(level, {
			text,
			cls: className
		});
	}

	/**
	 * Creates a div container
	 */
	protected createContainer(className?: string): HTMLDivElement {
		return this.modal.contentEl.createDiv({
			cls: className
		});
	}

	/**
	 * Empties the modal content
	 */
	protected clearContent(): void {
		this.modal.contentEl.empty();
	}

	/**
	 * Adds a CSS class to the modal
	 */
	protected addModalClass(className: string): void {
		this.modal.contentEl.addClass(className);
	}
}
