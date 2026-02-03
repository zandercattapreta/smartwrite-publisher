import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import SmartWritePublisher from "./main";
import { HelpModal } from "./modal";

/**
 * Represents the settings tab for the SmartWrite Publisher plugin.
 * Allows users to configure Substack connection details and test the connection.
 */
export class SmartWriteSettingTab extends PluginSettingTab {
	plugin: SmartWritePublisher;

	/**
	 * Creates an instance of SmartWriteSettingTab.
	 * @param app The Obsidian application instance.
	 * @param plugin The SmartWritePublisher plugin instance.
	 */
	constructor(app: App, plugin: SmartWritePublisher) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Renders the settings UI for the plugin.
	 * This method dynamically creates UI elements for configuring Substack cookies, URL, and connection testing.
	 */
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings: SmartWrite Publisher" });

		// Substack Settings
		containerEl.createEl("h3", { text: "Substack Configuration" });

		new Setting(containerEl)
			.setName("Substack cookies")
			.setDesc("Enter the 'substack.sid' cookie value. Keep it safe.")
			.addText((text) =>
				text
					.setPlaceholder("Paste substack.sid here...")
					.setValue(this.plugin.settings.cookies)
					.onChange(async (value) => {
						this.plugin.settings.cookies = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Substack URL")
			.setDesc("The main URL of your publication (e.g., https://yourname.substack.com).")
			.addText((text) =>
				text
					.setPlaceholder("https://yourname.substack.com")
					.setValue(this.plugin.settings.substackUrl)
					.onChange(async (value) => {
						this.plugin.settings.substackUrl = value;
						await this.plugin.saveSettings();
						// testConnection is triggered by saveSettings, but we can also trigger specific platform test
						this.plugin.testConnection(); // Substack's main test
					})
			);

		new Setting(containerEl)
			.setName("Test Substack connection")
			.setDesc("Verify if the cookies and URL are correct for Substack.")
			.addButton((btn) =>
				btn.setButtonText("Test connection").onClick(async () => {
					await this.plugin.testConnection(); // Substack's main test
				})
			);

		// Medium Settings
		containerEl.createEl("h3", { text: "Medium Configuration" });

		new Setting(containerEl)
			.setName("Medium API Key")
			.setDesc("Enter your Medium Integration Token. Note: As of 2025, new tokens must be requested via email to yourfriends@medium.com.")
			.addText((text) =>
				text
					.setPlaceholder("Paste Medium API Key here...")
					.setValue(this.plugin.settings.mediumApiKey)
					.onChange(async (value) => {
						this.plugin.settings.mediumApiKey = value;
						await this.plugin.saveSettings();
						// Trigger Medium-specific test after saving
						this.plugin.platformManager.testConnections('medium');
					})
			);

		new Setting(containerEl)
			.setName("Test Medium connection")
			.setDesc("Verify if the API Key is correct for Medium.")
			.addButton((btn) =>
				btn.setButtonText("Test connection").onClick(async () => {
					new Notice("Testing Medium connection...");
					const results = await this.plugin.platformManager.testConnections('medium');
					const result = results.get('medium');
					if (result?.success) {
						new Notice(`Successfully connected to Medium as ${result.user?.name || 'User'}.`);
					} else {
						new Notice(`Medium connection failed: ${result?.error || 'Unknown error'}`);
					}
				})
			);

		// WordPress Settings
		containerEl.createEl("h3", { text: "WordPress Configuration" });

		new Setting(containerEl)
			.setName("WordPress URL")
			.setDesc("The base URL of your WordPress site (e.g., https://yoursite.com).")
			.addText((text) =>
				text
					.setPlaceholder("https://yoursite.com")
					.setValue(this.plugin.settings.wordpressConfig.url)
					.onChange(async (value) => {
						this.plugin.settings.wordpressConfig.url = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("WordPress Username")
			.setDesc("WordPress username. Set to 'token' if using a Personal Access Token.")
			.addText((text) =>
				text
					.setPlaceholder("your_username")
					.setValue(this.plugin.settings.wordpressConfig.username)
					.onChange(async (value) => {
						this.plugin.settings.wordpressConfig.username = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("WordPress App Password / Token")
			.setDesc("Application Password (WP.org) or Personal Access Token (WP.com).")
			.addText((text) =>
				text
					.setPlaceholder("Paste application password here...")
					.setValue(this.plugin.settings.wordpressConfig.appPassword)
					.onChange(async (value) => {
						this.plugin.settings.wordpressConfig.appPassword = value;
						await this.plugin.saveSettings();
						// Trigger WordPress-specific test after saving
						this.plugin.platformManager.testConnections('wordpress');
					})
			);

		new Setting(containerEl)
			.setName("Test WordPress connection")
			.setDesc("Verify if the URL, username, and application password are correct for WordPress.")
			.addButton((btn) =>
				btn.setButtonText("Test connection").onClick(async () => {
					new Notice("Testing WordPress connection...");
					const results = await this.plugin.platformManager.testConnections('wordpress');
					const result = results.get('wordpress');
					if (result?.success) {
						new Notice(`Successfully connected to WordPress as ${result.user?.name || 'User'}.`);
					} else {
						new Notice(`WordPress connection failed: ${result?.error || 'Unknown error'}`);
					}
				})
			);

		containerEl.createEl("h4", { text: "Help and support" });

		new Setting(containerEl)
			.setName("How to get Medium token?")
			.setDesc("Medium tokens are currently restricted. Email yourfriends@medium.com to request one.")
			.addButton((btn) =>
				btn.setButtonText("Copy Email").onClick(() => {
					navigator.clipboard.writeText("yourfriends@medium.com");
					new Notice("Email copied to clipboard!");
				})
			);

		new Setting(containerEl)
			.setName("WordPress.com: Still missing?")
			.setDesc("If on a FREE plan, Application Passwords are blocked. Workaround: Create a 'Personal Access Token' in the [Developer Portal](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/#personal-access-tokens) and use it with username 'token'.")
			.addButton((btn) =>
				btn.setButtonText("Developer Portal").onClick(() => {
					window.open("https://developer.wordpress.com/apps/");
				})
			);

		new Setting(containerEl)
			.setName("How to get Substack cookies?")
			.setDesc("Click the button below to see the step-by-step guide for Substack.")
			.addButton((btn) =>
				btn.setButtonText("Open guide").onClick(() => {
					new HelpModal(this.app).open();
				})
			);
	}
}
