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


// exactement pareil mais plus long...
// export async function picker(
//     message: string,
//     properties: string[]
// ): Promise<string | string[]> {
//     const dialogOptions = {
//         title: message,
//         properties
//     };

//     const result = await window.electron.remote.dialog.showOpenDialog(window.electron.remote.getCurrentWindow(), dialogOptions);

//     if (result.canceled) {
//         return ''; // Ou gérer l'annulation comme nécessaire
//     }

//     if (properties.includes('multiSelections')) {
//         return result.filePaths; // Retourne un tableau de chemins de fichiers
//     } else {
//         return result.filePaths[0]; // Retourne le chemin du premier fichier sélectionné
//     }
// }


export async function openDirectoryInFileManager(dirPath: string) {
    let shell = window.electron.shell;
    try {
        await shell.openExternal(dirPath);
    } catch (err) {
        console.log(err);
    }
}