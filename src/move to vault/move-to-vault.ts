import * as path from "path";
import * as fs from "fs-extra";
import { picker } from "src/utils";

export async function moveToVault(directory: boolean, move?: boolean) {
    const vaultPath = (this.app as any).vault.adapter.getFullPath("");
    const msg = "Choose file(s) to import";
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