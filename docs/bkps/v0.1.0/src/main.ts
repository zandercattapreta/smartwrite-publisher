import { Notice, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { PublisherView, VIEW_TYPE_PUBLISHER } from "./view";

export interface SmartWriteSettings {
	cookies: string;
	substackUrl: string;
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
	cookies: '',
	substackUrl: 'https://thebreachrpg.substack.com'
}

export default class SmartWritePublisher extends Plugin {
	settings: SmartWriteSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE_PUBLISHER,
			(leaf) => new PublisherView(leaf, this)
		);

		this.addRibbonIcon('share-2', 'SmartWrite Publisher', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-smartwrite-publisher',
			name: 'Open Sidebar',
			callback: () => this.activateView(),
		});

		// Evento para detectar mudança de nota ativa
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => this.updateActiveNote())
		);
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
