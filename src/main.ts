import {
	Command,
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
import { around } from "monkey-around";

export default class Tools extends Plugin {
	settings: ToolsSettings;
	files: TFile[] | TFolder[];
	lastCommand: string
	uninstallCommand: any

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

		// this.addCommand({
		// 	id: "repeat-command",
		// 	name: "Repeat last command",
		// 	callback: async () => {
		// 		const command = this.lastCommand
		// 		if (this.lastCommand) this.app.commands.executeCommandById(this.lastCommand)
		// 		else new Notice("No last command")
		// 	},
		// });

		// // this.register(this.exeCommandWrapper);
		// https://github.com/Zachatoo/obsidian-achievements/blob/179191eb8938bd5e9e30e309c36a7e76950da202/src/commands.ts
		this.register(
			onCommandTrigger("command-palette:open", async () => {
				console.log("totot")
				document.addEventListener("click", this.cb);
			})
		);
	}

	cb = (e: MouseEvent) => {
		const clickedElement = e.target as HTMLElement;
		console.log("clickedElement", clickedElement)
		const closestSpan = clickedElement.closest('span');

		if (closestSpan && closestSpan.tagName === 'SPAN') {
		// if (clickedElement.tagName === 'SPAN') {
			const name = clickedElement.innerText;
			console.log("text", name)
			// this.getCommandId(name)
			setTimeout(() => { console.log("app.lastEvent", app.lastEvent) }, 2000)
			setTimeout(() => { document.removeEventListener("click", this.cb); }, 2000)
			console.log('après un délai.');
		}
	}

	getCommandId(name: string) {


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



export function onCommandTrigger(id: string, cb: () => void) {
	const uninstallCommand = around(this.app.commands, {
		executeCommand(originalMethod) {
			return function (...args: Command[]) {
				if (args[0].id === id) {
					cb();
				}
				const result =
					originalMethod && originalMethod.apply(this, args);
				return result;
			};
		},
	});
	return uninstallCommand;
}