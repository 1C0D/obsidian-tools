interface toToggle {
    "move-out-from-vault": boolean;
    "move-to-vault": boolean;
    "search-from-directory": boolean;
}

interface ToolsSettings extends toToggle {
    vaultDirs: Record<string, boolean>,
    vaultFiles: Record<string, boolean>
}

interface ToggleElement {
    setting: string;
    callback: (value: boolean) => Promise<void>;
    name: string
}

export type ConfirmCallback = (confirmed: boolean) => void;






// import 'obsidian'
// declare module "obsidian" {
//     interface App {
//         commands: {
//             executeCommandById(id: string, event?: Event): void,
//             executeCommand(): void
//             commands: Record<string, Command>
//         }
//     }
// }