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

		containerEl.createEl("h2", { text: "Configurações: SmartWrite Publisher" });

		new Setting(containerEl)
			.setName("Substack Cookies")
			.setDesc("Insira o valor do cookie 'substack.sid'. Mantenha-o seguro.")
			.addText((text) =>
				text
					.setPlaceholder("Colar substack.sid aqui...")
					.setValue(this.plugin.settings.cookies)
					.onChange(async (value) => {
						this.plugin.settings.cookies = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Substack URL")
			.setDesc("A URL principal da sua publicação (ex: https://nome.substack.com).")
			.addText((text) =>
				text
					.setPlaceholder("https://meu.substack.com")
					.setValue(this.plugin.settings.substackUrl)
					.onChange(async (value) => {
						this.plugin.settings.substackUrl = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h4", { text: "Ajuda e Suporte" });
		
		new Setting(containerEl)
			.setName("Como conseguir os cookies?")
			.setDesc("Clique no botão abaixo para ver o guia passo-a-passo.")
			.addButton((btn) =>
				btn.setButtonText("Abrir Guia").onClick(() => {
					new HelpModal(this.app).open();
				})
			);
	}
}
