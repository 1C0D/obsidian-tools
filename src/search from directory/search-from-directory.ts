import { Editor, Menu, MenuItem, TFolder } from "obsidian";

export function registerSFD() {
  this.registerEvent(SfdToFileMenu());
  this.registerEvent(SfdToEditorMenu());
}

export function SfdToFileMenu() { return (this.app as any).workspace.on("file-menu", SfdToFileMenuCb()) }
export function SfdToEditorMenu() { return (this.app as any).workspace.on("editor-menu", SfdToEditorMenuCb()) }

export function SfdToFileMenuCb() {
  return (menu: Menu, folder: TFolder) => {
    if (!(folder instanceof TFolder)) return;
    menu.addItem((item: MenuItem) => {
      item
        .setTitle("Search in folder")
        .setIcon("search")
        .onClick(async () => {
          await searchDir(folder);
        });
    });
  }
}

export function SfdToEditorMenuCb() {
  return (menu: Menu, editor: Editor) => {
    menu.addItem((item) => {
      item
        .setTitle("search in parent directory")
        .setIcon("search")
        .onClick(async (evt) => {
          const selection = editor.getSelection();
          await searchDir(null, selection, true);
        });
    });
  }
}

async function searchDir(folder: TFolder | null, selection = "", select = false) {
  let prefix;
  const { workspace } = this.app

  if (folder) {
    const folderPath = folder.path;
    prefix = `path:"${folderPath}" `;
  } else {
    const filePath = workspace.getActiveFile()?.path;
    const folderPath = filePath?.split("/").slice(0, -1).join("/");
    if (folderPath !== filePath) {
      prefix = `path:"${folderPath}" `;
    } else {
      prefix = "";//root
    }
  }
  (this.app as any).internalPlugins
    .getPluginById("global-search")
    .instance.openGlobalSearch(prefix + selection);

  // ensure text has been entered into the search input
  const searchLeaf = workspace.getLeavesOfType('search')[0];
  const search = await searchLeaf.open(searchLeaf.view);

  const searchInput = document.querySelector(
    ".search-input-container input"
  ) as HTMLInputElement;
  if (select) {
    selectInput(
      searchInput,
      prefix.length,
      searchInput.value.length
    );

  } else {
    selectInput(
      searchInput,
      prefix.length,
      prefix.length
    );
  }
}

function selectInput(searchInput: HTMLInputElement, start: number, end: number) {
  searchInput.setSelectionRange(start, end);
}
