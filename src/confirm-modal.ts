import { App, Modal, Setting } from "obsidian";

type ConfirmCallback = (confirmed: boolean) => void;

class ConfirmModal extends Modal {
    constructor(
        app: App,
        public message: string,
        public callback: ConfirmCallback,
        public width?: number,
        public height?: number
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        if (this.width) {
            this.modalEl.style.width = `${this.width}px`;
        }

        if (this.height) {
            this.modalEl.style.height = `${this.height}px`;
        }

        contentEl.createEl("p").setText(this.message);

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

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

async function openConfirmModal(
    app: App,
    message: string,
    width?: number,
    height?: number
): Promise<boolean> {
    return await new Promise((resolve) => {
        new ConfirmModal(
            app,
            message,
            (confirmed: boolean) => {
                resolve(confirmed);
            },
            width ?? undefined,
            height ?? undefined
        ).open();
    });
}

export async function Confirm(
    message: string,
    width?: number,
    height?: number
): Promise<boolean> {
    return await openConfirmModal(
        this.app,
        message,
        width ?? undefined,
        height ?? undefined
    );
}