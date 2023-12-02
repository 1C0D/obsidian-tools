import { App, PluginSettingTab } from "obsidian";
import type Tools from "./main";

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
    }
}