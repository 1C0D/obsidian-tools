import { TFile } from "obsidian";
import * as fs from "fs-extra";

export async function getFileStats(file:TFile){
    const filePath = this.app.vault.adapter.getFullPath(file.path)
    const stats = await fs.stat(filePath);
    return stats
}