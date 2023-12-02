import { Menu, MenuItem, TFile, TFolder } from "obsidian";
import { openFileExplorer } from "./copy-move-out-of-vault";

export function SingleFileMenus() {
    return (this.app as any).workspace.on(
        "file-menu",
        (menu: Menu, file: TFile | TFolder) => {
            menu.addItem((item: MenuItem) => {
                item.setTitle("Copy Out Of Vault");
                item.setIcon("copy");
                item.onClick(async () => {
                    await openFileExplorer(file, "copy");
                });
            });
            menu.addItem((item: MenuItem) => {
                item.setTitle("Move Out Of Vault");
                item.setIcon("scissors");
                item.onClick(async () => {
                    await openFileExplorer(file, "move", true);
                });
            });
        }
    )
}

export function MultiFilesMenus() {
    return (this.app as any).workspace.on(
        "files-menu",
        (menu: Menu, files: TFile[] | TFolder[]) => {
            menu.addItem((item: MenuItem) => {
                item.setTitle("Copy Out From Vault");
                item.setIcon("copy");
                item.onClick(async () => {
                    await openFileExplorer(files, "copy");
                });
            });
            menu.addItem((item: MenuItem) => {
                item.setTitle("Move Out From Vault");
                item.setIcon("scissors");
                item.onClick(async () => {
                    await openFileExplorer(files, "move", true);
                });
            });
        }
    )
}