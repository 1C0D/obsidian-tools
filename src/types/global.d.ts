import 'obsidian'

interface ToolsSettings {
    "move-out-from-vault": boolean;
    "move-to-vault": boolean;
    "search-from-directory": boolean
}

interface ToggleElement {
    setting: string;
    callback: (value: boolean) => Promise<void>;
    name: string
}