import {
	App,
	Menu,
	MenuItem,
	Plugin,
	PluginSettingTab,
	TFile,
	TFolder,
} from "obsidian";

import { openFileExplorer } from "./copy-move-out-of-vault";




// interface ToolsSettings {}

// const DEFAULT_SETTINGS: ToolsSettings = {};

export default class Tools extends Plugin {
	// settings: ToolsSettings;
	files: TFile[] | TFolder[];

	async onload() {
		// await this.loadSettings();
		// this.addSettingTab(new ETVSettingTab(this.app, this));

		// 1 file selection
		this.registerEvent(
			(this.app as any).workspace.on(
				"file-menu",
				(menu: Menu, file: TFile | TFolder) => {
					menu.addItem((item: MenuItem) => {
						item.setTitle("Copy Out Of Vault");
						item.setIcon("copy");
						item.onClick(async () => {
							openFileExplorer(file, "copy");
						});
					});
					menu.addItem((item: MenuItem) => {
						item.setTitle("Move Out Of Vault");
						item.setIcon("scissors");
						item.onClick(async () => {
							openFileExplorer(file,"move", true);
						});
					});
				}
			)
		);
		// multi files selection (or directories?)
		this.registerEvent(
			(this.app as any).workspace.on(
				"files-menu",
				(menu: Menu, files: TFile[] | TFolder[]) => {
					menu.addItem((item: MenuItem) => {
						item.setTitle("Copy Out From Vault");
						item.setIcon("copy");
						item.onClick(async () => {
							openFileExplorer(files,"copy");
						});
					});
					menu.addItem((item: MenuItem) => {
						item.setTitle("Move Out From Vault");
						item.setIcon("scissors");
						item.onClick(async () => {
							openFileExplorer(files,"move", true);
						});
					});
				}
			)
		);
	}



	

	// async loadSettings() {
	// 	this.settings = Object.assign(
	// 		{},
	// 		DEFAULT_SETTINGS,
	// 		await this.loadData()
	// 	);
	// }

	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }
}

class ETVSettingTab extends PluginSettingTab {
	plugin: Tools;

	constructor(app: App, plugin: Tools) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Tools" });
	}
}
