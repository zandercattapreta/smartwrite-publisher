/**
 * @file This is the main plugin class for the Obsidian SmartWrite Publisher.
 * @description Manages plugin lifecycle, settings, view registration, and core functionalities like connection testing.
 */
import { Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";
import { SmartWriteSettingTab } from "./settings";
import { Logger } from "./logger";
import { SubstackService, type ConnectionConfig } from './substack/SubstackService';

export interface SmartWriteSettings {
	cookies: string;
	substackUrl: string;
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
	cookies: '',
	substackUrl: ''
}

/**
 * Main plugin class for SmartWrite Publisher.
 * Manages the plugin's lifecycle, settings, view registration, commands, and core services.
 */
export default class SmartWritePublisher extends Plugin {
	settings: SmartWriteSettings;
	logger: Logger = new Logger();
	substackService: SubstackService = new SubstackService(this.logger);
	connected: boolean = false;

	/**
	 * Lifecycle method called when the plugin is loaded.
	 * Initializes settings, registers views, commands, and event listeners.
	 */
	async onload() {
		try {
			await this.loadSettings();
			this.substackService.configure({
			cookie: this.settings.cookies,
			substackUrl: this.settings.substackUrl
		});

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

	/**
	 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
	 * have passed since the last time the debounced function was invoked.
	 * Used to optimize frequent calls to functions like `updateActiveNote`.
	 * @param func The function to debounce.
	 * @param wait The number of milliseconds to delay.
	 * @returns A new debounced function.
	 */
	debounce(func: (...args: unknown[]) => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return (...args: unknown[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	}

	/**
	 * Updates the active note displayed in the PublisherView.
	 * This method is typically called in response to an 'active-leaf-change' event, debounced.
	 */
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

	/**
	 * Activates (opens or reveals) the PublisherView sidebar.
	 * If the view is already open, it reveals it; otherwise, it creates a new one.
	 */
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

	/**
	 * Lifecycle method called when the plugin is unloaded.
	 * Performs cleanup tasks, though views are typically unregistered automatically.
	 */
	onunload() {
	}

	/**
	 * Loads the plugin settings from storage.
	 * If no settings are found, default settings are applied.
	 */
	async loadSettings() {
		const data = await this.loadData() as Partial<SmartWriteSettings> | undefined;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
	}

	/**
	 * Saves the current plugin settings to storage.
	 * Also reconfigures the Substack service with the updated connection details.
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.substackService.configure({
			cookie: this.settings.cookies,
			substackUrl: this.settings.substackUrl
		});
	}

	/**
	 * Tests the connection to the configured Substack publication using the provided cookie.
	 * Displays notices to the user for feedback and updates the internal connection status.
	 * @returns A promise that resolves to an object indicating success and potentially user information or an error.
	 */
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
