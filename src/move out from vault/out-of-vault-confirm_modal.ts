import { App, Modal, Setting } from "obsidian";
import type Tools from "../main";

export class OutFromVaultConfirmModal extends Modal {
	constructor(
		app: App,
		public plugin: Tools,
		public onSubmit: (result: number) => void
	) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}
	onOpen() {
		// modal size
		this.modalEl.style.width = `500px`;
		this.modalEl.style.height = `150px`;

		const { contentEl } = this;
		this.contentEl.createEl("p", {
			text: `Some files already exist.`,
		});
		this.contentEl.createEl("p", {
			text: `choose paste option:`,
		});

		const newSetting = new Setting(this.contentEl);

		newSetting
			.addButton((b) => {
				b.setButtonText("Paste")
					.setCta()
					.setTooltip("overwrite existing files")
					.onClick(async () => {
						// await this.plugin.saveSettings();
						this.close();
						this.onSubmit(1);
					});
			})
			.addButton((b) => {
				b.setButtonText("Incremental Paste")
					.setIcon("copy-plus")
					.setCta()
					.setTooltip("increment path if file exists")
					.onClick(async () => {
						// await this.plugin.saveSettings();
						this.close();
						this.onSubmit(2);
					});
			});
	}
	onClose() {
		let { contentEl } = this;
		contentEl.empty();
		this.onSubmit(0);
	}
}
