import { Notice, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";
import { SmartWriteSettingTab } from "./settings";
import { HelpModal } from "./modal";

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

	async onload() {
		console.log("SmartWrite Publisher: Iniciando carregamento...");
		try {
			await this.loadSettings();

			this.addSettingTab(new SmartWriteSettingTab(this.app, this));

			this.registerView(
				VIEW_TYPE_PUBLISHER,
				(leaf) => {
					console.log("SmartWrite Publisher: Registrando view...");
					return new PublisherView(leaf, this);
				}
			);

			this.addRibbonIcon('share-2', 'SmartWrite Publisher', () => {
				console.log("SmartWrite Publisher: Botão Ribbon clicado.");
				this.activateView();
			});

			this.addCommand({
				id: 'open-smartwrite-publisher',
				name: 'Open Sidebar',
				callback: () => {
					console.log("SmartWrite Publisher: Comando disparado.");
					this.activateView();
				},
			});

			// Evento para detectar mudança de nota ativa
			this.registerEvent(
				this.app.workspace.on('active-leaf-change', () => {
					console.log("SmartWrite Publisher: Nota ativa mudou.");
					this.updateActiveNote();
				})
			);
			console.log("SmartWrite Publisher: Carregado com sucesso.");
		} catch (e) {
			console.error("SmartWrite Publisher: Falha crítica no onload:", e);
		}
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
	}
}
