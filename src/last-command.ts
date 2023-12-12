import { around } from "monkey-around";
import Tools from "./main";
import { Command } from "obsidian";

export function onCommandTrigger(id: string, plugin: Tools, cb: (plugin: Tools) => void) {//notice we must pass plugin to use it in cb
    const uninstallCommand = around(this.app.commands, {
        executeCommand(originalMethod) {
            return function (...args: Command[]) {
                if (args[0].id === id) {
                    cb(plugin);
                }
                const result =
                    originalMethod && originalMethod.apply(this, args);
                return result;
            };
        },
    });
    return uninstallCommand;
}

export const cb = (e: MouseEvent, plugin: Tools) => {
    const clickedElement = e.target as HTMLElement;
    // console.log("clickedElement", clickedElement)
    const suggestionItem = clickedElement.closest('.suggestion-item.mod-complex.is-selected');
    let span = suggestionItem ?? clickedElement.closest('span');

    if (span) {
        // console.log("span", span)
        // const name = clickedElement.innerText; // it would have been to easy...
        const namePrefix = span.querySelector('.suggestion-prefix')?.textContent?.trim() ?? '';
        const nameSuffix = span.querySelector('.suggestion-title > span:last-child')?.textContent?.trim() ?? '';
        const name = namePrefix ? namePrefix + ': ' + nameSuffix : nameSuffix.trim(); // ok
        // console.log("name", name)
        const commandName = getCommandId(name)
        if (name !== "My tools: Repeat last command") plugin.lastCommand = commandName
        // console.log("plugin.lastCommand:", plugin.lastCommand)
        setTimeout(() => { document.removeEventListener("click", (e) => cb(e, plugin)); }, 2000)
    }
    setTimeout(() => { document.removeEventListener("click", (e) => cb(e, plugin)); }, 15000) // time for seeking, and if exit without selection remove listener anyway
}

function getCommandId(name: string) {
    for (const key in this.app.commands.commands) {
        const command = this.app.commands.commands[key];
        if (command.name === name) {
            return key;
        }
    }
    return null;
}