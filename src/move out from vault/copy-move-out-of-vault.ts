// attached when copying directory?

import { Notice, TFile, TFolder, normalizePath } from "obsidian";
import { OutFromVaultConfirmModal } from "./out-of-vault-confirm_modal";
import * as fs from "fs-extra";
import * as path from "path";
import { openDirectoryInFileManager, picker } from "src/utils";

//- move/copy folder(s) or file(s) out of the vault
//  it will move files and replace duplicate existing ones. incremental option if file already exists in destination

declare global {
	interface Window {
		electron: any;
	}
}

export async function openFileExplorer(
	files: (TFile | TFolder)[],
	job: string,
	move?: boolean
) {
	const msg =
		job === "move"
			? "Move out of Vault: select directory"
			: "Copy out of Vault: select directory";
	const selectedPath = await picker(msg, ["openDirectory"]) as string;
	if (!selectedPath) return;
	let runModal: boolean = false;
	let attached: TFile[] = []
	for (const file of files) {
		const resoledLinks = hasResolvedLinks(file)
		if (resoledLinks?.length) { attached = [...new Set([...attached, ...resoledLinks])] }
		runModal = await fileAlreadyInDest(file, selectedPath);
		if (runModal) break
	}

	if (runModal || attached.length) {
		new OutFromVaultConfirmModal(this.app, runModal, attached, async (result) => {
			console.debug("result", result);
			if (!result) {
				console.debug("closed");
				return;
			}
			handler(result, files, selectedPath, move);
			await openDirectoryInFileManager(selectedPath)
		}).open();
	} else {
		if (move) await withoutModal(files, selectedPath, true);
		else await withoutModal(files, selectedPath);
		await openDirectoryInFileManager(selectedPath)
	}
}

function hasResolvedLinks(file: TFile | TFolder): TFile[] | undefined {
	if (file instanceof TFolder) return
	const LinkFiles = []
	const metadataCache = this.app.metadataCache.getCache(file?.path as string)
	const fileLinks = metadataCache?.links
	if (!fileLinks) return []
	for (const fileLink of fileLinks) {
		const link = fileLink.link
		const linkFile = this.app.metadataCache.getFirstLinkpathDest(link, "/")
		if (linkFile) LinkFiles.push(linkFile)
	}
	return LinkFiles
}

async function fileAlreadyInDest(
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
	files: (TFile | TFolder)[],
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
	const { normalizedFullPath, destinationPath } =
		getDestinationPath(file as TFile | TFolder, selectedPath);
	await fs.copy(normalizedFullPath, destinationPath);
	if (move) {
		this.app.vault.trash(file, true);
	}
}

function handler(
	result: { pastOption: number, attached: TFile[] },
	files: (TFile | TFolder)[],
	selectedPath: string,
	move?: boolean
) {
	if (result.attached?.length) { files = [...new Set([...files, ...result.attached])]; }
	for (const file of files)
		moveItem(file as TFile | TFolder, selectedPath, result.pastOption, move);
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



async function makeCopy(
	file: TFile | TFolder,
	fileName: string,
	selectedPath: string,
	normalizedFullPath: string,
	destinationPath: string,
	choice: number,
	move?: boolean
) {
	if (choice === 2) {	// Create an incremented version
		const fileExists = await fs.pathExists(destinationPath);
		if (fileExists) {
			const baseFileName = path.parse(fileName).name;
			const extension = path.parse(fileName).ext;
			let versionedFileName="";
			let version = 1;
			const regex = /^(.*) \((\d+)\)$/; // Expression régulière pour vérifier le format du nom de fichier
			const match = baseFileName.match(regex);
			if (match) {
				versionedFileName = `${match[1]} (${parseInt(match[2]) + 1})${extension}`
			}else{
				versionedFileName = `${baseFileName} (${version})${extension}`;
				while (
					await fs.pathExists(path.join(selectedPath, versionedFileName))
				) {
					version++;
					versionedFileName = `${baseFileName} (${version})${extension}`;
				}
			}
			destinationPath = path.join(selectedPath, versionedFileName);
		}
	}
	try { await fs.copy(normalizedFullPath, destinationPath); } catch (err) {
		console.log(err)
	}
	if (move) {
		this.app.vault.trash(file, true);
	}
	console.debug("File was successfully copied as", destinationPath);
}
