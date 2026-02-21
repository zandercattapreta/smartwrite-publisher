/**
 * SmartWrite Publisher - Progress Bar Component
 * Reusable progress indicator for batch operations
 * v0.4.0 - Refactoring Phase
 */

import { CSS_CLASSES } from '../constants';

/**
 * Progress bar component for tracking long-running operations
 */
export class ProgressBar {
	private container: HTMLElement;
	private labelEl: HTMLElement;
	private trackEl: HTMLElement;
	private barEl: HTMLElement;
	private currentPercent = 0;

	/**
	 * Creates a new progress bar
	 * @param parentContainer - Parent element to append progress bar to
	 */
	constructor(parentContainer: HTMLElement) {
		// Main container
		this.container = parentContainer.createDiv({
			cls: CSS_CLASSES.PROGRESS_CONTAINER
		});

		// Label
		this.labelEl = this.container.createEl("p", {
			cls: CSS_CLASSES.PROGRESS_LABEL,
			text: "Initializing..."
		});

		// Track (background)
		this.trackEl = this.container.createDiv({
			cls: CSS_CLASSES.PROGRESS_TRACK
		});

		// Bar (fill)
		this.barEl = this.trackEl.createDiv({
			cls: CSS_CLASSES.PROGRESS_BAR
		});

		// Initialize to 0%
		this.barEl.setCssStyles({ width: "0%" });
	}

	/**
	 * Updates progress
	 * @param current - Current progress value
	 * @param total - Total progress value
	 * @param status - Optional status message
	 */
	update(current: number, total: number, status?: string): void {
		// Calculate percentage
		const percent = Math.round((current / total) * 100);
		this.currentPercent = Math.min(100, Math.max(0, percent));

		// Update bar width with smooth animation
		this.barEl.setCssStyles({ width: `${this.currentPercent}%` });

		// Update label
		const defaultStatus = `Processing ${current} of ${total}`;
		this.labelEl.textContent = status || defaultStatus;
	}

	/**
	 * Updates with a specific percentage
	 * @param percent - Percentage (0-100)
	 * @param status - Optional status message
	 */
	setPercent(percent: number, status?: string): void {
		this.currentPercent = Math.min(100, Math.max(0, percent));
		this.barEl.setCssStyles({ width: `${this.currentPercent}%` });

		if (status) {
			this.labelEl.textContent = status;
		}
	}

	/**
	 * Marks progress as complete
	 * @param message - Completion message
	 */
	complete(message = "Complete!"): void {
		this.barEl.setCssStyles({ width: "100%" });
		this.currentPercent = 100;
		this.labelEl.textContent = message;
		this.container.addClass(CSS_CLASSES.COMPLETE);
	}

	/**
	 * Marks progress as error
	 * @param message - Error message
	 */
	error(message: string): void {
		this.container.addClass(CSS_CLASSES.ERROR);
		this.labelEl.textContent = message;
	}

	/**
	 * Resets the progress bar
	 */
	reset(): void {
		this.currentPercent = 0;
		this.barEl.setCssStyles({ width: "0%" });
		this.labelEl.textContent = "Initializing...";
		this.container.removeClass(CSS_CLASSES.COMPLETE);
		this.container.removeClass(CSS_CLASSES.ERROR);
	}

	/**
	 * Shows the progress bar
	 */
	show(): void {
		this.container.setCssStyles({ display: "block" });
	}

	/**
	 * Hides the progress bar
	 */
	hide(): void {
		this.container.setCssStyles({ display: "none" });
	}

	/**
	 * Removes the progress bar from DOM
	 */
	remove(): void {
		this.container.remove();
	}

	/**
	 * Gets current progress percentage
	 */
	getPercent(): number {
		return this.currentPercent;
	}

	/**
	 * Animates to a specific percentage
	 * @param targetPercent - Target percentage (0-100)
	 * @param duration - Animation duration in ms
	 */
	async animateTo(targetPercent: number, duration = 500): Promise<void> {
		const startPercent = this.currentPercent;
		const diff = targetPercent - startPercent;
		const startTime = Date.now();

		return new Promise((resolve) => {
			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);

				// Ease-out animation
				const easeProgress = 1 - Math.pow(1 - progress, 3);
				const currentPercent = startPercent + (diff * easeProgress);

				this.setPercent(currentPercent);

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					resolve();
				}
			};

			requestAnimationFrame(animate);
		});
	}
}
