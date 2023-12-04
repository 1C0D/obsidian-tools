import { App, PluginSettingTab, Setting } from "obsidian";
import type Tools from "./main";
import { settingsList } from "./variables";
import { ToggleElement, ToolsSettings } from "./types/global";

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
        this.addToggleHandler(containerEl, settingsList)
    }


    addToggleHandler(containerEl: HTMLElement, settingsList: ToggleElement[]) {
        for (const el of settingsList) {
            const setting = new Setting(containerEl)
            setting
                .addToggle((toggle) => {
                    toggle
                        .setValue(this.plugin.settings[el.setting as keyof ToolsSettings])
                        .onChange(async (value) => {
                            this.plugin.settings[el.setting as keyof ToolsSettings] = value
                            await this.plugin.saveSettings()
                            await el.callback.bind(this)(value)
                        })
                }).setName(el.name)
        }
    }
}

