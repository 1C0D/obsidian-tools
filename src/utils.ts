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
    if (properties.includes("multiSelections")) return dirPath
    else return dirPath[0];
}

// other way...
// export async function picker(
//     message: string,
//     properties: string[]
// ) {
//     const result = await window.electron.remote.dialog.showOpenDialog(window.electron.remote.getCurrentWindow(), dialogOptions);
//     if (result.canceled) return '';
//     if (properties.includes('multiSelections')) return result.filePaths;
//     else return result.filePaths[0];
// }


export async function openDirectoryInFileManager(dirPath: string) {
    let shell = window.electron.remote.shell;
    // try {
        await shell.openExternal(dirPath);
    // } catch (err) {
    //     console.log("error there")
    //     console.log(err);
    // }
}