/**
 * @file This file defines the main UI view for the SmartWrite Publisher plugin.
 * @description Manages rendering of the plugin's sidebar, user interactions, and orchestrates publishing operations.
 */
import { ItemView, TFile, WorkspaceLeaf, Notice } from "obsidian";
import SmartWritePublisher from "./main";
import { SubstackService } from "./substack";
import { MarkdownConverter } from "./converter";
import { FolderCache } from "./types";
import { SETTINGS } from "./constants";

export const VIEW_TYPE_PUBLISHER = "smartwrite-publisher-view";

/**
 * Main UI view for the SmartWrite Publisher plugin.
 * Handles rendering the sidebar, displaying active note information, batch publishing controls,
 * connection status, and system logs.
 */
export class PublisherView extends ItemView {
	/** Reference to the main plugin instance. */
	plugin: SmartWritePublisher;
	/** The currently active Obsidian file in the workspace. */
	activeFile: TFile | null = null;
	/** Connection status to Substack. */
	isConnected: boolean = false;
	/** Flag to indicate if a publishing operation is currently in progress. */
	isPublishing: boolean = false;

	// Services
	/** Service for interacting with the Substack API. */
	substackService: SubstackService;
	/** Converter for Markdown to HTML (and Tiptap JSON). */
	converter: MarkdownConverter;

	// References to dynamic UI elements for efficient updates
	/** HTML element displaying the active note's name. */
	noteNameEl: HTMLParagraphElement;
	/** HTML element displaying the publishing status badge (e.g., "Pending", "Draft", "Published"). */
	statusBadgeEl: HTMLSpanElement;
	/** HTML element for the connection status dot (green/red). */
	connectionDotEl: HTMLSpanElement;
	/** Array of HTML buttons related to publishing actions (e.g., "Create draft", "Publish live"). */
	publishBtns: HTMLButtonElement[] = [];

	// Folder cache for performance optimization in folder browsing
	/** Cache for vault folders to improve performance of folder selection. */
	private folderCache: FolderCache | null = null;

	/**
	 * Creates an instance of PublisherView.
	 * @param leaf The workspace leaf that this view resides in.
	 * @param plugin The main SmartWritePublisher plugin instance.
	 */
	constructor(leaf: WorkspaceLeaf, plugin: SmartWritePublisher) {
		super(leaf);
		this.plugin = plugin;
		this.substackService = plugin.substackService;
		this.converter = new MarkdownConverter();
	}

	/**
	 * Returns the unique type of this view.
	 * @returns The view type string.
	 */
	getViewType() {
		return VIEW_TYPE_PUBLISHER;
	}

	/**
	 * Returns the display name of this view, shown in the UI.
	 * @returns The display text.
	 */
	getDisplayText() {
		return "SmartWrite Publisher";
	}

	/**
	 * Lifecycle method called when the view is opened.
	 * Initializes connection status, configures the Substack service, and renders the UI.
	 */
	async onOpen() {
		this.isConnected = this.plugin.connected;
		this.configureService();
		this.render();
	}

	/**
	 * Configures the Substack service with the current plugin settings (cookies and URL).
	 * This ensures the service uses up-to-date credentials for API calls.
	 */
	configureService() {
		if (this.plugin.settings.cookies && this.plugin.settings.substackUrl) {
			this.substackService.configure({
				cookie: this.plugin.settings.cookies,
				substackUrl: this.plugin.settings.substackUrl
			});
		}
	}

	/**
	 * Retrieves a list of all folders in the vault, utilizing a caching mechanism for performance.
	 * Folders are sorted alphabetically. The cache is refreshed if 'forceRefresh' is true or if the cache TTL has expired.
	 * @param forceRefresh If true, forces the cache to refresh immediately.
	 * @returns An array of folder paths.
	 */
	private getFolders(forceRefresh = false): string[] {
		const now = Date.now();

		// Check if cache is valid
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
			ttl: SETTINGS.FOLDER_CACHE_TTL
		};

