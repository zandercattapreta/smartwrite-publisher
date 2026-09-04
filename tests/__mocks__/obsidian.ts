// Mock mínimo da API Obsidian para vitest
export class Notice {
	constructor(_msg?: string) {}
}
export class Modal {
	app: unknown;
	contentEl = { empty() {}, createEl() { return { setText() {} }; } };
	constructor(app: unknown) {
		this.app = app;
	}
	open() {}
	close() {}
}
export class Setting {
	constructor(_el: unknown) {}
	setName() { return this; }
	setDesc() { return this; }
	addText() { return this; }
	addButton() { return this; }
	addDropdown() { return this; }
}
export async function requestUrl(_opts: unknown) {
	return { status: 200, text: "{}", headers: {}, json: {} };
}
export type App = unknown;
export type TFile = { path: string; name: string; extension: string; basename: string };
