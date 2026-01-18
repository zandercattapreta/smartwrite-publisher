import { ItemView, TFile, WorkspaceLeaf, requestUrl, Notice } from "obsidian";
import SmartWritePublisher from "./main";

export const VIEW_TYPE_PUBLISHER = "smartwrite-publisher-view";

export class PublisherView extends ItemView {
	plugin: SmartWritePublisher;
	activeFile: TFile | null = null;
	isConnected: boolean = false;

	constructor(leaf: WorkspaceLeaf, plugin: SmartWritePublisher) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_PUBLISHER;
	}

	getDisplayText() {
		return "SmartWrite Publisher";
	}

	// Referências para elementos dinâmicos (otimização)
	noteNameEl: HTMLParagraphElement;
	statusBadgeEl: HTMLSpanElement;
	connectionDotEl: HTMLSpanElement;
	connectionTextEl: HTMLSpanElement;

	async onOpen() {
		this.render();
	}

	render() {
		const container = this.containerEl.children[1];
		if (!container) return;
		
		container.empty();
		container.addClass("smartwrite-publisher-sidebar");

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
		actionButtons.createEl("button", { text: "Publish Live", cls: "mod-cta" });
		actionButtons.createEl("button", { text: "Create Draft" });
		actionButtons.createEl("button", { text: "Schedule" });

		// --- Section: Directory Publishing ---
		const batchSection = container.createDiv({ cls: "publisher-section" });
		batchSection.createEl("h5", { text: "Publicação em Lote" });
		const folderSelect = batchSection.createEl("select");
		folderSelect.createEl("option", { text: "Selecione uma pasta..." });
		
		batchSection.createEl("button", { text: "Publish All", cls: "mod-warning" });

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
		};

		const urlInput = settingsSection.createEl("input", { 
			attr: { type: "text", placeholder: "URL do Substack" } 
		});
		urlInput.value = this.plugin.settings.substackUrl;
		urlInput.onchange = async () => {
			this.plugin.settings.substackUrl = urlInput.value;
			await this.plugin.saveSettings();
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

		const logConsole = logSection.createDiv({ cls: "log-console" });
		const logs = this.plugin.logger.getLogs();
		if (logs.length === 0) {
			logConsole.createEl("p", { text: "Nenhum evento registrado.", cls: "empty-log" });
		} else {
			logs.forEach(l => {
				const line = logConsole.createDiv({ cls: `log-line ${l.level.toLowerCase()}` });
				line.createSpan({ text: l.timestamp.split('T')[1].split('.')[0], cls: "log-time" });
				line.createSpan({ text: ` [${l.level}] `, cls: "log-level" });
				line.createSpan({ text: l.message, cls: "log-msg" });
			});
		}
	}

	updateActiveNote(file: TFile) {
		this.activeFile = file;
		if (this.noteNameEl) {
			this.noteNameEl.setText(file.basename);
		} else {
			this.render();
		}
	}

	async testConnection() {
		if (!this.plugin.settings.cookies) {
			new Notice("Por favor, insira os cookies primeiro.");
			return;
		}

		this.plugin.logger.log("Iniciando teste de conexão...");
		const notice = new Notice("Testando conexão...", 0);
		
		// Limpeza e normalização do Cookie
		let cookieValue = this.plugin.settings.cookies.trim();
		if (cookieValue.includes("%3A")) {
			this.plugin.logger.log("Decodificando cookie URL encoded.");
			cookieValue = decodeURIComponent(cookieValue);
		}
		if (cookieValue.startsWith("substack.sid=")) {
			cookieValue = cookieValue.replace("substack.sid=", "");
		}

		try {
			const targetUrl = "https://substack.com/api/v1/user";
			this.plugin.logger.log(`Request para: ${targetUrl}`);

			const response = await requestUrl({
				url: targetUrl,
				method: "GET",
				headers: {
					"Cookie": `substack.sid=${cookieValue}`,
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Obsidian/1.0.0",
					"Accept": "application/json"
				},
				throw: false
			});

			this.plugin.logger.log(`Resposta recebida: ${response.status}`, 'INFO', { 
				url: targetUrl,
				status: response.status,
				body: response.text.substring(0, 200) // Logar início do corpo para diagnóstico
			});

			if (response.status === 200 && response.json.id) {
				this.isConnected = true;
				new Notice(`Sucesso! Conectado como: ${response.json.name || response.json.email}`);
				this.plugin.logger.log(`Conexão bem-sucedida para o usuário: ${response.json.email}`);
			} else {
				this.isConnected = false;
				const errorMsg = response.status === 404 ? "Erro 404: Endpoint não encontrado. A API do Substack pode ter mudado." :
								 response.status === 403 ? "Não autorizado (403). Verifique se o cookie expirou ou se há bloqueio de IP." : 
								 response.status === 401 ? "Não autorizado (401). Cookie inválido." : 
								 `Erro ${response.status}. Verifique o log de sistema.`;
				new Notice(errorMsg);
				this.plugin.logger.log(`Falha na autenticação: ${response.status}`, 'ERROR', response.text);
			}
		} catch (error) {
			this.isConnected = false;
			new Notice("Erro de Rede: Não foi possível alcançar o Substack.");
			this.plugin.logger.log("Exceção de rede no Test Connection", 'ERROR', error);
		} finally {
			notice.hide();
		}
		
		if (this.connectionDotEl && this.connectionTextEl) {
			this.connectionDotEl.className = `status-dot ${this.isConnected ? 'green' : 'red'}`;
			this.connectionTextEl.setText(this.isConnected ? " Conectado" : " Desconectado");
		} else {
			this.render();
		}
	}

	async onClose() {
		// Cleanup if needed
	}
}
