/**
 * SmartWrite Publisher - Batch Results Modal
 * Modal for displaying batch publishing results
 * v0.4.0 - Refactoring Phase
 */

import { App, Notice } from 'obsidian';
import { BaseModal } from '../BaseModal';
import { CSS_CLASSES, UI_TEXT } from '../../constants';
import { BatchResult } from '../../types';

/**
 * Modal for displaying batch publish results
 */
export class BatchResultsModal extends BaseModal<void> {
	private results: BatchResult[];

	constructor(app: App, results: BatchResult[]) {
		super(app, UI_TEXT.MODAL.BATCH_RESULTS_TITLE);
		this.results = results;
	}

	renderContent(): void {
		this.clearContent();

		const successCount = this.results.filter(r => r.success).length;
		const failCount = this.results.filter(r => !r.success).length;

		// Summary
		const summary = this.createContainer(CSS_CLASSES.BATCH_SUMMARY);

		summary.createEl("p", {
			text: UI_TEXT.MODAL.BATCH_RESULTS_COMPLETED(this.results.length),
			cls: CSS_CLASSES.BATCH_SUMMARY_TOTAL
		});

		summary.createEl("p", {
			text: UI_TEXT.MODAL.BATCH_RESULTS_SUCCESS(successCount),
			cls: CSS_CLASSES.BATCH_SUMMARY_SUCCESS
		});

		if (failCount > 0) {
			summary.createEl("p", {
				text: UI_TEXT.MODAL.BATCH_RESULTS_FAILED(failCount),
				cls: CSS_CLASSES.BATCH_SUMMARY_ERROR
			});
		}

		// Detailed results
		if (this.results.length > 0) {
			this.createHeading("h6", UI_TEXT.MODAL.BATCH_RESULTS_DETAILS);

			const resultList = this.modal.contentEl.createEl("ul", {
				cls: CSS_CLASSES.BATCH_RESULTS_LIST
			});

			for (const result of this.results) {
				const item = resultList.createEl("li");
				const icon = result.success ? "✓" : "✗";
				const cls = result.success
					? CSS_CLASSES.BATCH_RESULT_SUCCESS
					: CSS_CLASSES.BATCH_RESULT_ERROR;

				item.createSpan({ text: `${icon} `, cls: cls });
				item.createSpan({ text: result.file });

				if (!result.success && result.error) {
					item.createEl("br");
					item.createSpan({
						text: `   Error: ${result.error}`,
						cls: CSS_CLASSES.BATCH_ERROR_DETAIL
					});
				}
			}
		}

		// Close button
		const closeBtn = this.modal.contentEl.createEl("button", {
			text: UI_TEXT.LABELS.CLOSE_BTN,
			cls: CSS_CLASSES.MOD_CTA
		});
		closeBtn.onclick = () => this.close();

		// Show toast notification
		this.showToastNotification(successCount, failCount);
	}

	/**
	 * Shows toast notification based on results
	 */
	private showToastNotification(successCount: number, failCount: number): void {
		if (failCount === 0) {
			new Notice(UI_TEXT.SUCCESS.BATCH_COMPLETE_SUCCESS(successCount));
		} else {
			new Notice(UI_TEXT.SUCCESS.BATCH_COMPLETE_PARTIAL(successCount, failCount));
		}
	}
}
