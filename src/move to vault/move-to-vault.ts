import * as path from "path";
import * as fs from "fs-extra";
import { picker } from "src/utils";
import { Menu, MenuItem, TFolder } from "obsidian";

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
            moveToVault(false, false)
        }
    })

    this.addCommand({
        id: 'copy-directory-to-vault',
        name: 'Copy directory to Vault',
        callback: () => {
            moveToVault(true, false)
        }
    })
}

export async function moveToVault(directory: boolean, move: boolean, postPath?: string) {
    let vaultPath = this.app.vault.adapter.getFullPath("");
    if (postPath) {
        vaultPath = path.join(vaultPath, postPath);
    }
    const msg = `Choose ${directory ? "dir(s)" : "file(s)"} to import`;
    const selectedPaths = directory ? await picker(msg, ['openDirectory', 'multiSelections']) as string[] : await picker(msg, ['openFile', 'multiSelections']) as string[];

    if (!selectedPaths) return;

    // move selected files to vault
    selectedPaths.forEach(async (p) => {
        const fileName = path.basename(p);
        const destination = path.join(vaultPath, fileName as string)
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

export function registerMTVmenus() {
    this.registerEvent(this.app.workspace.on("file-menu", MTVFolderMenu()));
}

export function MTVFolderMenu() {
    return (menu: Menu, folder: TFolder) => {
        if (!(folder instanceof TFolder)) return;
        menu.addSeparator();
        menu.addItem((item: MenuItem) => {
            item
            .setTitle("Copy file(s) in folder")
            .setIcon("copy")
            .onClick(async () => {
                moveToVault(false, false, folder.path);
            });
        });
        menu.addItem((item: MenuItem) => {
            item
            .setTitle("Move file(s) in folder")
            .setIcon("scissors")
            .onClick(async () => {
                moveToVault(false, true, folder.path);
            });
        });
        menu.addItem((item: MenuItem) => {
            item
            .setTitle("Copy dir(s) in folder")
            .setIcon("copy")
            .onClick(async () => {
                moveToVault(true, false, folder.path);
            });
        });
        menu.addItem((item: MenuItem) => {
            item
            .setTitle("Move dir(s) in folder")
            .setIcon("scissors")
            .onClick(async () => {
                moveToVault(true, true, folder.path);
            });
        });
        
    }
}