import { Menu, MenuItem, TFile, TFolder } from "obsidian";
import { openFileExplorer } from "./copy-move-out-of-vault";

export function SingleFileMenus() {
    return (this.app as any).workspace.on("file-menu", FilesMenuCb())
}

export function MultiFilesMenus() {
    return (this.app as any).workspace.on("files-menu", FilesMenuCb())
}

function FilesMenuCb() {
    return (menu: Menu, files: (TFile | TFolder)[] | TFile | TFolder) => {
        if (!Array.isArray(files)) files = [files]
        menu.addItem((item: MenuItem) => {
            item.setTitle("Copy Out From Vault");
            item.setIcon("copy");
            item.onClick(async () => {
                await openFileExplorer(files as (TFile | TFolder)[], "copy");
            });
        });
        menu.addItem((item: MenuItem) => {
            item.setTitle("Move Out From Vault");
            item.setIcon("scissors");
            item.onClick(async () => {
                await openFileExplorer(files as TFile[] | TFolder[], "move", true);
            });
        });
    }
}