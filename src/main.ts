import { Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";
import { SmartWriteSettingTab } from "./settings";
import { Logger } from "./logger";
import { SubstackService } from './substack';

export interface SmartWriteSettings {
	cookies: string;
	substackUrl: string;
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
	cookies: '',
	substackUrl: ''
}

export default class SmartWritePublisher extends Plugin {
	settings: SmartWriteSettings;
	logger: Logger = new Logger();
	substackService: SubstackService = new SubstackService(this.logger);
	connected: boolean = false;

	async onload() {
		try {
			await this.loadSettings();
			this.substackService.configure(this.settings.cookies, this.settings.substackUrl);

			this.addSettingTab(new SmartWriteSettingTab(this.app, this));

			this.registerView(
				VIEW_TYPE_PUBLISHER,
				(leaf) => new PublisherView(leaf, this)
			);

			this.addRibbonIcon('share-2', 'SmartWrite publisher', () => {
				void this.activateView();
			});

			this.addCommand({
				id: 'open-sidebar',
				name: 'Open sidebar',
				callback: () => {
					void this.activateView();
				},
			});

			// Evento para detectar mudança de nota ativa com DEBOUNCE
			const debouncedUpdate = this.debounce(() => this.updateActiveNote(), 500);
			this.registerEvent(
				this.app.workspace.on('active-leaf-change', debouncedUpdate)
			);
		} catch (e) {
			console.error("SmartWrite Publisher: Falha crítica no onload:", e);
		}
	}

	// Utilitário de Debounce para otimização
	debounce(func: (...args: unknown[]) => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return (...args: unknown[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	}

	async updateActiveNote() {
		const activeFile = this.app.workspace.getActiveFile();
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PUBLISHER);
		if (leaves.length > 0 && activeFile) {
			const leaf = leaves[0];
			if (leaf && leaf.view instanceof PublisherView) {
				leaf.view.updateActiveNote(activeFile);
			}
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_PUBLISHER);

		if (leaves.length > 0) {
			const firstLeaf = leaves[0];
			if (firstLeaf) {
				leaf = firstLeaf;
			}
		} else {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: VIEW_TYPE_PUBLISHER, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		// View will be automatically unregistered
	}

	async loadSettings() {
		const data = await this.loadData() as Partial<SmartWriteSettings> | undefined;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.substackService.configure(this.settings.cookies, this.settings.substackUrl);
	}

	async testConnection() {
		if (!this.settings.cookies || !this.settings.substackUrl) {
			new Notice("Por favor, configure os cookies e a URL primeiro.");
			this.connected = false;
			return { success: false, error: "Configuração incompleta" };
		}

		const notice = new Notice("Testando conexão...", 0);
		try {
			const result = await this.substackService.testConnection();
			this.connected = result.success;

			if (result.success && result.user) {
				new Notice(`Conectado com sucesso como: ${result.user.name}`);

				// Notifica a view se ela estiver aberta
				this.app.workspace.getLeavesOfType(VIEW_TYPE_PUBLISHER).forEach(leaf => {
					if (leaf.view instanceof PublisherView) {
						leaf.view.isConnected = true;
						leaf.view.updateConnectionStatus();
					}
				});

				return result;
			} else {
				new Notice(result.error || "Falha na conexão.");
				return result;
			}
		} catch (error) {
			this.connected = false;
			new Notice("Erro inesperado ao testar conexão.");
			return { success: false, error: String(error) };
		} finally {
			notice.hide();
		}
	}
}
