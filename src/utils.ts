import * as path from "path";
import * as os from "os";
import { Platform } from "obsidian";
import { readFileSync } from "fs"


declare global {
    interface Window {
        electron: any;
        require: NodeRequire;
    }
}

export async function picker(
    message: string,
    properties: string[]
) {
    let dirPath: string[]
    dirPath = window.electron.remote.dialog.showOpenDialogSync({
        title: message,
        properties
    });
    if (!dirPath) return
    if (properties.includes("multiSelections")) return dirPath
    else return dirPath[0];
}

// other way...
//     const result = await window.electron.remote.dialog.showOpenDialog(window.electron.remote.getCurrentWindow(), dialogOptions);
//     if (result.canceled) return '';
//     if (properties.includes('multiSelections')) return result.filePaths;
//     else return result.filePaths[0];

export async function openDirectoryInFileManager(dirPath: string) {
    let shell = window.electron.remote.shell;
    try {
        await shell.openPath(dirPath);
    } catch (err) {
        console.log(err);
    }
}


function getVaultsConfig(): string | null {
    const userDir: string = os.homedir();
    if (Platform.isWin) {
        return path.join(userDir, 'AppData', 'Roaming', 'obsidian', 'obsidian.json');
    } else if (Platform.isMacOS) {
        return path.join(userDir, 'Library', 'Application Support', 'obsidian', 'obsidian.json');
    } else if (Platform.isLinux) {
        return path.join(userDir, '.config', 'obsidian', 'obsidian.json');
    } else {
        console.log("should open explorer?")
        return null
    }
}


interface Vault {
    path: string;
    ts: number;
    open?: boolean;
}

interface ObsidianJsonConfig {
    vaults: Record<string, Vault>;
    insider?: boolean;
}

function readObsidianJson(): ObsidianJsonConfig | null {
    try {
        const vaultsConfigPath = getVaultsConfig();
        if (vaultsConfigPath) {
            const vaultsConfigContent = JSON.parse(readFileSync(vaultsConfigPath, "utf8"));
            return vaultsConfigContent as ObsidianJsonConfig;
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getAllVaultPaths(): string[] | null {
    const obsidianConfig = readObsidianJson();
    if (obsidianConfig) {
        const paths: string[] = [];
        for (const key in obsidianConfig.vaults) {
            if (Object.prototype.hasOwnProperty.call(obsidianConfig.vaults, key)) {
                paths.push(obsidianConfig.vaults[key].path);
            }
        }
        return paths;
    } else {
        return null;
    }
}

export const vaultPaths = getAllVaultPaths()??[]