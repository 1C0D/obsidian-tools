import * as path from "path";
import * as fs from "fs-extra";
import { picker } from "./utils";
import { existsSync } from "fs-extra";
import { Notice } from "obsidian";
import Tools from "./main";
import { setMigrateOptions } from "./migrateProfileModal";

export async function migrateProfile(plugin: Tools, isImport = true) {
    const sourceOrDest = await getThisVaultDir(".obsidian", isImport)
    if (!sourceOrDest) return
    const msg = isImport ? "Import vault options" : "Export vault options"
    const res = await setMigrateOptions(plugin, sourceOrDest, msg, isImport) // → importModal
    if (res) {
        await importDirs(plugin, sourceOrDest, isImport)
        await importJsons(plugin, sourceOrDest, isImport)
        if(!isImport) {
            new Notice("operations finished with success")            
        }
        if(isImport) {
            // reload app
            new Notice("success!, app will reload...")  
            setTimeout(async () => {
                await (plugin.app as any).commands.executeCommandById("app:reload")
            }, 1500);
        }
    }
}

async function getThisVaultDir(complement: string, isImport = true) {
    const text = isImport ? "Select source vault folder" : "Select destination vault folder"
    const dir = await picker(text, ["openDirectory"])
    if (!dir) return
    const dirPath = path.join(dir as string, complement);
    if (!existsSync(dirPath)) {
        new Notice("Select a vault folder!", 2500);
        return;
    }
    return dirPath
}

async function importDirs(plugin: Tools, dirPath: string, isImport = true) {
    const obsidian = this.app.vault.adapter.getFullPath(".obsidian")
    const vaultDirs = plugin.settings.vaultDirs;

    for (const key of Object.keys(vaultDirs)) {
        if (vaultDirs[key] === false) continue;
        const srcDir = isImport ? path.join(dirPath, key) : path.join(obsidian, key);
        const destination = isImport ? path.join(obsidian, key) : path.join(dirPath, key);

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

async function importJsons(plugin: Tools, dirPath: string, isImport = true) {
    const obsidian = this.app.vault.adapter.getFullPath(".obsidian")
    const vaultFiles = plugin.settings.vaultFiles;

    for (const key of Object.keys(vaultFiles)) {
        if (vaultFiles[key] === false) continue
        const sourcePath = isImport ? path.join(dirPath, `${key}.json`) : path.join(obsidian, `${key}.json`);
        const destinationPath = isImport ? path.join(obsidian, `${key}.json`) : path.join(dirPath, `${key}.json`);

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

