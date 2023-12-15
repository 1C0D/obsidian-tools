import { App, PluginSettingTab, Setting } from "obsidian";
import type Tools from "./main";
import { settingsList } from "./variables";
import { ToggleElement, ToolsSettings, toToggle } from "./types/global";

export class ToolsSettingTab extends PluginSettingTab {
    plugin: Tools;

    constructor(app: App, plugin: Tools) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl: El } = this;
        El.empty();
        El.createEl("h2", { text: "Tools" });
        this.addToggleHandler(El, settingsList)
        const setting = new Setting(El)
        setting
            .addSlider((slider) => {
                slider
                    .setLimits(2, 12, 1)
                    .setValue(this.plugin.settings.maxLastCmds)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.maxLastCmds = value;
                        await this.plugin.saveSettings();
                    });
            })
    }

    addToggleHandler(El: HTMLElement, settingsList: ToggleElement[]) {
        for (const el of settingsList) {
            const setting = new Setting(El)
            setting
                .addToggle((toggle) => {
                    toggle
                        .setValue(this.plugin.settings[el.setting as keyof toToggle])
                        .onChange(async (value) => {
                            this.plugin.settings[el.setting as keyof toToggle] = value
                            await this.plugin.saveSettings()
                            await el.callback.bind(this)(value)
                        })
                }).setName(el.name)
        }
    }
}

