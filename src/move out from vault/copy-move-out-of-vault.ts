import { Notice, TFile, TFolder, normalizePath } from "obsidian";
import { OutFromVaultConfirmModal } from "./out-of-vault-confirm_modal";
import * as fs from "fs-extra";
import * as path from "path";
import { openDirectoryInFileManager, picker } from "src/utils";

declare global {
	interface Window {
		electron: any;
	}
}

export async function movOpenFileExplorer(
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
		const resoledLinks = await hasResolvedLinks(file)
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

async function hasResolvedLinks(file: TFile | TFolder): Promise<TFile[] | undefined> {
	if (file instanceof TFolder) return
	const LinkFiles = []
	const metadataCache = await this.app.metadataCache.getCache(file?.path as string)
	console.debug("metadataCache", metadataCache)
	const metadataLinks = await metadataCache?.links || []
	const metadataEmbeds = await metadataCache?.embeds || []
	const fileLinks = [...new Set([...metadataLinks, ...metadataEmbeds])]
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
	for (const file of files) {
		await simpleCopy(file, selectedPath, move);
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
	const destinationPath = normalizePath(path.join(selectedPath, fileName));
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
			let versionedFileName = "";
			let version = 1;
			const regex = /^(.*) \((\d+)\)$/;
			const match = baseFileName.match(regex);
			if (match) {
				versionedFileName = `${match[1]} (${parseInt(match[2]) + 1})${extension}`
			} else {
				versionedFileName = `${baseFileName} (${version})${extension}`;
				while (
					await fs.pathExists(normalizePath(path.join(selectedPath, versionedFileName)))
				) {
					version++;
					versionedFileName = `${baseFileName} (${version})${extension}`;
				}
			}
			destinationPath = normalizePath(path.join(selectedPath, versionedFileName));
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
