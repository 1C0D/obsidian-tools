import * as path from "path";
import * as fs from "fs-extra";
import { App, Modal, Setting } from "obsidian";
import Tools from "./main";
import { ConfirmCallback } from "./types/global";

export async function setImportOptions(
    plugin: Tools,
    dirPath: string,
    message: string,
    width?: number,
    height?: number
): Promise<boolean> {
    return await openImportModal(
        this.app,
        dirPath,
        plugin,
        message,
        width ?? undefined,
        height ?? undefined
    );
}

async function openImportModal(
    app: App,
    dirPath: string,
    plugin: Tools,
    message: string,
    width?: number,
    height?: number
): Promise<boolean> {
    return await new Promise((resolve) => {
        new ImportModal(
            app,
            dirPath,
            plugin,
            message,
            (confirmed: boolean) => {
                resolve(confirmed);
            },
            width ?? undefined,
            height ?? undefined
        ).open();
    });
}

class ImportModal extends Modal {
    constructor(
        app: App,
        public dirPath: string,
        public plugin: Tools,
        public message: string,
        public callback: ConfirmCallback,
        public width?: number,
        public height?: number
    ) {
        super(app);
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        if (this.width) {
            this.modalEl.style.width = `${this.width}px`;
        }

        if (this.height) {
            this.modalEl.style.height = `${this.height}px`;
        }

        contentEl.createEl("p").setText(this.message);
        contentEl.createEl("p").setText("❗existing are replaced. others are kept");

        this.getItems(true)
        this.getItems(false)

        this.createSettingsFromDirs();
        this.createSettingsFromFiles();
        await this.plugin.saveSettings()

        new Setting(this.contentEl)
            .addButton((b) => {
                b.setIcon("checkmark")
                    .setCta()
                    .onClick(() => {
                        this.callback(true);
                        this.close();
                    });
            })
            .addExtraButton((b) =>
                b.setIcon("cross").onClick(() => {
                    this.callback(false);
                    this.close();
                })
            );
    }

    createSettingsFromDirs() {
        const dirSettings = this.plugin.settings.vaultDirs;
        Object.keys(dirSettings).forEach(dirName => {
            const dirPath = path.join(this.dirPath, dirName)
            if (fs.existsSync(dirPath)) {
                new Setting(this.contentEl)
                    .setName(`import ${dirName} ?`)
                    .addToggle((toggle) => {
                        toggle.setValue(dirSettings[dirName])
                            .onChange(async (value) => {
                                dirSettings[dirName] = value;
                                await this.plugin.saveSettings();
                            });
                    });
            }
        });
        new Setting(this.contentEl).settingEl.createEl("p")
    }

    createSettingsFromFiles() {
        const fileSettings = this.plugin.settings.vaultFiles;
        Object.keys(fileSettings).forEach(fileName => {
            const filePath = path.join(this.dirPath, fileName) + ".json";;
            if (fs.existsSync(filePath)) {
                new Setting(this.contentEl)
                    .setName(`import ${fileName} ?`)
                    .addToggle((toggle) => {
                        toggle.setValue(fileSettings[fileName])
                            .onChange(async (value) => {
                                fileSettings[fileName] = value;
                                await this.plugin.saveSettings();
                            });
                    });
            }
        });
    }

    getItems(isDirectory: boolean) {
        const items = fs.readdirSync(this.dirPath)
            .filter(item => {
                const itemPath = path.join(this.dirPath, item);
                return isDirectory ? fs.statSync(itemPath).isDirectory() : (fs.statSync(itemPath).isFile() && path.extname(item) === ".json");
            });

        const vaultItems = isDirectory ? this.plugin.settings.vaultDirs : this.plugin.settings.vaultFiles;
        const itemNames = items.map(item => path.parse(item).name)

        for (const key of Object.keys(vaultItems)) {
            if (!itemNames.includes(key)) {
                delete vaultItems[key];
            }
        }

        for (const name of itemNames) {
            if (!(name in vaultItems)) {
                vaultItems[name] = isDirectory ? (name === "plugins" ? false : true) : true;
            }
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}