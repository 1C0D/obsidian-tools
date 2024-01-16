import * as path from "path";

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
    if(!dirPath) return
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
