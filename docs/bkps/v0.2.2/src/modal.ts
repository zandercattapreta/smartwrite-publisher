import { App, Modal } from "obsidian";

export class HelpModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("smartwrite-help-modal");

		contentEl.createEl("h2", { text: "Como usar o SmartWrite Publisher" });

		const steps = contentEl.createEl("ol");
		steps.createEl("li", { text: "Abra o Substack no seu navegador (Chrome/Edge/Firefox)." });
		steps.createEl("li", { text: "Faça login na sua conta." });
		steps.createEl("li", { text: "Abra as Ferramentas do Desenvolvedor (F12 ou Cmd+Opt+I)." });
		steps.createEl("li", { text: "Vá na aba 'Application' (ou 'Storage') > 'Cookies' > 'https://substack.com'." });
		steps.createEl("li", { text: "Procure pelo cookie chamado 'substack.sid'." });
		steps.createEl("li", { text: "Copie o valor binário (o 'Value') e cole nas configurações deste plugin." });
		steps.createEl("li", { text: "Insira também a URL da sua publicação (ex: https://suapub.substack.com)." });

		contentEl.createEl("p", { 
			text: "Nota: O cookie substack.sid expira após algum tempo. Se a conexão falhar, repita o processo.",
			cls: "help-note"
		});

		const closeBtn = contentEl.createEl("button", { text: "Entendi!" });
		closeBtn.onclick = () => this.close();
        closeBtn.addClass("mod-cta");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
