import { around } from "monkey-around";
import Tools from "./main";
import { Command, PopoverSuggest, SuggestModal } from "obsidian";

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

export async function registerCommand(e: MouseEvent | KeyboardEvent, plugin: Tools) {
    const pluginCommand = (plugin.app as any).internalPlugins.getPluginById("command-palette")
    const instance = pluginCommand.instance
    const modal = instance.modal

    if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== "Tab") return
    const chooser = modal.chooser
    const selectedItem = chooser.selectedItem
    const selectedId = chooser.values[selectedItem]?.item.id

    if (e instanceof KeyboardEvent && e.key === "Tab") {
        if (!modal.win) return
        const pinned = instance.options.pinned
        if (pinned.includes(selectedId)) {
            pinned.remove(selectedId)
        } else {
            instance.options.pinned.push(selectedId)
        }
        instance.saveSettings(pluginCommand)
        modal.updateSuggestions()
    }

    if (selectedId === "obsidian-my-tools:repeat-command" ||
        selectedId === "obsidian-my-tools:get-last-command" ||
        selectedId === "obsidian-my-tools:get-last-commands"
    ) return

    // command
    plugin.lastCommand = selectedId

    // commands
    const maxEntries = plugin.settings.maxLastCmds;
    if (plugin.lastCommands.length > maxEntries) {
        plugin.lastCommands.shift();
    }
    plugin.lastCommands.push(selectedId)
    plugin.lastCommands = [...new Set(plugin.lastCommands)];
    plugin.saveSettings()
}

type LastCommand = [string, string][]

export class LastCommandsModal extends SuggestModal<LastCommand> {
    constructor(public plugin: Tools) {
        super(plugin.app);
        this.plugin = plugin;
    }

    getSuggestions(query: string): LastCommand[] {
        const lastCommandsArr = this.plugin.lastCommands.map(id => [id, getCommandName(id)]).reverse();
        return lastCommandsArr.filter(cmd =>
            cmd[1].toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(cmd: LastCommand, el: HTMLElement) {
        el.createEl("div", { text: `${cmd[1]}` });
    }

    onChooseSuggestion(cmd: LastCommand, evt: MouseEvent | KeyboardEvent) {
        this.plugin.app.commands.executeCommandById(`${cmd[0]}`)
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

// pas réussi à me servir de ça
// export class LastCommandsModal1 extends PopoverSuggest<LastCommand> {
//     constructor(public plugin: Tools) {
//         super(plugin.app);
//         this.plugin = plugin;
//         this.open()
//     }

//     selectSuggestion(cmd: string, evt: KeyboardEvent | MouseEvent): void {
//         this.app.commands.executeCommandById(cmd)
//     }

//     getSuggestions(): LastCommand[] {
//         const lastCommandsArr = this.plugin.lastCommands.reverse();
//         return lastCommandsArr
//     }

//     renderSuggestion(cmd: LastCommand, el: HTMLElement) {
//         el.createEl("div", { text: cmd });
//     }
// }


export function getElementFromMousePosition(
    evt: MouseEvent | KeyboardEvent,
    plugin: Tools
) {
    if (plugin.mousePosition) {
        const elementFromPoint = document.elementFromPoint(
            plugin.mousePosition.x,
            plugin.mousePosition.y
        );
        return elementFromPoint;
    }
    return null;
}