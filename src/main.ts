import {
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { addMovetoVault } from "./move to vault/move-to-vault";
import { ToolsSettingTab } from "./settings";
import { ToolsSettings } from "./types";
import { registerSFD } from "./search from directory/search-from-directory";
import { registerOutOfVault } from "./move out from vault/move-out-menus";
import { DEFAULT_SETTINGS } from "./variables";

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


