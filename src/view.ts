import { ItemView, TFile, WorkspaceLeaf, Notice } from "obsidian";
import SmartWritePublisher from "./main";
import { SubstackService } from "./substack";
import { MarkdownConverter } from "./converter";

export const VIEW_TYPE_PUBLISHER = "smartwrite-publisher-view";

export class PublisherView extends ItemView {
	plugin: SmartWritePublisher;
	activeFile: TFile | null = null;
	isConnected: boolean = false;
	isPublishing: boolean = false;

	// Serviços
	substackService: SubstackService;
	converter: MarkdownConverter;

	// Referências para elementos dinâmicos (otimização)
	noteNameEl: HTMLParagraphElement;
	statusBadgeEl: HTMLSpanElement;
	connectionDotEl: HTMLSpanElement;
	publishBtns: HTMLButtonElement[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: SmartWritePublisher) {
		super(leaf);
		this.plugin = plugin;
		this.substackService = plugin.substackService;
		this.converter = new MarkdownConverter();
	}

	getViewType() {
		return VIEW_TYPE_PUBLISHER;
	}

	getDisplayText() {
		return "SmartWrite Publisher";
	}

	async onOpen() {
		this.isConnected = this.plugin.connected;
		this.configureService();
		this.render();
	}

	/**
	 * Configura o serviço Substack com as credenciais atuais
	 */
	configureService() {
		if (this.plugin.settings.cookies && this.plugin.settings.substackUrl) {
			this.substackService.configure({
				cookie: this.plugin.settings.cookies,
				substackUrl: this.plugin.settings.substackUrl
			});
		}
	}

	render() {
		const container = this.containerEl.children[1];
		if (!container) return;

		container.empty();
		container.addClass("smartwrite-publisher-sidebar");

		// Header
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

		// --- Section: Active Note ---
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

		// --- Section: Directory Publishing ---
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

		// Popula com pastas do vault
		const folders = this.app.vault.getAllLoadedFiles()
			.filter(f => (f as any).children !== undefined)
			.map(f => f.path)
			.sort();

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

		// --- Section: Substack Connection ---
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
	 * Renderiza os logs no console
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
	 * Atualiza a nota ativa exibida
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
	 * Testa a conexão com o Substack
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
	 * Atualiza o indicador de conexão
	 */
	updateConnectionStatus() {
		if (this.connectionDotEl) {
			this.connectionDotEl.className = `status-dot ${this.isConnected ? 'green' : 'red'}`;
		}
	}

	/**
	 * Atualiza o console de logs
	 */
	refreshLogs() {
		const logConsole = this.containerEl.querySelector('.log-console') as HTMLDivElement | null;
		if (logConsole) {
			this.renderLogs(logConsole);
		}
	}

	/**
	 * Manipula a publicação de uma nota
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
	 * Habilita/desabilita botões de publicação
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
	 * Batch Publishing: Publica múltiplos drafts de uma pasta
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

		// 3. Create drafts one by one
		const results: Array<{ file: string; success: boolean; error?: string }> = [];
		const totalFiles = selectedFiles.length;

		this.plugin.logger.log(`Starting batch publish: ${totalFiles} files`);

		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			if (!file) continue;  // Safety check

			const progress = `(${i + 1}/${totalFiles})`;

			new Notice(`Publishing ${progress}: ${file.basename}...`, 3000);
			this.plugin.logger.log(`Batch ${progress}: ${file.basename}`);

			try {
				const result = await this.createDraftFromFile(file);
				results.push({
					file: file.basename,
					success: result.success,
					error: result.error
				});

				// Small delay to avoid rate limiting
				if (i < selectedFiles.length - 1) {
					await this.sleep(1500);
				}
			} catch (error: any) {
				const errorMsg = error?.message || String(error);
				results.push({
					file: file.basename,
					success: false,
					error: errorMsg
				});
				this.plugin.logger.log(`Batch error for ${file.basename}: ${errorMsg}`, 'ERROR');
			}
		}

		// 4. Show summary
		this.showBatchResults(results);
		this.refreshLogs();
	}

	/**
	 * Modal de navegação de pastas (Browse)
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
	 * Modal de seleção de arquivos com checkboxes
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

			// File list container with checkboxes
			const fileListContainer = modal.contentEl.createDiv({ cls: "file-list-container" });

			// Track checkbox states
			const checkboxes: Array<{ checkbox: HTMLInputElement; file: TFile }> = [];

			// Create checkbox for each file
			for (const file of files) {
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

			// Update Select All button text based on current state
			const updateSelectAllButton = () => {
				const allChecked = checkboxes.every(item => item.checkbox.checked);
				selectAllBtn.textContent = allChecked ? "Unselect All" : "Select All";
			};

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
	 * Confirma batch publish com o usuário
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
	 * Cria draft a partir de um arquivo
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
	 * Mostra resumo dos resultados do batch
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
	 * Sleep utility para delays entre requests
	 */
	sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async onClose() {
		// Cleanup if needed
	}
}
