import {
	App,
	Menu,
	MenuItem,
	Notice,
	Plugin,
	PluginSettingTab,
	TFile,
	TFolder,
	normalizePath,
} from "obsidian";
import * as fs from "fs-extra";
import * as path from "path";
import { OutFromVaultConfirmModal } from "./confirm_modal";

//- move folder(s) or file(s) out of the vault
//- if a folder already exists and you accept to replace it,
//  it will move files and replace duplicate existing ones.

declare global {
	interface Window {
		electron: any;
	}
}

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
						item.setTitle("Copy Out From Vault");
						item.setIcon("copy");
						item.onClick(async () => {
							this.openFileExplorer(file);
						});
					});
					menu.addItem((item: MenuItem) => {
						item.setTitle("Move Out From Vault");
						item.setIcon("scissors");
						item.onClick(async () => {
							this.openFileExplorer(file, true);
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
							// console.log("files", files);
							this.openFileExplorer(files);
						});
					});
					menu.addItem((item: MenuItem) => {
						item.setTitle("Move Out From Vault");
						item.setIcon("scissors");
						item.onClick(async () => {
							// console.log("files", files);
							this.openFileExplorer(files, true);
						});
					});
				}
			)
		);
	}

	async doesFileExists(
		file: TFile | TFolder,
		selectedPath: string
	): Promise<boolean> {
		const { destinationPath } = this.getDestinationPath(
			file as TFile | TFolder,
			selectedPath
		);
		const fileExists = await fs.pathExists(destinationPath);
		if (fileExists) {
			return true;
		}
		return false;
	}

	openFileExplorer = async (
		files: TFile | TFile[] | TFolder | TFolder[],
		move?: boolean
	) => {
		const selectedPath: string = await this.picker();
		if (!selectedPath) return;
		let runModal;
		if (Array.isArray(files)) {
			for (const file of files) {
				runModal = await this.doesFileExists(file, selectedPath);
			}
		} else {
			runModal = await this.doesFileExists(files, selectedPath);
		}
		if (runModal) {
			new OutFromVaultConfirmModal(this.app, this, (result) => {
				console.debug("result", result);
				if (result === 0) {
					console.debug("closed");
					return;
				}
				this.handler(result, files, selectedPath, move);
			}).open();
		} else {
			if (move) await this.withoutModal(files, selectedPath, true);
			else await this.withoutModal(files, selectedPath);
		}
	};

	async withoutModal(
		files: TFile | TFile[] | TFolder | TFolder[],
		selectedPath: string,
		move?: boolean
	) {
		if (Array.isArray(files)) {
			for (const file of files) {
				await this.simpleCopy(file, selectedPath, move);
			}
		} else {
			await this.simpleCopy(files, selectedPath, move);
		}
		new Notice(`File(s) copied to ${selectedPath}`, 4000);
	}

	async simpleCopy(
		file: TFile | TFolder,
		selectedPath: string,
		move?: boolean
	) {
		const { normalizedFullPath, fileName, destinationPath } =
			this.getDestinationPath(file as TFile | TFolder, selectedPath);
		await fs.copy(normalizedFullPath, destinationPath);
		if (move) {
			this.app.vault.trash(file, true);
		}
	}

	handler(
		result: number,
		files: TFile | TFile[] | TFolder | TFolder[],
		selectedPath: string,
		move?: boolean
	) {
		if (Array.isArray(files)) {
			for (const file of files)
				this.MoveItem(
					file as TFile | TFolder,
					selectedPath,
					result,
					move
				);
		} else {
			this.MoveItem(files as TFile | TFolder, selectedPath, result, move);
		}
		if (move) new Notice(`File(s) moved to ${selectedPath}`, 4000);
		else new Notice(`File(s) copied to ${selectedPath}`, 4000);
	}

	async MoveItem(
		file: TFile | TFolder,
		selectedPath: string,
		result: number,
		move?: boolean
	) {
		const { normalizedFullPath, fileName, destinationPath } =
			this.getDestinationPath(file as TFile | TFolder, selectedPath);

		this.makeCopy(
			file,
			fileName,
			selectedPath,
			normalizedFullPath,
			destinationPath,
			result,
			move
		);
	}

	getDestinationPath(file: TFile | TFolder, selectedPath: string) {
		const filePath = (this.app as any).vault.adapter.getFullPath(file.path);
		const normalizedFullPath = normalizePath(filePath);
		const fileName = path.basename(normalizedFullPath);
		const destinationPath = path.join(selectedPath, fileName);
		return { normalizedFullPath, fileName, destinationPath };
	}

	async picker() {
		let dirPath: string[] =
			window.electron.remote.dialog.showOpenDialogSync({
				title: "Select your vault directory, you want plugins list from",
				properties: ["openDirectory"],
			});
		return dirPath[0];
	}

	async makeCopy(
		file: TFile | TFolder,
		fileName: string,
		selectedPath: string,
		normalizedFullPath: string,
		destinationPath: string,
		choice: number,
		move?: boolean
	) {
		if (choice === 2) {
			console.log("choice 2");
			const fileExists = await fs.pathExists(destinationPath);
			if (fileExists) {
				const baseFileName = path.parse(fileName).name;
				const extension = path.parse(fileName).ext;
				let version = 1;
				let versionedFileName = `${baseFileName} (${version})${extension}`;
				while (
					await fs.pathExists(
						path.join(selectedPath, versionedFileName)
					)
				) {
					version++;
					versionedFileName = `${baseFileName} (${version})${extension}`;
				}
				destinationPath = path.join(selectedPath, versionedFileName);
			}
			// Create an incremented version
		}
		await fs.copy(normalizedFullPath, destinationPath);
		if (move) {
			this.app.vault.trash(file, true);
		}
		console.debug("File was successfully copied as", destinationPath);
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
