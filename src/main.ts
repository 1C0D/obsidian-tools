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
import { migrateProfile } from "./migratetProfile";
import { VaultsSuggest } from "./suggest";
import { VaultChooser } from "./vaultsModal";


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
			id: "import-vault-profile",
			name: "import vault profile",
			callback: async () => {
				new VaultChooser(this.app, true,(result) => {
					migrateProfile(this,true,result)
				}).open()
			},
		});
		this.addCommand({
			id: "export-vault-profile",
			name: "export vault profile",
			callback: async () => {
				new VaultChooser(this.app, false,(result) => {
					migrateProfile(this, false, result)
				}).open()
			}
		})
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