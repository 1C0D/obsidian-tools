export interface ToolsSettings {
    "move-out-from-vault": boolean;
    "move-to-vault": boolean;
    "search-from-directory": boolean
}

export interface ToggleElement {
    setting: string;
    callback: (value: boolean) => Promise<void>;
    name: string
}

