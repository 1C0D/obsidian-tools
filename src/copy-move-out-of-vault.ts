import { Notice, Plugin, TFile, TFolder, normalizePath } from "obsidian";
import { OutFromVaultConfirmModal } from "./out-of-vault-confirm_modal";
import * as fs from "fs-extra";
import * as path from "path";

//- move/copy folder(s) or file(s) out of the vault
//  it will move files and replace duplicate existing ones. incremental option if file already exists in destination

declare global {
	interface Window {
		electron: any;
	}
}

export async function openFileExplorer(
	files: TFile | TFile[] | TFolder | TFolder[],
    job:string,
	move?: boolean
) {
	const selectedPath: string = await picker(job);
	if (!selectedPath) return;
	let runModal;
	if (Array.isArray(files)) {
		for (const file of files) {
			runModal = await doesFileExists(file, selectedPath);
		}
	} else {
		runModal = await doesFileExists(files, selectedPath);
	}
	if (runModal) {
		new OutFromVaultConfirmModal(this.app, this, (result) => {
			console.debug("result", result);
			if (result === 0) {
				console.debug("closed");
				return;
			}
			handler(result, files, selectedPath, move);
		}).open();
	} else {
		if (move) await withoutModal(files, selectedPath, true);
		else await withoutModal(files, selectedPath);
	}
}

async function doesFileExists(
	file: TFile | TFolder,
	selectedPath: string
): Promise<boolean> {
	const { destinationPath } = getDestinationPath(
		file as TFile | TFolder,
		selectedPath
	);
	const fileExists = await fs.pathExists(destinationPath);
	if (fileExists) {
		return true;
	}
	return false;
}

async function withoutModal(
	files: TFile | TFile[] | TFolder | TFolder[],
	selectedPath: string,
	move?: boolean
) {
	if (Array.isArray(files)) {
		for (const file of files) {
			await simpleCopy(file, selectedPath, move);
		}
	} else {
		await simpleCopy(files, selectedPath, move);
	}
	new Notice(`File(s) copied to ${selectedPath}`, 4000);
}

async function simpleCopy(
	file: TFile | TFolder,
	selectedPath: string,
	move?: boolean
) {
	const { normalizedFullPath, fileName, destinationPath } =
		getDestinationPath(file as TFile | TFolder, selectedPath);
	await fs.copy(normalizedFullPath, destinationPath);
	if (move) {
		this.app.vault.trash(file, true);
	}
}

function handler(
	result: number,
	files: TFile | TFile[] | TFolder | TFolder[],
	selectedPath: string,
	move?: boolean
) {
	if (Array.isArray(files)) {
		for (const file of files)
			moveItem(file as TFile | TFolder, selectedPath, result, move);
	} else {
		moveItem(files as TFile | TFolder, selectedPath, result, move);
	}
	if (move) new Notice(`File(s) moved to ${selectedPath}`, 4000);
	else new Notice(`File(s) copied to ${selectedPath}`, 4000);
}

async function moveItem(
	file: TFile | TFolder,
	selectedPath: string,
	result: number,
	move?: boolean
) {
	const { normalizedFullPath, fileName, destinationPath } =
		getDestinationPath(file as TFile | TFolder, selectedPath);

	makeCopy(
		file,
		fileName,
		selectedPath,
		normalizedFullPath,
		destinationPath,
		result,
		move
	);
}

function getDestinationPath(file: TFile | TFolder, selectedPath: string) {
	const filePath = (this.app as any).vault.adapter.getFullPath(file.path);
	const normalizedFullPath = normalizePath(filePath);
	const fileName = path.basename(normalizedFullPath);
	const destinationPath = path.join(selectedPath, fileName);
	return { normalizedFullPath, fileName, destinationPath };
}

async function picker(job:string) {
    const message =
		job === "move"
			? "Move out from Vault: select directory"
			: "Copy out from Vault: select directory";
	let dirPath: string[] = window.electron.remote.dialog.showOpenDialogSync({
		title: message,
		properties: ["openDirectory"],
	});
	return dirPath[0];
}

async function makeCopy(
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
				await fs.pathExists(path.join(selectedPath, versionedFileName))
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
