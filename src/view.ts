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

		new Notice("Testando conexão...");
		try {
			const response = await requestUrl({
				url: "https://substack.com/api/v1/user",
				method: "GET",
				headers: {
					"Cookie": `substack.sid=${this.plugin.settings.cookies}`
				},
				throw: false // Impede que o Obsidian jogue um erro genérico
			});

			if (response.status === 200 && response.json.id) {
				this.isConnected = true;
				new Notice(`Sucesso! Conectado como: ${response.json.name || response.json.email}`);
			} else {
				this.isConnected = false;
				const errorMsg = response.status === 403 ? "Acesso Proibido (403). Verifique se o cookie expirou." : 
								 response.status === 401 ? "Não autorizado (401). Cookie inválido." : 
								 `Erro ${response.status}. Verifique seus dados.`;
				new Notice(errorMsg);
				console.error("Substack Auth Fail:", response);
			}
		} catch (error) {
			this.isConnected = false;
			new Notice("Erro de Rede: Não foi possível alcançar o Substack.");
			console.error("Erro ao testar conexão:", error);
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
