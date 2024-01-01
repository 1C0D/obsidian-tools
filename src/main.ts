// todo: improve import files to vault. where? path
// todo: copy vault profile. insert in UI

import {
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { addMovetoVault, registerMTVmenus } from "./move to vault/move-to-vault";
import { ToolsSettingTab } from "./settings";
import { registerSFD } from "./search from directory/search-from-directory";
import { registerOutOfVault } from "./move out from vault/move-out-menus";
import { DEFAULT_SETTINGS } from "./types/variables";
import { ToolsSettings } from "./types/global";
import { importProfile } from "./importProfile";

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
			registerMTVmenus.bind(this)()
		}

		if (this.settings["search-from-directory"]) {
			registerSFD.bind(this)()
		}

		this.addCommand({
			id: "vault-profile",
			name: "create vault profile",
			callback: async () => {
				importProfile(this)
			},
		});
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