import {
	Notice,
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { addMovetoVault } from "./move to vault/move-to-vault";
import { ToolsSettingTab } from "./settings";
import { registerSFD } from "./search from directory/search-from-directory";
import { registerOutOfVault } from "./move out from vault/move-out-menus";
import { DEFAULT_SETTINGS } from "./variables";
import { ToolsSettings } from "./types/global";
import { cb, onCommandTrigger } from "./last-command";

export default class Tools extends Plugin {
	settings: ToolsSettings;
	files: TFile[] | TFolder[];
	lastCommand: string | null

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

		this.register(
			onCommandTrigger("command-palette:open", this, async (plugin) => {
				document.addEventListener("click", (e) => cb(e, plugin));
			})
		);

		this.addCommand({
			id: "repeat-command",
			name: "Repeat last command",
			callback: async () => {
				if (this.lastCommand) this.app.commands.executeCommandById(this.lastCommand)
				else new Notice("No last command")
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