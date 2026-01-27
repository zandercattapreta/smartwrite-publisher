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
	connectionTextEl: HTMLSpanElement;
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
		this.configureService();
		this.render();
	}

	/**
	 * Configura o serviço Substack com as credenciais atuais
	 */
	configureService() {
		if (this.plugin.settings.cookies && this.plugin.settings.substackUrl) {
			this.substackService.configure(
				this.plugin.settings.cookies,
				this.plugin.settings.substackUrl
			);
		}
	}

	render() {
		const container = this.containerEl.children[1];
		if (!container) return;

		container.empty();
		container.addClass("smartwrite-publisher-sidebar");

		// Header
		const header = container.createDiv({ cls: "sidebar-header" });
		header.createEl("h4", { text: "SmartWrite Publisher" });
		const helpBtn = header.createEl("button", {
			cls: "clickable-icon help-icon",
			attr: { "aria-label": "Como usar" }
		});
		helpBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';
		helpBtn.onclick = () => {
			const { HelpModal } = require("./modal");
			new HelpModal(this.app).open();
		};

		// --- Section: Active Note ---
		const activeNoteSection = container.createDiv({ cls: "publisher-section" });
		activeNoteSection.createEl("h5", { text: "Nota Ativa" });
		const noteInfo = activeNoteSection.createDiv({ cls: "note-info" });
		this.noteNameEl = noteInfo.createEl("p", {
			text: this.activeFile ? this.activeFile.basename : "Nenhuma nota selecionada",
			cls: "note-name"
		});

		this.statusBadgeEl = activeNoteSection.createSpan({ text: "Pendente", cls: "status-badge" });

		const actionButtons = activeNoteSection.createDiv({ cls: "action-buttons" });

		// Botão Publish Live
		const publishLiveBtn = actionButtons.createEl("button", { text: "Publish Live", cls: "mod-cta" });
		publishLiveBtn.onclick = () => this.handlePublish(false);
		this.publishBtns.push(publishLiveBtn);

		// Botão Create Draft
		const draftBtn = actionButtons.createEl("button", { text: "Create Draft" });
		draftBtn.onclick = () => this.handlePublish(true);
		this.publishBtns.push(draftBtn);

		// Botão Schedule (desabilitado por enquanto)
		const scheduleBtn = actionButtons.createEl("button", { text: "Schedule", attr: { disabled: "true" } });
		scheduleBtn.title = "Em breve";

		// --- Section: Directory Publishing ---
		const batchSection = container.createDiv({ cls: "publisher-section" });
		batchSection.createEl("h5", { text: "Publicação em Lote" });
		const folderSelect = batchSection.createEl("select");
		folderSelect.createEl("option", { text: "Selecione uma pasta..." });

		// Popula com pastas do vault
		const folders = this.app.vault.getAllLoadedFiles()
			.filter(f => (f as any).children !== undefined)
			.map(f => f.path)
			.sort();

		for (const folder of folders) {
			if (folder) {
				folderSelect.createEl("option", { text: folder, value: folder });
			}
		}

		const batchBtn = batchSection.createEl("button", { text: "Publish All", cls: "mod-warning", attr: { disabled: "true" } });
		batchBtn.title = "Em desenvolvimento";

		// --- Section: Quick Settings ---
		const settingsSection = container.createDiv({ cls: "publisher-section settings-section" });
		settingsSection.createEl("h5", { text: "Configurações Rápidas" });

		const connectionStatus = settingsSection.createDiv({ cls: "connection-status" });
		this.connectionDotEl = connectionStatus.createSpan({ cls: `status-dot ${this.isConnected ? 'green' : 'red'}` });
		this.connectionTextEl = connectionStatus.createSpan({ text: this.isConnected ? " Conectado" : " Desconectado" });

		const cookieInput = settingsSection.createEl("input", {
			attr: { type: "password", placeholder: "Colar Cookies (substack.sid)" }
		});
		cookieInput.value = this.plugin.settings.cookies;
		cookieInput.onchange = async () => {
			this.plugin.settings.cookies = cookieInput.value;
			await this.plugin.saveSettings();
			this.configureService();
		};

		const urlInput = settingsSection.createEl("input", {
			attr: { type: "text", placeholder: "URL do Substack" }
		});
		urlInput.value = this.plugin.settings.substackUrl;
		urlInput.onchange = async () => {
			this.plugin.settings.substackUrl = urlInput.value;
			await this.plugin.saveSettings();
			this.configureService();
		};

		const testBtn = settingsSection.createEl("button", { text: "Test Connection" });
		testBtn.onclick = () => this.testConnection();

		// --- Section: System Logs ---
		const logSection = container.createDiv({ cls: "publisher-section log-section" });
		const logHeader = logSection.createDiv({ cls: "log-header" });
		logHeader.createEl("h5", { text: "Logs de Sistema" });
		const copyLogBtn = logHeader.createEl("button", {
			text: "Copiar",
			cls: "log-copy-btn",
			attr: { "aria-label": "Copiar logs para suporte" }
		});
		copyLogBtn.onclick = () => {
			navigator.clipboard.writeText(this.plugin.logger.getFormattedLogs());
			new Notice("Logs copiados para a área de transferência.");
		};

		const clearLogBtn = logHeader.createEl("button", {
			text: "Limpar",
			cls: "log-clear-btn",
			attr: { "aria-label": "Limpar logs" }
		});
		clearLogBtn.onclick = () => {
			this.plugin.logger.clear();
			this.refreshLogs();
			new Notice("Logs limpos.");
		};

		const logConsole = logSection.createDiv({ cls: "log-console" });
		this.renderLogs(logConsole);
	}

	/**
	 * Renderiza os logs no console
	 */
	renderLogs(logConsole: HTMLDivElement) {
		logConsole.empty();
		const logs = this.plugin.logger.getLogs();

		if (logs.length === 0) {
			logConsole.createEl("p", { text: "Nenhum evento registrado.", cls: "empty-log" });
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
			this.noteNameEl.setText(file.basename);
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
		} catch (error: any) {
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
		if (this.connectionDotEl && this.connectionTextEl) {
			this.connectionDotEl.className = `status-dot ${this.isConnected ? 'green' : 'red'}`;
			this.connectionTextEl.setText(this.isConnected ? " Conectado" : " Desconectado");
		}
	}

	/**
	 * Atualiza o console de logs
	 */
	refreshLogs() {
		const logConsole = this.containerEl.querySelector('.log-console') as HTMLDivElement;
		if (logConsole) {
			this.renderLogs(logConsole);
		}
	}

	/**
	 * Manipula a publicação de uma nota
	 */
	async handlePublish(isDraft: boolean) {
		if (!this.activeFile) {
			new Notice("Nenhuma nota selecionada.");
			return;
		}

		if (!this.substackService.isConfigured()) {
			new Notice("Configure o cookie e URL primeiro.");
			return;
		}

		if (this.isPublishing) {
			new Notice("Publicação em andamento...");
			return;
		}

		this.isPublishing = true;
		this.setPublishButtonsState(true);

		const action = isDraft ? "Criando rascunho" : "Publicando";
		const notice = new Notice(`${action}: ${this.activeFile.basename}...`, 0);

		try {
			// Lê o conteúdo da nota
			const content = await this.app.vault.read(this.activeFile);

			// Converte para HTML
			const converted = this.converter.convert(content, this.activeFile.basename);

			this.plugin.logger.log(`Convertido: ${converted.title} (${converted.html.length} chars HTML)`);

			// Publica no Substack
			// FORÇADO: Sempre rascunho (isDraft: true) durante fase de testes
			const result = await this.substackService.publishPost({
				title: converted.title,
				subtitle: converted.subtitle,
				bodyHtml: converted.html,
				isDraft: true // Forçado
			});

			if (result.success) {
				const successMsg = isDraft
					? `Rascunho criado: ${converted.title}`
					: `Publicado: ${converted.title}`;
				new Notice(successMsg);

				if (result.postUrl) {
					this.plugin.logger.log(`URL: ${result.postUrl}`);
				}

				// Atualiza badge de status
				if (this.statusBadgeEl) {
					this.statusBadgeEl.setText(isDraft ? "Rascunho" : "Publicado");
					this.statusBadgeEl.className = `status-badge ${isDraft ? 'draft' : 'published'}`;
				}
			} else {
				new Notice(`Erro: ${result.error}`);
			}
		} catch (error: any) {
			const errorMsg = error?.message || String(error);
			new Notice(`Erro ao publicar: ${errorMsg}`);
			this.plugin.logger.log("Exceção no handlePublish", 'ERROR', error);
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

	async onClose() {
		// Cleanup if needed
	}
}