		return folders;
	}

	/**
	 * Renders the entire UI of the SmartWrite Publisher sidebar.
	 * This method constructs and populates all sections of the sidebar, including active note,
	 * batch publishing controls, connection status, and system logs.
	 */
	render() {
		const container = this.containerEl.children[1];
		if (!container) return;

		container.empty();
		container.addClass("smartwrite-publisher-sidebar");

		// --- Header Section ---
		const header = container.createDiv({ cls: "sidebar-header" });
		const titleContainer = header.createDiv({ cls: "title-container" });
		titleContainer.createEl("h4", { text: "SmartWrite Publisher" });
		titleContainer.createEl("span", { text: `v${this.plugin.manifest.version}`, cls: "version-badge" });
		const helpBtn = header.createEl("button", {
			cls: "clickable-icon help-icon",
			attr: { "aria-label": "How to use" }
		});
		helpBtn.textContent = "?";
		helpBtn.onclick = () => {
			const { HelpModal } = require("./modal");
			new HelpModal(this.app).open();
		};

		// --- Section: Active Note (Single File Publishing) ---
		const activeNoteSection = container.createDiv({ cls: "publisher-section collapsible-section" });
		const activeNoteHeader = activeNoteSection.createDiv({ cls: "section-header" });
		const activeNoteToggle = activeNoteHeader.createEl("span", { cls: "collapse-icon", text: "▼" });
		activeNoteHeader.createEl("h5", { text: "Active Note" });
		const activeNoteContent = activeNoteSection.createDiv({ cls: "section-content" });

		activeNoteHeader.onclick = () => {
			activeNoteContent.toggleClass("collapsed", !activeNoteContent.hasClass("collapsed"));
			activeNoteToggle.textContent = activeNoteContent.hasClass("collapsed") ? "▶" : "▼";
		};

		const noteInfo = activeNoteContent.createDiv({ cls: "note-info" });
		this.noteNameEl = noteInfo.createEl("p", {
			text: this.activeFile ? this.activeFile.basename : "No note selected",
			cls: "note-name"
		});

		this.statusBadgeEl = activeNoteContent.createSpan({ text: "Pending", cls: "status-badge" });

		const actionButtons = activeNoteContent.createDiv({ cls: "action-buttons" });

		// Botão Create Draft (AGORA DEFAULT)
		const draftBtn = actionButtons.createEl("button", { text: "Create draft", cls: "mod-cta" });
		draftBtn.onclick = () => this.handlePublish(true);
		this.publishBtns.push(draftBtn);

		// Botão Publish Live
		const publishLiveBtn = actionButtons.createEl("button", { text: "Publish live" });
		publishLiveBtn.onclick = () => this.handlePublish(false);
		this.publishBtns.push(publishLiveBtn);

		// Botão Schedule (desabilitado por enquanto)
		const scheduleBtn = actionButtons.createEl("button", { text: "Schedule", attr: { disabled: "true" } });
		scheduleBtn.title = "Coming soon";

		// --- Section: Batch Publishing ---
		const batchSection = container.createDiv({ cls: "publisher-section collapsible-section" });
		const batchHeader = batchSection.createDiv({ cls: "section-header" });
		const batchToggle = batchHeader.createEl("span", { cls: "collapse-icon", text: "▼" });
		batchHeader.createEl("h5", { text: "Batch Publishing" });
		const batchContent = batchSection.createDiv({ cls: "section-content" });

		batchHeader.onclick = () => {
			batchContent.toggleClass("collapsed", !batchContent.hasClass("collapsed"));
			batchToggle.textContent = batchContent.hasClass("collapsed") ? "▶" : "▼";
		};

		// Folder input with autocomplete
		const folderInputContainer = batchContent.createDiv({ cls: "folder-input-container" });

		const folderInput = folderInputContainer.createEl("input", {
			type: "text",
			placeholder: "Type or select a folder...",
			cls: "folder-input"
		});
		folderInput.setAttribute("list", "folder-list");

		// Datalist for autocomplete
		const datalist = folderInputContainer.createEl("datalist");
		datalist.id = "folder-list";

		// Get folders (with caching - v0.4.0)
		const folders = this.getFolders();

		for (const folder of folders) {
			if (folder) {
				datalist.createEl("option", { value: folder });
			}
		}

		// Browse button
		const browseBtn = folderInputContainer.createEl("button", {
			text: "Browse",
			cls: "browse-btn"
		});
		browseBtn.onclick = () => {
			// Show folder suggestion modal
			this.showFolderBrowseModal(folders).then(selectedFolder => {
				if (selectedFolder) {
					folderInput.value = selectedFolder;
				}
			});
		};

		// Progress indicator
		const progressEl = batchContent.createDiv({ cls: "batch-progress", text: "" });
		progressEl.hide();

		// Publish all button (now ENABLED)
		const batchBtn = batchContent.createEl("button", { text: "Publish all as drafts", cls: "mod-warning" });
		batchBtn.onclick = async () => {
			const selectedFolder = folderInput.value.trim();
			await this.handleBatchPublish(selectedFolder);
		};

		// --- Section: Substack Connection (Settings) ---
		const settingsSection = container.createDiv({ cls: "publisher-section collapsible-section settings-section" });
		const settingsHeader = settingsSection.createDiv({ cls: "section-header" });
		const settingsToggle = settingsHeader.createEl("span", { cls: "collapse-icon", text: "▼" });
		const settingsTitleContainer = settingsHeader.createDiv({ cls: "section-title-with-status" });
		settingsTitleContainer.createEl("h5", { text: "Substack Connection" });
		this.connectionDotEl = settingsTitleContainer.createSpan({ cls: `status-dot ${this.isConnected ? 'green' : 'red'}` });
		const settingsContent = settingsSection.createDiv({ cls: "section-content" });

		settingsHeader.onclick = () => {
			settingsContent.toggleClass("collapsed", !settingsContent.hasClass("collapsed"));
			settingsToggle.textContent = settingsContent.hasClass("collapsed") ? "▶" : "▼";
		};

		// Cookie Secret
		settingsContent.createEl("label", { text: "Cookie Secret", cls: "input-label" });
		const cookieInput = settingsContent.createEl("input", {
			attr: { type: "password", placeholder: "Paste your connect.sid cookie" }
		});
		cookieInput.value = this.plugin.settings.cookies;
		cookieInput.onchange = async () => {
			this.plugin.settings.cookies = cookieInput.value;
			await this.plugin.saveSettings();
			this.configureService();
		};

		// URL Substack
		settingsContent.createEl("label", { text: "URL Substack", cls: "input-label" });
		const urlInput = settingsContent.createEl("input", {
			attr: { type: "text", placeholder: "https://yourname.substack.com" }
		});
		urlInput.value = this.plugin.settings.substackUrl;
		urlInput.onchange = async () => {
			this.plugin.settings.substackUrl = urlInput.value;
			await this.plugin.saveSettings();
			this.configureService();
		};

		const testBtn = settingsContent.createEl("button", { text: "Test connection" });
		testBtn.onclick = () => this.testConnection();

		// --- Section: System Logs ---
		const logSection = container.createDiv({ cls: "publisher-section collapsible-section log-section" });
		const logHeaderContainer = logSection.createDiv({ cls: "section-header" });
		const logToggle = logHeaderContainer.createEl("span", { cls: "collapse-icon", text: "▼" });
		logHeaderContainer.createEl("h5", { text: "System Logs" });
		const logContent = logSection.createDiv({ cls: "section-content" });

		logHeaderContainer.onclick = () => {
			logContent.toggleClass("collapsed", !logContent.hasClass("collapsed"));
			logToggle.textContent = logContent.hasClass("collapsed") ? "▶" : "▼";
		};

		const logHeader = logContent.createDiv({ cls: "log-header" });
		const copyLogBtn = logHeader.createEl("button", {
			text: "Copy",
			cls: "log-copy-btn",
			attr: { "aria-label": "Copy logs for support" }
		});
		copyLogBtn.onclick = () => {
			navigator.clipboard.writeText(this.plugin.logger.getFormattedLogs());
			new Notice("Logs copied to clipboard.");
		};

		const clearLogBtn = logHeader.createEl("button", {
			text: "Clear",
			cls: "log-clear-btn",
			attr: { "aria-label": "Clear logs" }
		});
		clearLogBtn.onclick = () => {
			this.plugin.logger.clear();
			this.refreshLogs();
			new Notice("Logs cleared.");
		};

		const logConsole = logContent.createDiv({ cls: "log-console" });
		this.renderLogs(logConsole);
	}

	/**
	 * Renders the log entries into the system logs console UI element.
	 * Clears previous logs and appends new, formatted, and color-coded log entries.
	 * @param logConsole The HTMLDivElement representing the log console where logs will be displayed.
	 */
	renderLogs(logConsole: HTMLDivElement) {
		logConsole.empty();
		const logs = this.plugin.logger.getLogs();

		if (logs.length === 0) {
			logConsole.createEl("p", { text: "No events recorded.", cls: "empty-log" });
		} else {
			logs.forEach(l => {
				const line = logConsole.createDiv({ cls: `log-line ${l.level.toLowerCase()}` });
				const timePart = l.timestamp.split('T')[1]?.split('.')[0] || '--:--:--';
				line.createSpan({ text: timePart, cls: "log-time" });
				line.createSpan({ text: ` [${l.level}] `, cls: "log-level" });
				line.createSpan({ text: l.message, cls: "log-msg" });
			});
		}
	}

	/**
	 * Updates the displayed active note in the UI.
	 * If the note name element is already rendered, it updates its text content; otherwise, it triggers a full re-render.
	 * @param file The TFile object representing the newly active Obsidian note.
	 */
	updateActiveNote(file: TFile) {
		this.activeFile = file;
		if (this.noteNameEl) {
			this.noteNameEl.textContent = file.basename;
		} else {
			this.render();
		}
	}

	/**
	 * Initiates a connection test to Substack, leveraging the plugin's main testConnection logic.
	 * Updates the internal connection status and refreshes the UI's connection indicator and logs.
	 */
	async testConnection() {
		this.configureService();

		try {
			const result = await this.plugin.testConnection();

			if (result.success) {
				this.isConnected = true;
			} else {
				this.isConnected = false;
			}
		} catch (error) {
			this.isConnected = false;
		} finally {
			// Atualiza indicador visual
			this.updateConnectionStatus();
			this.refreshLogs();
		}
	}

	/**
	 * Updates the visual connection status indicator (dot) in the UI
	 * to reflect the current `isConnected` state (green for connected, red for disconnected).
	 */
	updateConnectionStatus() {
		if (this.connectionDotEl) {
			this.connectionDotEl.className = `status-dot ${this.isConnected ? 'green' : 'red'}`;
		}
	}

	/**
	 * Refreshes the display of the system logs in the UI.
	 * This method is called after new log entries are added or cleared.
	 */
	refreshLogs() {
		const logConsole = this.containerEl.querySelector('.log-console') as HTMLDivElement | null;
		if (logConsole) {
			this.renderLogs(logConsole);
		}
	}

	/**
	 * Handles the publishing process for a single active note to Substack.
	 * This includes reading content, converting Markdown, calling the Substack service,
	 * and updating the UI with success or error feedback.
	 * @param isDraft If true, publishes as a draft; otherwise, publishes live.
	 */
	async handlePublish(isDraft: boolean) {
		if (!this.activeFile) {
			new Notice("No note selected.");
			return;
		}

		if (!this.substackService.isConfigured()) {
			new Notice("Please configure cookie and URL first.");
			return;
		}

		if (this.isPublishing) {
			new Notice("Publishing in progress...");
			return;
		}

		this.isPublishing = true;
		this.setPublishButtonsState(true);

		const action = isDraft ? "Creating draft" : "Publishing";
		const notice = new Notice(`${action}: ${this.activeFile.basename}...`, 0);

		try {
			// Lê o conteúdo da nota
			const content = await this.app.vault.read(this.activeFile);

			// Converte para HTML
			const converted = this.converter.convert(content, this.activeFile.basename);

			const htmlLength = typeof converted.html === 'string'
				? converted.html.length
				: JSON.stringify(converted.html).length;
			this.plugin.logger.log(`Convertido: ${converted.title} (${htmlLength} chars)`);

			// Publica no Substack
			const result = await this.substackService.publishPost({
				title: converted.title,
				subtitle: converted.subtitle,
				bodyHtml: converted.html,
				isDraft: isDraft
			});

			if (result.success) {
				const successMsg = isDraft
					? `Draft created: ${converted.title}`
					: `Published: ${converted.title}`;
				new Notice(successMsg);

				if (result.postUrl) {
					this.plugin.logger.log(`URL: ${result.postUrl}`);
				}

				// Atualiza badge de status
				if (this.statusBadgeEl) {
					this.statusBadgeEl.textContent = isDraft ? "Draft" : "Published";
					this.statusBadgeEl.className = `status-badge ${isDraft ? 'draft' : 'published'}`;
				}
			} else {
				new Notice(`Error: ${result.error}`);
			}
		} catch (error: any) {
			const errorMsg = error?.message || String(error);
			new Notice(`Error publishing: ${errorMsg}`);
			this.plugin.logger.log("Exception in handlePublish", 'ERROR', error);
		} finally {
			notice.hide();
			this.isPublishing = false;
			this.setPublishButtonsState(false);
			this.refreshLogs();
		}
	}

	/**
	 * Enables or disables the publish buttons in the UI.
	 * This prevents multiple publishing actions while one is in progress.
	 * @param disabled If true, buttons will be disabled; otherwise, enabled.
	 */
	setPublishButtonsState(disabled: boolean) {
		for (const btn of this.publishBtns) {
			if (disabled) {
				btn.setAttribute('disabled', 'true');
			} else {
				btn.removeAttribute('disabled');
			}
		}
	}

	/**
	 * Handles the batch publishing process, allowing users to publish multiple notes as drafts from a selected folder.
	 * This method orchestrates file filtering, interactive selection, parallel processing with rate limiting,
	 * and displays a summary of results.
	 * @param folderPath The path to the Obsidian folder containing the notes to be published.
	 */
	async handleBatchPublish(folderPath: string): Promise<void> {
		if (!folderPath || folderPath === "Select a folder..." || folderPath === "") {
			new Notice("Please select a folder first.");
			return;
		}

		if (!this.substackService.isConfigured()) {
			new Notice("Please configure cookie and URL first.");
			return;
		}

		// 1. Get all markdown files from folder
		const files = this.app.vault.getMarkdownFiles()
			.filter(f => f.path.startsWith(folderPath));

		if (files.length === 0) {
			new Notice("No markdown files found in selected folder.");
			return;
		}

		// 2. Show file selection modal
		const selectedFiles = await this.showFileSelectionModal(files);
		if (!selectedFiles || selectedFiles.length === 0) {
			new Notice("No files selected.");
			return;
		}

		// 3. Process files in parallel batches (v0.4.0 optimization)
		const results: Array<{ file: string; success: boolean; error?: string }> = [];
		const totalFiles = selectedFiles.length;
		const concurrency = SETTINGS.BATCH_CONCURRENCY; // 3 parallel operations

		this.plugin.logger.log(`Starting batch publish: ${totalFiles} files (${concurrency}x concurrency)`);

		// Process in batches
		for (let i = 0; i < selectedFiles.length; i += concurrency) {
			const batch = selectedFiles.slice(i, i + concurrency);
			const batchNumber = Math.floor(i / concurrency) + 1;
			const totalBatches = Math.ceil(selectedFiles.length / concurrency);

			this.plugin.logger.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

			// Process batch in parallel
			const batchPromises = batch.map(async (file, batchIndex) => {
				const globalIndex = i + batchIndex;
				const progress = `(${globalIndex + 1}/${totalFiles})`;

				new Notice(`Publishing ${progress}: ${file.basename}...`, 3000);
				this.plugin.logger.log(`Batch ${progress}: ${file.basename}`);

				try {
					const result = await this.createDraftFromFile(file);
					return {
						file: file.basename,
						success: result.success,
						error: result.error
					};
				} catch (error: any) {
					const errorMsg = error?.message || String(error);
					this.plugin.logger.log(`Batch error for ${file.basename}: ${errorMsg}`, 'ERROR');
					return {
						file: file.basename,
						success: false,
						error: errorMsg
					};
				}
			});

			// Wait for all files in batch to complete
			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);

			// Delay between batches (not between individual files)
			if (i + concurrency < selectedFiles.length) {
				await this.sleep(SETTINGS.BATCH_DELAY);
			}
		}

		// 4. Show summary
		this.showBatchResults(results);
		this.refreshLogs();
	}

	/**
	 * Displays an interactive modal allowing the user to browse and select a folder from their vault.
	 * @param folders A list of available folder paths to display in the modal.
	 * @returns A promise that resolves with the path of the selected folder, or null if cancelled.
	 */
	async showFolderBrowseModal(folders: string[]): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new (require('obsidian').Modal)(this.app);
			modal.titleEl.setText("Browse Folders");

			modal.contentEl.empty();
			modal.contentEl.addClass("folder-browse-modal");

			modal.contentEl.createEl("p", {
				text: "Select a folder from your vault:",
				cls: "folder-browse-subtitle"
			});

			// Folder list
			const folderListContainer = modal.contentEl.createDiv({ cls: "folder-browse-list" });

			if (folders.length === 0) {
				folderListContainer.createEl("p", {
					text: "No folders found in vault.",
					cls: "empty-folder-list"
				});
			} else {
				for (const folder of folders) {
					const folderItem = folderListContainer.createDiv({ cls: "folder-browse-item" });
					folderItem.textContent = folder || "(root)";
					folderItem.onclick = () => {
						modal.close();
						resolve(folder);
					};
				}
			}

			// Cancel button
			const buttonContainer = modal.contentEl.createDiv({ cls: "modal-button-container" });
			const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
			cancelBtn.onclick = () => {
				modal.close();
				resolve(null);
			};

			modal.open();
		});
	}

	/**
	 * Displays an interactive modal for users to select specific files from a list using checkboxes.
	 * Includes functionality for sorting files, and selecting/unselecting all files.
	 * @param files An array of TFile objects representing the files available for selection.
	 * @returns A promise that resolves with an array of selected TFile objects, or null if cancelled.
	 */
	async showFileSelectionModal(files: TFile[]): Promise<TFile[] | null> {
		return new Promise((resolve) => {
			const modal = new (require('obsidian').Modal)(this.app);
			modal.titleEl.setText("Select Files to Publish");

			modal.contentEl.empty();
			modal.contentEl.addClass("file-selection-modal");

			// Info text
			modal.contentEl.createEl("p", {
				text: `Found ${files.length} markdown file(s) in the selected folder.`,
				cls: "file-selection-info"
			});

			modal.contentEl.createEl("p", {
				text: "Select which files you want to publish as drafts:",
				cls: "file-selection-subtitle"
			});

			// Select All / Unselect All button
			const selectAllContainer = modal.contentEl.createDiv({ cls: "select-all-container" });
			const selectAllBtn = selectAllContainer.createEl("button", {
				text: "Unselect All",
				cls: "select-all-btn"
			});

			// File list wrapper with header
			const fileListWrapper = modal.contentEl.createDiv({ cls: "file-list-wrapper" });

			// Sorting state
			let sortAscending = true;
			let sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

			// Header with sort arrow
			const fileListHeader = fileListWrapper.createDiv({ cls: "file-list-header" });
			const headerText = fileListHeader.createSpan({ text: "File Name ", cls: "file-header-text" });
			const sortArrow = fileListHeader.createSpan({ text: "▲", cls: "sort-arrow" });

			// File list container with checkboxes
			const fileListContainer = fileListWrapper.createDiv({ cls: "file-list-container" });

			// Track checkbox states
			let checkboxes: Array<{ checkbox: HTMLInputElement; file: TFile }> = [];

			// Function to render file list
			const renderFileList = () => {
				fileListContainer.empty();
				checkboxes = [];

				for (const file of sortedFiles) {
					const fileItem = fileListContainer.createDiv({ cls: "file-item" });

					const checkbox = fileItem.createEl("input", { type: "checkbox" });
					checkbox.checked = true;  // All checked by default
					checkbox.addClass("file-checkbox");

					const label = fileItem.createEl("label", {
						text: file.path,
						cls: "file-label"
					});
					label.onclick = () => {
						checkbox.checked = !checkbox.checked;
						updateSelectAllButton();
					};

					checkboxes.push({ checkbox, file });
				}
			};

			// Sort toggle handler
			fileListHeader.onclick = () => {
				sortAscending = !sortAscending;
				sortArrow.textContent = sortAscending ? "▲" : "▼";

				sortedFiles = [...sortedFiles].sort((a, b) => {
					const comparison = a.path.localeCompare(b.path);
					return sortAscending ? comparison : -comparison;
				});

				renderFileList();
			};

			// Update Select All button text based on current state
			const updateSelectAllButton = () => {
				const allChecked = checkboxes.every(item => item.checkbox.checked);
				selectAllBtn.textContent = allChecked ? "Unselect All" : "Select All";
			};

			// Initial render
			renderFileList();

			// Select All / Unselect All logic
			selectAllBtn.onclick = () => {
				const allChecked = checkboxes.every(item => item.checkbox.checked);
				const newState = !allChecked;

				for (const item of checkboxes) {
					item.checkbox.checked = newState;
				}

				updateSelectAllButton();
			};

			// Button container
			const buttonContainer = modal.contentEl.createDiv({ cls: "modal-button-container" });

			const confirmBtn = buttonContainer.createEl("button", {
				text: "CONFIRM",
				cls: "mod-cta"
			});
			confirmBtn.onclick = () => {
				const selectedFiles = checkboxes
					.filter(item => item.checkbox.checked)
					.map(item => item.file);

				modal.close();
				resolve(selectedFiles);
			};

			const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
			cancelBtn.onclick = () => {
				modal.close();
				resolve(null);
			};

			modal.open();
		});
	}

	/**
	 * Displays a confirmation modal to the user before initiating a batch publishing operation.
	 * Provides a summary of the action and estimated time, asking for user confirmation.
	 * @param fileCount The number of files selected for batch publishing.
	 * @returns A promise that resolves to true if the user confirms, false otherwise.
	 */
	async confirmBatchPublish(fileCount: number): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new (require('obsidian').Modal)(this.app);
			modal.titleEl.setText("Batch Publishing");

			modal.contentEl.empty();
			modal.contentEl.createEl("p", {
				text: `You are about to create ${fileCount} draft(s) in Substack.`
			});
			modal.contentEl.createEl("p", {
				text: "This action will:",
				cls: "batch-confirm-warning"
			});

			const list = modal.contentEl.createEl("ul");
			list.createEl("li", { text: `Process ${fileCount} markdown file(s)` });
			list.createEl("li", { text: "Create one draft per file" });
			list.createEl("li", { text: "Take approximately " + Math.ceil(fileCount * 1.5) + " seconds" });

			modal.contentEl.createEl("p", {
				text: "Do you want to continue?",
				cls: "batch-confirm-question"
			});

			const buttonContainer = modal.contentEl.createDiv({ cls: "modal-button-container" });

			const confirmBtn = buttonContainer.createEl("button", {
				text: "Yes, create drafts",
				cls: "mod-cta"
			});
			confirmBtn.onclick = () => {
				modal.close();
				resolve(true);
			};

			const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
			cancelBtn.onclick = () => {
				modal.close();
				resolve(false);
			};

			modal.open();
		});
	}

	/**
	 * Processes a single Obsidian file to convert its content and publish it as a draft to Substack.
	 * This method is primarily used within the batch publishing workflow.
	 * @param file The TFile object representing the note to be published.
	 * @returns A promise that resolves with an object indicating success, error message, and optionally the post URL.
	 */
	async createDraftFromFile(file: TFile): Promise<{ success: boolean; error?: string; postUrl?: string }> {
		try {
			// Lê o conteúdo da nota
			const content = await this.app.vault.read(file);

			// Converte para HTML
			const converted = this.converter.convert(content, file.basename);

			// Publica no Substack como draft
			const result = await this.substackService.publishPost({
				title: converted.title,
				subtitle: converted.subtitle,
				bodyHtml: converted.html,
				isDraft: true  // Sempre draft em batch
			});

			if (result.success) {
				this.plugin.logger.log(`✓ Draft created: ${converted.title}`);
				return { success: true, postUrl: result.postUrl };
			} else {
				this.plugin.logger.log(`✗ Failed: ${converted.title} - ${result.error}`, 'ERROR');
				return { success: false, error: result.error };
			}
		} catch (error: any) {
			const errorMsg = error?.message || String(error);
			this.plugin.logger.log(`✗ Exception: ${file.basename} - ${errorMsg}`, 'ERROR');
			return { success: false, error: errorMsg };
		}
	}

	/**
	 * Displays a modal summarizing the results of a batch publishing operation.
	 * Shows counts for successful and failed publications, along with detailed results for each file.
	 * @param results An array of objects, each containing file name, success status, and an optional error message.
	 */
	showBatchResults(results: Array<{ file: string; success: boolean; error?: string }>) {
		const modal = new (require('obsidian').Modal)(this.app);
		modal.titleEl.setText("Batch Publishing Results");

		modal.contentEl.empty();

		const successCount = results.filter(r => r.success).length;
		const failCount = results.filter(r => !r.success).length;

		// Summary
		const summary = modal.contentEl.createDiv({ cls: "batch-summary" });
		summary.createEl("p", {
			text: `Completed: ${results.length} file(s)`,
			cls: "batch-summary-total"
		});
		summary.createEl("p", {
			text: `✓ Success: ${successCount}`,
			cls: "batch-summary-success"
		});
		if (failCount > 0) {
			summary.createEl("p", {
				text: `✗ Failed: ${failCount}`,
				cls: "batch-summary-error"
			});
		}

		// Detailed results
		if (results.length > 0) {
			modal.contentEl.createEl("h6", { text: "Details:" });
			const resultList = modal.contentEl.createEl("ul", { cls: "batch-results-list" });

			for (const result of results) {
				const item = resultList.createEl("li");
				const icon = result.success ? "✓" : "✗";
				const cls = result.success ? "batch-result-success" : "batch-result-error";

				item.createSpan({ text: `${icon} `, cls: cls });
				item.createSpan({ text: result.file });

				if (!result.success && result.error) {
					item.createEl("br");
					item.createSpan({
						text: `   Error: ${result.error}`,
						cls: "batch-error-detail"
					});
				}
			}
		}

		// Close button
		const closeBtn = modal.contentEl.createEl("button", {
			text: "Close",
			cls: "mod-cta"
		});
		closeBtn.onclick = () => modal.close();

		modal.open();

		// Also show toast notification
		if (failCount === 0) {
			new Notice(`✓ Batch complete: ${successCount} draft(s) created successfully!`);
		} else {
			new Notice(`Batch complete: ${successCount} success, ${failCount} failed. Check logs for details.`);
		}
	}

	/**
	 * A utility function to pause execution for a specified number of milliseconds.
	 * Primarily used to implement rate limiting between API requests during batch operations.
	 * @param ms The number of milliseconds to sleep.
	 * @returns A promise that resolves after the specified delay.
	 */
	sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Lifecycle method called when the view is closed.
	 * Can be used for cleanup tasks if necessary.
	 */
	async onClose() {
}
