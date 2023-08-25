import { App, Modal, Setting } from "obsidian";
import Tools from "./main";

export class ConfirmModal extends Modal {
    constructor(app: App, public plugin: Tools, public onSubmit: (result: number) => void) {
        super(app);
        this.plugin = plugin;
        this.onSubmit = onSubmit
    }
    onOpen() {
        // modal size
        this.modalEl.style.width = `500px`;
        this.modalEl.style.height = `220px`;

        const { contentEl } = this;
        const eL = this.contentEl.createEl("p", {
            text: `File/folder already exists`
        });

        this.contentEl.createEl("p", {
            text: `replace: if folder, replace existing content and add new one (sync)`
        });
        this.contentEl.createEl("p", {
            text: `incremental: copy with incremental name`
        });
        // after newSetting checkbox applyAll
        const newSetting = new Setting(this.contentEl)
        const span = newSetting.settingEl.createEl("span", { text: "apply to all" })
        span.style.marginLeft = "3px";
        const checkbox = newSetting.settingEl.createEl("input", { type: "checkbox" })
        checkbox.checked = this.plugin.applyAll;
        checkbox.addEventListener("change", async() => {
            this.plugin.applyAll = checkbox.checked;
            await this.plugin.saveSettings()
            console.log("this.plugin.applyAll After", this.plugin.applyAll)
        });

        newSetting
            .addButton((b) => {
                b
                    .setButtonText("replace")
                    .setCta()
                    .onClick(async() => {
                        await this.plugin.saveSettings()
                        this.close();
                        this.onSubmit(2)
                    });
            })
            .addButton((b) => {
                b
                    .setIcon("copy-plus")
                    .setCta()
                    .setTooltip("incremental copy")
                    .onClick(async () => {
                        await this.plugin.saveSettings()
                        this.close();
                        this.onSubmit(2)
                    });
            })
    }
    onClose() {
        let { contentEl } = this;
        contentEl.empty();
        this.onSubmit(0)
    }
}