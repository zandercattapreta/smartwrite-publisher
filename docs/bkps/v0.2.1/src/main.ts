import { Notice, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";
import { SmartWriteSettingTab } from "./settings";
import { HelpModal } from "./modal";
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

	async onload() {
		try {
			await this.loadSettings();
			this.substackService.configure(this.settings.cookies, this.settings.substackUrl);

			this.addSettingTab(new SmartWriteSettingTab(this.app, this));

			this.registerView(
				VIEW_TYPE_PUBLISHER,
				(leaf) => new PublisherView(leaf, this)
			);

			this.addRibbonIcon('share-2', 'SmartWrite Publisher', () => {
				this.activateView();
			});

			this.addCommand({
				id: 'open-smartwrite-publisher',
				name: 'Open Sidebar',
				callback: () => this.activateView(),
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
	debounce(func: Function, wait: number) {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
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
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.substackService.configure(this.settings.cookies, this.settings.substackUrl);
	}

	async testConnection() {
		if (!this.settings.cookies || !this.settings.substackUrl) {
			new Notice("Por favor, configure os cookies e a URL primeiro.");
			return { success: false, error: "Configuração incompleta" };
		}

		const notice = new Notice("Testando conexão...", 0);
		try {
			const result = await this.substackService.testConnection();
			if (result.success && result.user) {
				new Notice(`Conectado com sucesso como: ${result.user.name}`);
				return result;
			} else {
				new Notice(result.error || "Falha na conexão.");
				return result;
			}
		} catch (error) {
			new Notice("Erro inesperado ao testar conexão.");
			return { success: false, error: String(error) };
		} finally {
			notice.hide();
		}
	}
}
