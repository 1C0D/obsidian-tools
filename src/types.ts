export interface ToolsSettings {
    "move-out-from-vault": boolean;
    "move-to-vault": boolean;
    "search-from-directory":boolean
}

export const DEFAULT_SETTINGS: ToolsSettings = {
    "move-out-from-vault": true,
    "move-to-vault": true,
    "search-from-directory":true
};