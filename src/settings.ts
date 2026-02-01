import { App, PluginSettingTab, Setting } from "obsidian";
import SmartWritePublisher from "./main";
import { HelpModal } from "./modal";

export class SmartWriteSettingTab extends PluginSettingTab {
	plugin: SmartWritePublisher;

	constructor(app: App, plugin: SmartWritePublisher) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings: SmartWrite Publisher" });

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
						this.plugin.testConnection(); // Try to validate in background
					})
			);

		new Setting(containerEl)
			.setName("Test connection")
			.setDesc("Verify if the cookies and URL are correct.")
			.addButton((btn) =>
				btn.setButtonText("Test connection").onClick(async () => {
					await this.plugin.testConnection();
				})
			);

		containerEl.createEl("h4", { text: "Help and support" });

		new Setting(containerEl)
			.setName("How to get the cookies?")
			.setDesc("Click the button below to see the step-by-step guide.")
			.addButton((btn) =>
				btn.setButtonText("Open guide").onClick(() => {
					new HelpModal(this.app).open();
				})
			);
	}
}
