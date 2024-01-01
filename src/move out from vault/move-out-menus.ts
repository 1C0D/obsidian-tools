import { Menu, MenuItem, TFile, TFolder } from "obsidian";
import { movOpenFileExplorer } from "./copy-move-out-of-vault";

export function registerOutOfVault() {
    this.registerEvent(
        this.app.workspace.on("file-menu", movFilesMenuCb())
    );
    // move out from vault 1 file selection multi selection
    this.registerEvent(
        this.app.workspace.on("files-menu", movFilesMenuCb())
    );
}

export function movFilesMenuCb() {
    return (menu: Menu, files: (TFile | TFolder)[] | TFile | TFolder) => {
        if (!Array.isArray(files)) files = [files]
        menu.addSeparator();
        menu.addItem((item: MenuItem) => {
            item.setTitle("Copy Out From Vault");
            item.setIcon("copy");
            item.onClick(async () => {
                await movOpenFileExplorer(files as (TFile | TFolder)[], "copy");
            });
        });
        menu.addItem((item: MenuItem) => {
            item.setTitle("Move Out From Vault");
            item.setIcon("scissors");
            item.onClick(async () => {
                await movOpenFileExplorer(files as TFile[] | TFolder[], "move", true);
            });
        });
    }
}