import 'obsidian'


interface toToggle {
    "move-out-from-vault": boolean;
    "move-to-vault": boolean;
    "search-from-directory": boolean;
}

interface ToolsSettings extends toToggle {
    "maxLastCmds": number
}

interface ToggleElement {
    setting: string;
    callback: (value: boolean) => Promise<void>;
    name: string
}

declare module "obsidian" {
    interface App {
        commands: {
            executeCommandById(id: string, event?: Event): void,
            executeCommand(): void
            commands: Record<string, Command>
        }
    }
}