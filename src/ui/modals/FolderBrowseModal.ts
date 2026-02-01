/**
 * SmartWrite Publisher - Folder Browse Modal
 * Modal for browsing and selecting folders
 * v0.4.0 - Refactoring Phase
 */

import { App } from 'obsidian';
import { BaseModal } from '../BaseModal';
import { CSS_CLASSES, UI_TEXT } from '../../constants';

/**
 * Modal for browsing and selecting folders from vault
 */
export class FolderBrowseModal extends BaseModal<string> {
	private folders: string[];

	constructor(app: App, folders: string[]) {
		super(app, UI_TEXT.MODAL.BROWSE_FOLDERS_TITLE);
		this.folders = folders;
	}

	renderContent(): void {
		this.clearContent();
		this.addModalClass(CSS_CLASSES.FOLDER_BROWSE_MODAL);

		// Subtitle
		this.createParagraph(
			UI_TEXT.MODAL.BROWSE_FOLDERS_SUBTITLE,
			CSS_CLASSES.FOLDER_BROWSE_SUBTITLE
		);

		// Folder list
		const folderListContainer = this.createContainer(CSS_CLASSES.FOLDER_BROWSE_LIST);

		if (this.folders.length === 0) {
			folderListContainer.createEl("p", {
				text: UI_TEXT.MODAL.NO_FOLDERS_FOUND,
				cls: CSS_CLASSES.EMPTY_FOLDER_LIST
			});
		} else {
			for (const folder of this.folders) {
				const folderItem = folderListContainer.createDiv({
					cls: CSS_CLASSES.FOLDER_BROWSE_ITEM
				});
				folderItem.textContent = folder || UI_TEXT.MODAL.FOLDER_ROOT;
				folderItem.onclick = () => {
					this.close(folder);
				};
			}
		}

		// Button container
		const buttonContainer = this.createButtonContainer();

		// Cancel button
		this.addButton(
			buttonContainer,
			UI_TEXT.LABELS.CANCEL_BTN,
			() => this.close(null),
			false
		);
	}
}
