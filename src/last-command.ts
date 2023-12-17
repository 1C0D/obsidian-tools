import { around } from "monkey-around";
import Tools from "./main";
import { Command, SuggestModal } from "obsidian";

function addCPListeners(plugin: Tools) {//command palette
    const modal = (plugin.app as any).internalPlugins.getPluginById("command-palette").instance.modal
    const resultContainerEl = modal.resultContainerEl

    resultContainerEl.addEventListener("click", (e: MouseEvent) => registerCPCmd(e, plugin));

    const keyupEventListener = (e: KeyboardEvent) => registerCPCmd(e, plugin);
    document.addEventListener("keyup", keyupEventListener)

    // to erase the document.listener
    const closeModal = (plugin.app as any).internalPlugins.getPluginById("command-palette").instance.modal.onClose;
    (plugin.app as any).internalPlugins.getPluginById("command-palette").instance.modal.onClose = () => {
        setTimeout(() => {
            document.removeEventListener("keyup", keyupEventListener)
        }, 400);// without timer enter is not working when selecting an item before
        closeModal.apply(modal);
    };
}

function onHKTrigger(plugin: Tools, id: string) {// after shortcut
    const { modal } = getModalCmdVars(plugin)
    if (!modal.win && !getRejectedCondition(id)) {
        applySelectedId(id!, plugin)
    }
}

export function onCommandTrigger(plugin: Tools) {//notice we must pass plugin to use it in cb
    const uninstallCommand = around(this.app.commands, {
        executeCommand(originalMethod) {
            return function (...args: Command[]) {
                console.log("args[0]", args[0].id)
                if (args[0].id === "command-palette:open") { addCPListeners(plugin) }
                else { onHKTrigger(plugin, args[0].id) }
                const result =
                    originalMethod && originalMethod.apply(this, args);
                return result;
            };
        },
    });
    return uninstallCommand;
}

function getRejectedCondition(id: string) {
    return (
        id === "obsidian-my-tools:repeat-command" ||
        id === "obsidian-my-tools:repeat-commands"
    )
}

function applySelectedId(id: string, plugin: Tools) {
    // command
    plugin.lastCommand = id
    // commands
    const maxEntries = plugin.settings.maxLastCmds;
    if (plugin.lastCommands.length > maxEntries) {
        plugin.lastCommands.shift();
    }
    plugin.lastCommands.push(id)
    plugin.lastCommands = [...new Set(plugin.lastCommands)];
    plugin.saveSettings()
}

function getModalCmdVars(plugin: Tools) {
    const pluginCommand = (plugin.app as any).internalPlugins.getPluginById("command-palette")
    const instance = pluginCommand.instance
    const modal = instance.modal
    return { modal, instance, pluginCommand }
}

export function registerCPCmd(e: MouseEvent | KeyboardEvent, plugin: Tools) {
    const { modal, instance, pluginCommand } = getModalCmdVars(plugin)

    if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== "Tab") return
    const chooser = modal.chooser
    const selectedItem = chooser.selectedItem
    const selectedId = chooser.values[selectedItem]?.item.id
    const rejectedIds = getRejectedCondition(selectedId)

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
        return
    }

    if (rejectedIds) return
    applySelectedId(selectedId, plugin)
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