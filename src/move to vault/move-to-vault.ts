import * as path from "path";
import * as fs from "fs-extra";
import { picker } from "src/utils";
import { normalizePath } from "obsidian";


export function addMovetoVault() {
    this.addCommand({
        id: 'move-files-to-vault',
        name: 'Move file(s) to Vault',
        callback: () => {
            moveToVault(false, true)
        }
    })

    this.addCommand({
        id: 'move-directory-to-vault',
        name: 'Move directory to Vault',
        callback: () => {
            moveToVault(true, true)
        }
    })

    this.addCommand({
        id: 'copy-files-to-vault',
        name: 'Copy file(s) to Vault',
        callback: () => {
            moveToVault(false)
        }
    })

    this.addCommand({
        id: 'copy-directory-to-vault',
        name: 'Copy directory to Vault',
        callback: () => {
            moveToVault(true)
        }
    })
}

export async function moveToVault(directory: boolean, move?: boolean) {
    const vaultPath = (this.app as any).vault.adapter.getFullPath("");
    const msg = "Choose file(s) to import";
    const selectedPaths = directory ? await picker(msg, ['openDirectory', 'multiSelections']) as string[] : await picker(msg, ['openFile', 'multiSelections']) as string[];

    if (!selectedPaths) return;

    // move selected files to vault
    selectedPaths.forEach(async (p) => {
        const fileName = path.basename(p);
        const destination = normalizePath(path.join(vaultPath, fileName as string))
        try {
            if (move) {
                await fs.move(p, destination)
                console.debug(`Moved ${fileName} to vault`);
            }
            else {
                await fs.copy(p, destination)
                console.debug(`Copied ${fileName} to vault`);
            }
        } catch (err) {
            console.error(`Error moving ${fileName}: ${err}`);
        }
    });
}