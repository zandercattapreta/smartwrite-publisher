import { App, Modal } from "obsidian";

export class HelpModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("smartwrite-help-modal");

		// eslint-disable-next-line obsidianmd/ui/sentence-case
		contentEl.createEl("h2", { text: "How to use SmartWrite Publisher" });

		const steps = contentEl.createEl("ol");
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		steps.createEl("li", { text: "Open Substack in your browser (Chrome/Edge/Firefox)." });
		steps.createEl("li", { text: "Log in to your account." });
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		steps.createEl("li", { text: "Open Developer Tools (F12 or Cmd+Opt+I)." });
		steps.createEl("li", { text: "Go to the 'Application' (or 'Storage') tab > 'Cookies' > 'https://substack.com'." });
		steps.createEl("li", { text: "Look for the cookie named 'substack.sid'." });
		steps.createEl("li", { text: "Copy the binary value (the 'Value') and paste it in this plugin's settings." });
		steps.createEl("li", { text: "Also enter the URL of your publication (e.g., https://yourpub.substack.com)." });

		contentEl.createEl("p", {
			text: "Note: The substack.sid cookie expires after some time. If the connection fails, repeat this process.",
			cls: "help-note"
		});

		const closeBtn = contentEl.createEl("button", { text: "Got it!" });
		closeBtn.onclick = () => this.close();
        closeBtn.addClass("mod-cta");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
