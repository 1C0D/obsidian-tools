import { App, Modal, Setting, TFile } from "obsidian";

export class OutFromVaultConfirmModal extends Modal {
	constructor(
		app: App,
		public runModal: boolean,
		public attached: TFile[],
		public onSubmit: (result: { pastOption: number, attached: TFile[] } | null) => void
	) {
		super(app);
		this.onSubmit = onSubmit;
	}
	onOpen() {
		// modal size
		this.modalEl.style.width = `500px`;
		this.modalEl.style.height = `350px`;

		const { contentEl } = this;
		this.contentEl.createEl("p", {
			text: `Some files already exist.`,
		});
		this.contentEl.createEl("p", {
			text: `choose your paste options:`,
		});
		let attachedAfterToggle: TFile[]

		if (this.attached.length) {
			const newSetting = new Setting(this.contentEl);
			newSetting
				.setName("Join attached resolved links")
				.addToggle((toggle) => {
					toggle.onChange(async (value) => {
						attachedAfterToggle = value ? this.attached: []
					})
				})
		}
		if (this.runModal) {
			const newSetting = new Setting(this.contentEl);
			newSetting
				.addButton((b) => {
					b.setButtonText("Paste")
						.setCta()
						.setTooltip("overwrite existing files")
						.onClick(async () => {
							this.close();
							this.onSubmit({ pastOption: 1, attached: attachedAfterToggle });
						});
				})
				.addButton((b) => {
					b.setButtonText("Incremental Paste")
						.setIcon("copy-plus")
						.setCta()
						.setTooltip("increment path if file exists")
						.onClick(async () => {
							this.close();
							this.onSubmit({ pastOption: 2, attached: attachedAfterToggle });
						});
				});

		} else {
			if (this.attached) {
				const newSetting = new Setting(this.contentEl);
				newSetting
					.addButton((b) => {
						b.setButtonText("Valid")
							.setCta()
							.setTooltip("valid toggle option")
							.onClick(async () => {
								this.close();
								this.onSubmit({ pastOption: 0, attached: attachedAfterToggle });
							});
					})
			}
		}
	}
	onClose() {
		let { contentEl } = this;
		contentEl.empty();
		this.onSubmit(null);
	}
}
