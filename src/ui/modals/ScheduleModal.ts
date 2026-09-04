// ==============================================================================
// SCRIPT: ScheduleModal.ts
// DESCRIÇÃO: Modal para escolher data/hora de agendamento (BRT → ISO UTC)
// CHAMADO POR: view.ts (botão Schedule)
// TRAZ (CHAMA/IMPORTA): obsidian Modal/Setting/Notice
// CONTRATO: onConfirm(Date) quando o usuário confirma
// ==============================================================================

import { App, Modal, Setting, Notice } from "obsidian";

/**
 * Pede data/hora local e devolve Date (UTC via toISOString no adapter).
 */
export class ScheduleModal extends Modal {
	private onConfirm: (when: Date) => void;
	private localValue: string;

	constructor(app: App, onConfirm: (when: Date) => void) {
		super(app);
		this.onConfirm = onConfirm;
		// Default: amanhã 09:00 no fuso local do sistema
		const d = new Date();
		d.setDate(d.getDate() + 1);
		d.setHours(9, 0, 0, 0);
		this.localValue = toDatetimeLocalValue(d);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Agendar no Substack" });
		contentEl.createEl("p", {
			text: "Horário no fuso do Mac. 9h Brasília = 12:00 UTC (sem horário de verão).",
		});

		new Setting(contentEl)
			.setName("Data e hora")
			.addText((text) => {
				text.inputEl.type = "datetime-local";
				text.setValue(this.localValue);
				text.onChange((v) => {
					this.localValue = v;
				});
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancelar").onClick(() => this.close()),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Agendar")
					.setCta()
					.onClick(() => {
						const when = new Date(this.localValue);
						if (isNaN(when.getTime())) {
							new Notice("Data inválida.");
							return;
						}
						if (when.getTime() <= Date.now()) {
							new Notice("Escolha uma data no futuro.");
							return;
						}
						this.close();
						this.onConfirm(when);
					}),
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

function toDatetimeLocalValue(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
