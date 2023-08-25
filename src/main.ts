// npm i -D electron fs-extra 
// npm i -D @types/fs-extra
let dialog: any = null;
try {
	const electron = require("electron");
	dialog = electron.remote.dialog;//  electron.dialog wrong
	// dialog = electron.dialog;//  electron.dialog wrong
} catch {
	console.debug("electron not found");
}

import { App, Menu, MenuItem, Notice, Plugin, PluginSettingTab, TFile, normalizePath } from 'obsidian';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfirmModal } from './confirm_modal';

//- move folder or file(s) out of the vault
//- if a folder already exists and you accept to replace it, 
//  it will move files and replace duplicate existing ones. 
//- todo: plusieurs files

interface ToolsSettings {
}

const DEFAULT_SETTINGS: ToolsSettings = {
}

export default class Tools extends Plugin {
	settings: ToolsSettings;
	applyAll: boolean = false
	files: TFile[]

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ETVSettingTab(this.app, this));
		this.registerEvent((this.app as any).
			workspace.on("file-menu", (menu: Menu, file: TFile) => {
				menu.addItem((item: MenuItem) => {
					item.setTitle("Move Out From Vault");
					item.setIcon("scissors");
					item.onClick(async () => {
						this.openFileExplorer(file)
					});
				})
			}));

		this.registerEvent((this.app as any).
			workspace.on("files-menu", (menu: Menu, files: TFile[]) => {
				menu.addItem((item: MenuItem) => {
					item.setTitle("Move Out From Vault");
					item.setIcon("scissors");
					item.onClick(async () => {
						this.openFileExplorer(files)
					});
				})
			}))
	}

	openFileExplorer = async (file: TFile | TFile[]) => {
		this.applyAll= false
		try {
			const selectedPath: string = await this.picker()
			if (!selectedPath) return
			this.treatFiles(file, selectedPath)
		} catch (err) {
			console.debug("err", err)
			const notice = new Notice('Select a folder to copy the file to.');
			notice.noticeEl.addClass('red-background') // document.querySelector('.notice')
		}
	};

	treatFiles(file: TFile | TFile[], selectedPath: string) {

		if (Array.isArray(file) && file.length) {
			this.files = [...file]
			this.MoveItem(this.files.pop() as TFile, selectedPath)
		}
		else {
			this.MoveItem(file as TFile, selectedPath)
		}
	}

	async MoveItem(file: TFile, selectedPath: string) {
		if (!file) return
		const { normalizedFullPath, fileName, destinationPath } = this.getDestinationPath(file as TFile, selectedPath)

		await this.doCopy(normalizedFullPath, fileName, destinationPath, selectedPath)

		// Remove the original file
		// await fs.remove(normalizedFullPath);
		console.debug('Original file has been deleted.');
	}

	async picker() {
		let picker = await dialog.showOpenDialog({
			properties: ['openDirectory'],
		});

		if (picker.canceled) {
			console.debug('Folder selection was canceled.');
			return;
		}

		return picker.filePaths[0];
	}

	getDestinationPath(file: TFile, selectedPath: string) {
		const filePath = (this.app as any).vault.adapter.getFullPath(file.path);
		const normalizedFullPath = normalizePath(filePath);
		const fileName = path.basename(normalizedFullPath);
		const destinationPath = path.join(selectedPath, fileName)
		return { normalizedFullPath, fileName, destinationPath, };
	}

	async doCopy(
		normalizedFullPath: string,
		fileName: string,
		destinationPath: string,
		selectedPath: string,
	) {
		const fileExists = await fs.pathExists(destinationPath);
		if (fileExists) { // file already exists
			console.log("ici")

			if (!this.applyAll) new ConfirmModal(this.app, this, (result) => {
				if (result === 1) {
					this.confirm(fileName, selectedPath, normalizedFullPath, destinationPath, 1)
					if (this.files && this.files.length) {
						this.MoveItem(this.files.pop() as TFile, selectedPath)
					}
				}
				else if (result === 2) {
					this.confirm(fileName, selectedPath, normalizedFullPath, destinationPath, 2)
					if (this.files && this.files.length) {
						this.MoveItem(this.files.pop() as TFile, selectedPath)
					}
				} else {
					console.log("result", result)
					return
				}
			}).open()
		} else {
			await fs.copy(normalizedFullPath, destinationPath);
			console.debug('File was successfully copied.');
		}
	}

	async confirm(
		fileName: string,
		selectedPath: string,
		normalizedFullPath: string,
		destinationPath: string,
		choice:number
	) {
		if (choice === 2) {
			// Create an incremented version
			const baseFileName = path.parse(fileName).name;
			const extension = path.parse(fileName).ext;
			let version = 1;
			let versionedFileName = `${baseFileName} (${version})${extension}`;
			while (await fs.pathExists(path.join(selectedPath, versionedFileName))) {
				version++;
				versionedFileName = `${baseFileName} (${version})${extension}`;
			}
			await fs.copy(normalizedFullPath, path.join(selectedPath, versionedFileName));
			console.debug('File was successfully copied as', versionedFileName);
		} else {
			await fs.copy(normalizedFullPath, destinationPath);
			console.debug('File was successfully moved.');
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
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
		containerEl.createEl('h2', { text: 'Tools' });

	}
}