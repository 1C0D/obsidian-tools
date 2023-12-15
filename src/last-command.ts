import { around } from "monkey-around";
import Tools from "./main";
import { App, Command, SuggestModal } from "obsidian";

export function onCommandTrigger(id: string, cb: () => void) {//notice we must pass plugin to use it in cb
    const uninstallCommand = around(this.app.commands, {
        executeCommand(originalMethod) {
            return function (...args: Command[]) {
                if (args[0].id === id) {
                    cb();
                }
                const result =
                    originalMethod && originalMethod.apply(this, args);
                return result;
            };
        },
    });
    return uninstallCommand;
}

export function registerCommand(e: MouseEvent | KeyboardEvent, plugin: Tools) {
    if (e instanceof KeyboardEvent && e.key !== "Enter") return
    const chooser = (plugin.app as any).internalPlugins.getPluginById("command-palette").instance.modal.chooser
    const selectedItem = chooser.selectedItem
    const selectedId = chooser.values[selectedItem]?.item.id

    if (selectedId === "obsidian-my-tools:repeat-command" ||
        selectedId === "obsidian-my-tools:get-last-command" ||
        selectedId === "obsidian-my-tools:get-last-commands"
    ) return

    plugin.lastCommand = selectedId
    // commands
    const maxEntries = plugin.settings.maxLastCmds;
    if (plugin.lastCommands.length > maxEntries) {
        plugin.lastCommands.shift();
    }
    plugin.lastCommands.push(selectedId)
    plugin.lastCommands = [...new Set(plugin.lastCommands)];
    plugin.saveSettings()

    setTimeout((plugin: Tools) => {
        document.removeEventListener("keyup", (e: KeyboardEvent) => registerCommand
        )
    }, 4000);
}

type LastCommand = string

export class LastCommandsModal extends SuggestModal<LastCommand> {
    constructor(public plugin: Tools) {
        super(plugin.app);
        this.plugin = plugin;
    }

    getSuggestions(query: string): LastCommand[] {
        const lastCommandsArr = [...this.plugin.lastCommands].reverse()
        return lastCommandsArr.filter((cmd) =>
            cmd.toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(cmd: LastCommand, el: HTMLElement) {
        el.createEl("div", { text: cmd });
        el.setCssStyles({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            textAlign: 'center',
        });
    }

    onChooseSuggestion(cmd: LastCommand, evt: MouseEvent | KeyboardEvent) {
        this.app.commands.executeCommandById(cmd)
    }
}

function getCommandName(id: string) {
    for (const key in this.app.commands.commands) {
        const command = this.app.commands.commands[key];
        if (command.id === id) {
            return command.name;
        }
    }
    return null;
}