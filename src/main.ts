// TODO: move to vault increment ? add notice end operations. move attached deps links
import {
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { MultiFilesMenus, SingleFileMenus } from "./move out from vault/move-out-menus";
import { moveToVault } from "./move to vault/move-to-vault";

// interface ToolsSettings {}
// const DEFAULT_SETTINGS: ToolsSettings = {};

export default class Tools extends Plugin {
	// settings: ToolsSettings;
	files: TFile[] | TFolder[];

	async onload() {
		// await this.loadSettings();
		// this.addSettingTab(new ETVSettingTab(this.app, this));

		// move out from vault 1 file/dir selection
		this.registerEvent(
			SingleFileMenus()
		);
		// move out from vault 1 file selection multi selection
		this.registerEvent(
			MultiFilesMenus()
		);

		this.addCommand({
			id: 'move-files-to-vault',
			name: 'Move file(s) to Vault',
			callback: () => {
				moveToVault(false, true)
			}
		})

		this.addCommand({
			id: 'move-directory-to-vault',
			name: 'Move directory to Vault',
			callback: () => {
				moveToVault(true, true)
			}
		})

		this.addCommand({
			id: 'copy-files-to-vault',
			name: 'Copy file(s) to Vault',
			callback: () => {
				moveToVault(false)
			}
		})

		this.addCommand({
			id: 'copy-directory-to-vault',
			name: 'Copy directory to Vault',
			callback: () => {
				moveToVault(true)
			}
		})
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


