import { App, PluginSettingTab, Setting } from "obsidian";
import type Tools from "./main";
import { registerOutOfVault } from "./move out from vault/out-of-vault-confirm_modal";
import { FilesMenuCb } from "./move out from vault/move-out-menus";
import { addMovetoVault } from "./move to vault/move-to-vault";
import { SfdToEditorMenuCb, SfdToFileMenuCb, registerSFD } from "./search from directory/search-from-directory";

export class ToolsSettingTab extends PluginSettingTab {
    plugin: Tools;

    constructor(app: App, plugin: Tools) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Tools" });

        const setting = new Setting(containerEl)
        setting
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings["move-out-from-vault"]).onChange(async (value) => {
                    this.plugin.settings["move-out-from-vault"] = value
                    await this.plugin.saveSettings()
                    if (value) {
                        registerOutOfVault.bind(this.plugin)()
                    } else {
                        await (this.app as any).workspace.off("file-menu", FilesMenuCb.bind(this.plugin)())
                        await (this.app as any).workspace.off("files-menu", FilesMenuCb.bind(this.plugin)())
                        await (this.app as any).commands.executeCommandById('app:reload')
                    }
                })
            }).setName("move out from vault (when turned off a reload is done)")

        const setting1 = new Setting(containerEl)
        setting1
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings["move-to-vault"]).onChange(async (value) => {
                    this.plugin.settings["move-to-vault"] = value
                    await this.plugin.saveSettings()
                    if (value) {
                        addMovetoVault.bind(this.plugin)()
                    } else {
                        const list = [
                            'obsidian-my-tools:move-files-to-vault', 'obsidian-my-tools:move-directory-to-vault', 'obsidian-my-tools:copy-files-to-vault', 'obsidian-my-tools:copy-directory-to-vault'
                        ]

                        for (const command of list) await (this.app as any).commands.removeCommand(command)
                    }
                })
            }).setName("move/copy to vault")

        const setting2 = new Setting(containerEl)
        setting2
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings["search-from-directory"]).onChange(async (value) => {
                    this.plugin.settings["search-from-directory"] = value
                    await this.plugin.saveSettings()
                    if (value) {
                        registerSFD.bind(this.plugin)()
                    } else {
                        await (this.app as any).workspace.off("file-menu", SfdToFileMenuCb.bind(this.plugin)())
                        await (this.app as any).workspace.off("editor-menu", SfdToEditorMenuCb.bind(this.plugin)())
                    }
                })
            }).setName("search from directory")
    }
}

