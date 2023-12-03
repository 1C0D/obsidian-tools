import {
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { addMovetoVault, moveToVault } from "./move to vault/move-to-vault";
import { ToolsSettingTab } from "./settings";
import { DEFAULT_SETTINGS, ToolsSettings } from "./types";
import { registerOutOfVault } from "./move out from vault/out-of-vault-confirm_modal";
import { SfdToEditorMenu, SfdToFileMenu, registerSFD } from "./search from directory/search-from-directory";

export default class Tools extends Plugin {
	settings: ToolsSettings;
	files: TFile[] | TFolder[];

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ToolsSettingTab(this.app, this));
		if (this.settings["move-out-from-vault"]) {
			registerOutOfVault.bind(this)()
		}

		if (this.settings["move-to-vault"]) {
			addMovetoVault.bind(this)()
		}
		
		if (this.settings["search-from-directory"]) {
			registerSFD.bind(this)()
		}

		// this.app.workspace.onLayoutReady(() => {
		// 	let obsidianToolsCommands = Object.keys((this.app as any).commands.commands)
		// 		.filter((key) => {
		// 			return key.startsWith('obsidian-my-tools');
		// 		})
		// 		// .reduce((acc, [commandId, command]) => {
		// 		// 	acc[commandId] = command;
		// 		// 	return acc;
		// 		// }, {} as Record<string, any>);
		// 	console.log("obsidianToolsCommands", obsidianToolsCommands)
		// })
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


