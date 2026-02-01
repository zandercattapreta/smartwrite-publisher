/**
 * SmartWrite Publisher - File Selection Modal
 * Modal for selecting multiple files with checkboxes and sorting
 * v0.4.0 - Refactoring Phase
 */

import { App, TFile } from 'obsidian';
import { BaseModal } from '../BaseModal';
import { CSS_CLASSES, UI_TEXT } from '../../constants';
import { FileSortState } from '../../types';

/**
 * Modal for selecting files to publish
 */
export class FileSelectionModal extends BaseModal<TFile[]> {
	private files: TFile[];
	private sortState: FileSortState;
	private checkboxes: Array<{ checkbox: HTMLInputElement; file: TFile }> = [];
	private fileListContainer: HTMLDivElement | null = null;
	private selectAllBtn: HTMLButtonElement | null = null;
	private sortArrow: HTMLSpanElement | null = null;

	constructor(app: App, files: TFile[]) {
		super(app, UI_TEXT.MODAL.SELECT_FILES_TITLE);
		this.files = files;
		this.sortState = {
			direction: 'asc',
			files: [...files].sort((a, b) => a.path.localeCompare(b.path))
		};
	}

	renderContent(): void {
		this.clearContent();
		this.addModalClass(CSS_CLASSES.FILE_SELECTION_MODAL);

		// Info text
		this.createParagraph(
			UI_TEXT.MODAL.FILES_FOUND(this.files.length),
			CSS_CLASSES.FILE_SELECTION_INFO
		);

		this.createParagraph(
			UI_TEXT.MODAL.SELECT_FILES_SUBTITLE,
			CSS_CLASSES.FILE_SELECTION_SUBTITLE
		);

		// Select All / Unselect All button
		const selectAllContainer = this.createContainer(CSS_CLASSES.SELECT_ALL_CONTAINER);
		this.selectAllBtn = selectAllContainer.createEl("button", {
			text: UI_TEXT.LABELS.UNSELECT_ALL_BTN,
			cls: CSS_CLASSES.SELECT_ALL_BTN
		});
		this.selectAllBtn.onclick = () => this.toggleSelectAll();

		// File list wrapper with header
		const fileListWrapper = this.createContainer(CSS_CLASSES.FILE_LIST_WRAPPER);

		// Header with sort arrow
		const fileListHeader = fileListWrapper.createDiv({ cls: CSS_CLASSES.FILE_LIST_HEADER });
		fileListHeader.createSpan({
			text: "File Name ",
			cls: CSS_CLASSES.FILE_HEADER_TEXT
		});
		this.sortArrow = fileListHeader.createSpan({
			text: "▲",
			cls: CSS_CLASSES.SORT_ARROW
		});

		// Sort toggle handler
		fileListHeader.onclick = () => this.toggleSort();

		// File list container with checkboxes
		this.fileListContainer = fileListWrapper.createDiv({
			cls: CSS_CLASSES.FILE_LIST_CONTAINER
		});

		// Initial render
		this.renderFileList();

		// Button container
		const buttonContainer = this.createButtonContainer();

		// Confirm button
		this.addButton(
			buttonContainer,
			UI_TEXT.LABELS.CONFIRM_BTN,
			() => this.confirm(),
			true
		);

		// Cancel button
		this.addButton(
			buttonContainer,
			UI_TEXT.LABELS.CANCEL_BTN,
			() => this.close(null),
			false
		);
	}

	/**
	 * Renders the file list with checkboxes
	 */
	private renderFileList(): void {
		if (!this.fileListContainer) return;

		this.fileListContainer.empty();
		this.checkboxes = [];

		for (const file of this.sortState.files) {
			const fileItem = this.fileListContainer.createDiv({
				cls: CSS_CLASSES.FILE_ITEM
			});

			const checkbox = fileItem.createEl("input", { type: "checkbox" });
			checkbox.checked = true;  // All checked by default
			checkbox.addClass(CSS_CLASSES.FILE_CHECKBOX);

			const label = fileItem.createEl("label", {
				text: file.path,
				cls: CSS_CLASSES.FILE_LABEL
			});
			label.onclick = () => {
				checkbox.checked = !checkbox.checked;
				this.updateSelectAllButton();
			};

			this.checkboxes.push({ checkbox, file });
		}

		this.updateSelectAllButton();
	}

	/**
	 * Toggles sort direction
	 */
	private toggleSort(): void {
		this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';

		if (this.sortArrow) {
			this.sortArrow.textContent = this.sortState.direction === 'asc' ? "▲" : "▼";
		}

		this.sortState.files = [...this.sortState.files].sort((a, b) => {
			const comparison = a.path.localeCompare(b.path);
			return this.sortState.direction === 'asc' ? comparison : -comparison;
		});

		this.renderFileList();
	}

	/**
	 * Toggles select all / unselect all
	 */
	private toggleSelectAll(): void {
		const allChecked = this.checkboxes.every(item => item.checkbox.checked);
		const newState = !allChecked;

		for (const item of this.checkboxes) {
			item.checkbox.checked = newState;
		}

		this.updateSelectAllButton();
	}

	/**
	 * Updates select all button text
	 */
	private updateSelectAllButton(): void {
		if (!this.selectAllBtn) return;

		const allChecked = this.checkboxes.every(item => item.checkbox.checked);
		this.selectAllBtn.textContent = allChecked
			? UI_TEXT.LABELS.UNSELECT_ALL_BTN
			: UI_TEXT.LABELS.SELECT_ALL_BTN;
	}

	/**
	 * Confirms selection and closes modal
	 */
	private confirm(): void {
		const selectedFiles = this.checkboxes
			.filter(item => item.checkbox.checked)
			.map(item => item.file);

		this.close(selectedFiles);
	}
}
