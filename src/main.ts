import { App, Notice, Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";
import { SmartWriteSettingTab } from "./settings";
import { Logger } from "./logger";
import { SubstackService } from './substack/SubstackService'; // Still needed for compatibility layer during transition
import { PlatformManager } from './core/PlatformManager'; // New PlatformManager
import { SubstackAdapter } from './substack/SubstackAdapter'; // New SubstackAdapter
import { ConnectionConfig } from './substack/types'; // Substack-specific config type
import { ConnectionTestResult, UserInfo } from './core/BlogPlatformAdapter'; // Common adapter types
import { MediumAdapter } from './medium/MediumAdapter'; // New MediumAdapter
import { WordPressAdapter } from './wordpress/WordPressAdapter'; // New WordPressAdapter

export interface WordPressConfig {
	url: string;
	username: string;
	appPassword: string;
}

export interface SmartWriteSettings {
	cookies: string;
	substackUrl: string;
	mediumApiKey: string;
	wordpressConfig: WordPressConfig;
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
	cookies: '',
	substackUrl: '',
	mediumApiKey: '',
	wordpressConfig: {
		url: '',
		username: '',
		appPassword: ''
	}
};

/**
 * Main plugin class for SmartWrite Publisher.
 * Manages the plugin's lifecycle, settings, view registration, commands, and core services.
 */
export default class SmartWritePublisher extends Plugin {
	settings: SmartWriteSettings;
	logger: Logger = new Logger();
	// Old SubstackService is replaced by PlatformManager
	// substackService: SubstackService = new SubstackService(this.logger);
	platformManager: PlatformManager;
	connected: boolean = false; // This will now reflect the status of the primary adapter (Substack)

	constructor(app: App, manifest: any) {
		super(app, manifest);
		this.platformManager = new PlatformManager(this.logger); // Pass logger to PlatformManager
	}

	/**
	 * Lifecycle method called when the plugin is loaded.
	 * Initializes settings, registers views, commands, and event listeners.
	 */
	async onload() {
		try {
			await this.loadSettings();

			// Initialize and register Substack Adapter
			const substackAdapter = new SubstackAdapter(this.logger);
			this.platformManager.registerPlatform('substack', 'Substack', substackAdapter, {
				credentials: {
					cookie: this.settings.cookies,
					substackUrl: this.settings.substackUrl
				},
				isEnabled: true // Substack is the primary platform
			});
			// Configure the adapter directly after registration
			substackAdapter.configure({
				cookie: this.settings.cookies,
				substackUrl: this.settings.substackUrl
			});

			// Initialize and register Medium Adapter
			const mediumAdapter = new MediumAdapter(this.logger);
			this.platformManager.registerPlatform('medium', 'Medium', mediumAdapter, {
				credentials: {
					apiKey: this.settings.mediumApiKey
				},
				isEnabled: false // Medium is not primary, starts disabled
			});
			mediumAdapter.configure({
				apiKey: this.settings.mediumApiKey
			});

			// Initialize and register WordPress Adapter
			const wordpressAdapter = new WordPressAdapter(this.logger);
			this.platformManager.registerPlatform('wordpress', 'WordPress', wordpressAdapter, {
				credentials: {
					url: this.settings.wordpressConfig.url,
					username: this.settings.wordpressConfig.username,
					appPassword: this.settings.wordpressConfig.appPassword
				},
				isEnabled: false // WordPress is not primary, starts disabled
			});
			wordpressAdapter.configure({
				url: this.settings.wordpressConfig.url,
				username: this.settings.wordpressConfig.username,
				appPassword: this.settings.wordpressConfig.appPassword
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

			// Start background connection tests after a short delay
			setTimeout(() => this.testAllConnections(), 2000);
		} catch (e) {
			console.error("SmartWrite Publisher: Critical failure in onload:", e); // Changed to English
			this.logger.error("Critical failure during plugin onload", e);
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
	 * Also updates the configuration for all registered adapters via PlatformManager.
	 */
	async saveSettings() {
		await this.saveData(this.settings);

		// Update Substack adapter configuration via PlatformManager
		const substackPlatform = this.platformManager.getPlatform('substack');
		if (substackPlatform) {
			const config: ConnectionConfig = {
				cookie: this.settings.cookies,
				substackUrl: this.settings.substackUrl
			};
			this.platformManager.updatePlatformConfig('substack', { credentials: config });
			substackPlatform.adapter.configure(config); // Configure adapter directly
		}

		// Update Medium adapter configuration via PlatformManager
		const mediumPlatform = this.platformManager.getPlatform('medium');
		if (mediumPlatform) {
			const config = { apiKey: this.settings.mediumApiKey };
			this.platformManager.updatePlatformConfig('medium', { credentials: config });
			mediumPlatform.adapter.configure(config); // Configure adapter directly
		}

		// Update WordPress adapter configuration via PlatformManager
		const wordpressPlatform = this.platformManager.getPlatform('wordpress');
		if (wordpressPlatform) {
			const config = {
				url: this.settings.wordpressConfig.url,
				username: this.settings.wordpressConfig.username,
				appPassword: this.settings.wordpressConfig.appPassword
			};
			wordpressPlatform.adapter.configure(config); // Configure adapter directly
		}

		// Trigger background connection tests after settings update
		void this.testAllConnections();
	}

	/**
	 * Tests the connection to the configured Substack publication using the provided cookie.
	 * Displays notices to the user for feedback and updates the internal connection status.
	 * @returns A promise that resolves to a ConnectionTestResult.
	 */
	/**
	 * Tests the connection to the primary Substack platform.
	 * Returns the result for UI feedback in Settings or View.
	 */
	async testConnection(): Promise<ConnectionTestResult> {
		const substack = this.platformManager.getPlatform('substack');
		if (substack) {
			const result = await substack.adapter.testConnection();
			this.connected = result.success;
			
			// Notify view
			this.app.workspace.getLeavesOfType(VIEW_TYPE_PUBLISHER).forEach(leaf => {
				if (leaf.view instanceof PublisherView) {
					leaf.view.updateConnectionStatus();
				}
			});
			
			return result;
		}
		return { success: false, error: 'Substack platform not found' };
	}

	/**
	 * Tests connections for all registered and configured platforms in the background.
	 * Updates internal state and notifies the PublisherView to refresh its UI.
	 */
	async testAllConnections() {
		this.logger.log('Starting background connection tests for all platforms...', 'INFO');
		
		const platforms = this.platformManager.getAllPlatforms();

		for (const platform of platforms) {
			// Skip platforms that are obviously not configured
			const status = platform.adapter.getDetailedStatus();
			if (!status.isConfigured) continue;

			try {
				const result = await platform.adapter.testConnection();
				
				// If Substack (primary) succeeds, update the main 'connected' flag
				if (platform.id === 'substack') {
					this.connected = result.success;
				}
			} catch (e) {
				this.logger.error(`Background connection test failed for ${platform.name}`, e);
			}
		}

		// Notify any open PublisherView to refresh its status indicators
		this.app.workspace.getLeavesOfType(VIEW_TYPE_PUBLISHER).forEach(leaf => {
			if (leaf.view instanceof PublisherView) {
				leaf.view.updateConnectionStatus();
			}
		});

		this.logger.log('Background connection tests completed.', 'INFO');
	}
}