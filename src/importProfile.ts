import * as path from "path";
import * as fs from "fs-extra";
import { picker } from "./utils";
import { existsSync } from "fs-extra";
import { Notice } from "obsidian";
import Tools from "./main";
import { setImportOptions } from "./importProfileModal";

export async function importProfile(plugin: Tools) {
    const thisVaultPath = await getThisVaultDir(".obsidian")
    if (!thisVaultPath) return
    const res = await setImportOptions(plugin, thisVaultPath, "Import vault options") // → importModal
    if (res) {
        await importDirs(plugin, thisVaultPath)
        await importJsons(plugin, thisVaultPath)
        new Notice("operations finished", 4000)
    }
}

async function getThisVaultDir(complement: string) {
    const dir = await picker("Source vault folder to import", ["openDirectory"])
    if (!dir) return
    const dirPath = path.join(dir as string, complement);
    if (!existsSync(dirPath)) {
        new Notice("Select a vault folder!", 2500);
        return;
    }
    return dirPath
}

async function importDirs(plugin: Tools, dirPath: string) {
    const obsidian = path.join(this.app.vault.adapter.getFullPath(""), ".obsidian");
    const vaultDirs = plugin.settings.vaultDirs;

    for (const key of Object.keys(vaultDirs)) {
        if (vaultDirs[key] === false) continue;
        const srcDir = path.join(dirPath, key);
        const destination = path.join(obsidian, key);

        if (key === 'plugins') {
            await copyPlugins(srcDir, destination);
        } else {
            try {
                await fs.copy(srcDir, destination);
                console.debug(`${key} imported`);
            } catch (err) {
                console.error(`Error copying ${key}: ${err}`);
            }
        }
    }
}

async function copyPlugins(src: string, dest: string) {
    await fs.ensureDir(dest);
    const files = await fs.readdir(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        const fileStats = await fs.stat(srcPath);
        if (fileStats.isDirectory() && file !== 'node_modules') {
            await copyPlugins(srcPath, destPath);
        } else if (fileStats.isFile()) {
            await fs.copy(srcPath, destPath);
            console.debug(`${file} imported`);
        }
    }
}

async function importJsons(plugin: Tools, dirPath: string) {
    const obsidian = path.join(this.app.vault.adapter.getFullPath(""), ".obsidian");
    const vaultFiles = plugin.settings.vaultFiles;

    for (const key of Object.keys(vaultFiles)) {
        if (vaultFiles[key] === false) continue
        const sourcePath = path.join(dirPath, `${key}.json`);
        const destinationPath = path.join(obsidian, `${key}.json`);

        const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
        let destinationContent = {};

        if (existsSync(destinationPath)) {
            destinationContent = JSON.parse(fs.readFileSync(destinationPath, 'utf8'));
        }

        const mergedContent = { ...destinationContent, ...sourceContent };

        fs.writeFileSync(destinationPath, JSON.stringify(mergedContent, null, 2));
        console.debug(`${key} imported`);

    }
}

