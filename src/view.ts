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

	async onOpen() {
		this.render();
	}

	render() {
		const container = this.containerEl.children[1];
		if (!container) return;
		
		container.empty();
		container.addClass("smartwrite-publisher-sidebar");

		container.createEl("h4", { text: "SmartWrite Publisher" });

		// --- Section: Active Note ---
		const activeNoteSection = container.createDiv({ cls: "publisher-section" });
		activeNoteSection.createEl("h5", { text: "Nota Ativa" });
		const noteInfo = activeNoteSection.createDiv({ cls: "note-info" });
		noteInfo.createEl("p", { 
			text: this.activeFile ? this.activeFile.basename : "Nenhuma nota selecionada", 
			cls: "note-name" 
		});
		
		activeNoteSection.createSpan({ text: "Pendente", cls: "status-badge" });

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
		connectionStatus.createSpan({ cls: `status-dot ${this.isConnected ? 'green' : 'red'}` });
		connectionStatus.createSpan({ text: this.isConnected ? " Conectado" : " Desconectado" });

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
		this.render();
	}

	async testConnection() {
		if (!this.plugin.settings.cookies) {
			new Notice("Por favor, insira os cookies primeiro.");
			return;
		}

		new Notice("Testando conexão...");
		try {
			// Endpoint leve do Substack para validar sessão
			const response = await requestUrl({
				url: "https://substack.com/api/v1/user",
				method: "GET",
				headers: {
					"Cookie": `substack.sid=${this.plugin.settings.cookies}`
				}
			});

			if (response.status === 200 && response.json.id) {
				this.isConnected = true;
				new Notice(`Conectado como: ${response.json.name || response.json.email}`);
			} else {
				this.isConnected = false;
				new Notice("Falha na conexão. Cookies inválidos ou expirados.");
			}
		} catch (error) {
			this.isConnected = false;
			console.error("Erro ao testar conexão:", error);
			new Notice("Erro ao conectar ao Substack. Verifique sua rede e cookies.");
		}
		this.render();
	}

	async onClose() {
		// Cleanup if needed
	}
}
