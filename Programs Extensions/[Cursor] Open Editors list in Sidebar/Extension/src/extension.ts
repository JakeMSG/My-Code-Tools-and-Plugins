import * as path from "path";
import * as vscode from "vscode";

const VIEW_ID = "openEditorsList.openedEditorsView";
const COMMAND_REFRESH = "openEditorsList.refresh";
const COMMAND_OPEN_EDITOR = "openEditorsList.openEditor";
const COMMAND_OPEN_EDITOR_TO_SIDE = "openEditorsList.openEditorToSide";
const COMMAND_REVEAL_IN_EXPLORER = "openEditorsList.revealInExplorer";
const COMMAND_COPY_PATH = "openEditorsList.copyPath";
const COMMAND_COPY_RELATIVE_PATH = "openEditorsList.copyRelativePath";
const COMMAND_COPY = "openEditorsList.copy";
const COMMAND_CUT = "openEditorsList.cut";
const COMMAND_PASTE = "openEditorsList.paste";
const COMMAND_RENAME = "openEditorsList.rename";
const COMMAND_CLOSE = "openEditorsList.close";
const COMMAND_DELETE = "openEditorsList.delete";
const COMMAND_COMPARE = "openEditorsList.compare";
const COMMAND_ADD_FILES_TO_CURSOR_CHAT = "openEditorsList.addFilesToCursorChat";
const COMMAND_ADD_FILES_TO_NEW_CURSOR_CHAT = "openEditorsList.addFilesToNewCursorChat";
const COMMAND_OPEN_TIMELINE = "openEditorsList.openTimeline";
const CONTEXT_HAS_CLIPBOARD = "openEditorsList.hasClipboard";
let activeDragAndDropController: OpenedEditorsDragAndDropController | undefined;

type OpenCommandTarget =
  | {
      kind: "open";
      uri: vscode.Uri;
      preview: boolean;
      viewColumn?: vscode.ViewColumn;
    }
  | {
      kind: "openWith";
      uri: vscode.Uri;
      viewType: string;
      preview: boolean;
      viewColumn?: vscode.ViewColumn;
    }
  | {
      kind: "diff";
      original: vscode.Uri;
      modified: vscode.Uri;
      title: string;
      preview: boolean;
      viewColumn?: vscode.ViewColumn;
    };

type ClipboardMode = "copy" | "cut";

interface ClipboardState {
  mode: ClipboardMode;
  uris: vscode.Uri[];
}

class OpenedEditorItem extends vscode.TreeItem {
  public readonly target: OpenCommandTarget;
  public readonly isFileResource: boolean;

  constructor(params: {
    id: string;
    label: string;
    target: OpenCommandTarget;
    resourceUri: vscode.Uri | undefined;
    description: string | undefined;
    tooltip: string;
  }) {
    super(params.label, vscode.TreeItemCollapsibleState.None);
    this.id = params.id;
    this.target = params.target;
    this.resourceUri = params.resourceUri;
    this.description = params.description;
    this.tooltip = params.tooltip;
    this.isFileResource = params.resourceUri?.scheme === "file";
    this.contextValue = this.isFileResource ? "openedEditorFile" : "openedEditor";
    this.command = {
      command: COMMAND_OPEN_EDITOR,
      title: "Open Editor",
      arguments: [this],
    };
  }
}

class OpenedEditorsDragAndDropController
  implements vscode.TreeDragAndDropController<OpenedEditorItem>
{
  public readonly dragMimeTypes = [
    "text/uri-list",
    "text/plain",
    `application/vnd.code.tree.${VIEW_ID}`,
  ];

  public readonly dropMimeTypes: readonly string[] = [
    "files",
    "Files",
    "resourceurls",
    "text/uri-list",
    "text/x-uri",
    "text/x-moz-url",
    "text/plain",
    "application/octet-stream",
    "application/x-moz-file",
    "application/vnd.code.editor",
    "application/vnd.code.editors",
    "application/vnd.code.tab",
    "application/vnd.code.tabs",
    "application/vnd.code.resource",
    "application/vnd.code.tree.explorer",
    "application/vnd.code.tree.openEditors",
    "application/vnd.code.tree.openeditors",
    "application/vnd.code.tree.editors",
    `application/vnd.code.tree.${VIEW_ID}`,
  ];

  public async handleDrag(
    source: readonly OpenedEditorItem[],
    dataTransfer: vscode.DataTransfer
  ): Promise<void> {
    const dragUris = uniqueUris(
      source
        .map((item) => item.resourceUri)
        .filter((uri): uri is vscode.Uri => uri !== undefined)
    );

    if (dragUris.length === 0) {
      return;
    }

    dataTransfer.set(
      "text/uri-list",
      new vscode.DataTransferItem(dragUris.map((uri) => uri.toString()).join("\r\n"))
    );

    dataTransfer.set(
      "text/plain",
      new vscode.DataTransferItem(
        dragUris
          .map((uri) => (uri.scheme === "file" ? uri.fsPath : uri.toString(true)))
          .join("\n")
      )
    );

    dataTransfer.set(
      `application/vnd.code.tree.${VIEW_ID}`,
      new vscode.DataTransferItem(JSON.stringify(dragUris.map((uri) => uri.toString())))
    );
  }

  public async handleDrop(
    target: OpenedEditorItem | undefined,
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const droppedUris = await extractDroppedUris(dataTransfer);
    if (droppedUris.length === 0) {
      const mimeTypes = [...dataTransfer].map(([mime]) => mime).join(", ");
      if (mimeTypes) {
        void vscode.window.showInformationMessage(
          `Drop data received but no file URI parsed. Mime types: ${mimeTypes}`
        );
      }
      return;
    }

    const openableUris = await filterOpenableUris(droppedUris);
    if (openableUris.length === 0) {
      void vscode.window.showInformationMessage(
        "Dropped entries are not openable files."
      );
      return;
    }

    const openOptions: vscode.TextDocumentShowOptions = {
      preview: false,
      preserveFocus: true,
    };

    if (target?.target.viewColumn !== undefined) {
      openOptions.viewColumn = target.target.viewColumn;
    }

    let openedCount = 0;
    const errors: string[] = [];

    for (const uri of openableUris) {
      try {
        await vscode.commands.executeCommand("vscode.open", uri, openOptions);
        openedCount += 1;
      } catch (error) {
        errors.push(`${uri.toString(true)}: ${toErrorMessage(error)}`);
      }
    }

    if (openedCount > 0) {
      vscode.window.setStatusBarMessage(
        `Opened Editors: added ${openedCount} dropped file(s).`,
        2000
      );
    }

    if (errors.length > 0) {
      void vscode.window.showWarningMessage(
        `Drop done with ${errors.length} issue(s): ${errors[0]}`
      );
    }
  }
}

class OpenedEditorsProvider
  implements vscode.TreeDataProvider<OpenedEditorItem>, vscode.Disposable
{
  private readonly changeEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChangeTreeData = this.changeEmitter.event;
  private readonly disposables: vscode.Disposable[] = [];

  constructor() {
    this.disposables.push(
      vscode.window.tabGroups.onDidChangeTabs(() => this.refresh()),
      vscode.window.tabGroups.onDidChangeTabGroups(() => this.refresh()),
      vscode.window.onDidChangeActiveTextEditor(() => this.refresh()),
      vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh())
    );
  }

  public dispose(): void {
    this.changeEmitter.dispose();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  public refresh(): void {
    this.changeEmitter.fire();
  }

  public getTreeItem(element: OpenedEditorItem): OpenedEditorItem {
    return element;
  }

  public getChildren(
    element?: OpenedEditorItem
  ): vscode.ProviderResult<OpenedEditorItem[]> {
    if (element) {
      return [];
    }
    return this.collectItems();
  }

  public getItemCount(): number {
    return this.collectItems().length;
  }

  private collectItems(): OpenedEditorItem[] {
    const groups = vscode.window.tabGroups.all;
    const hasMultipleGroups = groups.length > 1;
    const items: OpenedEditorItem[] = [];

    groups.forEach((group, groupIndex) => {
      group.tabs.forEach((tab, tabIndex) => {
        const target = this.buildOpenTarget(tab, group.viewColumn);
        if (!target) {
          return;
        }

        const resourceUri = this.extractResourceUri(tab);
        const label = tab.isDirty ? `${tab.label} ●` : tab.label;
        const treeItem = new OpenedEditorItem({
          id: this.buildStableId(groupIndex, tabIndex, resourceUri, tab),
          label,
          target,
          resourceUri,
          description: this.buildDescription(resourceUri, groupIndex, hasMultipleGroups),
          tooltip: this.buildTooltip(tab, resourceUri, groupIndex, hasMultipleGroups),
        });

        items.push(treeItem);
      });
    });

    return items;
  }

  private buildOpenTarget(
    tab: vscode.Tab,
    viewColumn: vscode.ViewColumn | undefined
  ): OpenCommandTarget | undefined {
    const preview = tab.isPreview;
    const input = tab.input;

    if (input instanceof vscode.TabInputText) {
      return { kind: "open", uri: input.uri, preview, viewColumn };
    }

    if (input instanceof vscode.TabInputCustom) {
      return {
        kind: "openWith",
        uri: input.uri,
        viewType: input.viewType,
        preview,
        viewColumn,
      };
    }

    if (input instanceof vscode.TabInputNotebook) {
      return {
        kind: "openWith",
        uri: input.uri,
        viewType: input.notebookType,
        preview,
        viewColumn,
      };
    }

    if (input instanceof vscode.TabInputTextDiff) {
      return {
        kind: "diff",
        original: input.original,
        modified: input.modified,
        title: tab.label,
        preview,
        viewColumn,
      };
    }

    if (input instanceof vscode.TabInputNotebookDiff) {
      return {
        kind: "diff",
        original: input.original,
        modified: input.modified,
        title: tab.label,
        preview,
        viewColumn,
      };
    }

    return undefined;
  }

  private extractResourceUri(tab: vscode.Tab): vscode.Uri | undefined {
    const input = tab.input;

    if (input instanceof vscode.TabInputText) {
      return input.uri;
    }
    if (input instanceof vscode.TabInputCustom) {
      return input.uri;
    }
    if (input instanceof vscode.TabInputNotebook) {
      return input.uri;
    }
    if (input instanceof vscode.TabInputTextDiff) {
      return input.modified;
    }
    if (input instanceof vscode.TabInputNotebookDiff) {
      return input.modified;
    }

    return undefined;
  }

  private buildStableId(
    groupIndex: number,
    tabIndex: number,
    resourceUri: vscode.Uri | undefined,
    tab: vscode.Tab
  ): string {
    const resourcePart = resourceUri ? resourceUri.toString() : tab.label;
    return `${groupIndex}:${tabIndex}:${resourcePart}`;
  }

  private buildDescription(
    resourceUri: vscode.Uri | undefined,
    groupIndex: number,
    hasMultipleGroups: boolean
  ): string | undefined {
    const parts: string[] = [];

    if (resourceUri) {
      const parentPath = this.getParentPathForDisplay(resourceUri);
      if (parentPath) {
        parts.push(parentPath);
      }
    }

    if (hasMultipleGroups) {
      parts.push(`G${groupIndex + 1}`);
    }

    return parts.length > 0 ? parts.join(" | ") : undefined;
  }

  private buildTooltip(
    tab: vscode.Tab,
    resourceUri: vscode.Uri | undefined,
    groupIndex: number,
    hasMultipleGroups: boolean
  ): string {
    const lines: string[] = [tab.label];

    if (resourceUri) {
      lines.push(
        resourceUri.scheme === "file" ? resourceUri.fsPath : resourceUri.toString(true)
      );
    }

    if (hasMultipleGroups) {
      lines.push(`Group ${groupIndex + 1}`);
    }

    if (tab.isDirty) {
      lines.push("Unsaved changes");
    }

    return lines.join("\n");
  }

  private getParentPathForDisplay(resourceUri: vscode.Uri): string | undefined {
    if (resourceUri.scheme !== "file") {
      return resourceUri.scheme;
    }

    const relativePath = vscode.workspace.asRelativePath(resourceUri, false);
    const parent = path.dirname(relativePath);
    if (parent === "." || parent === "") {
      return undefined;
    }

    return parent;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new OpenedEditorsProvider();
  const dragAndDropController = new OpenedEditorsDragAndDropController();
  activeDragAndDropController = dragAndDropController;
  const treeView = vscode.window.createTreeView(VIEW_ID, {
    treeDataProvider: provider,
    showCollapseAll: false,
    canSelectMany: true,
    dragAndDropController,
  });
  let lastSelection: readonly OpenedEditorItem[] = [];
  let clipboardState: ClipboardState | undefined;

  const setClipboardState = (nextState: ClipboardState | undefined): void => {
    clipboardState = nextState;
    void vscode.commands.executeCommand(
      "setContext",
      CONTEXT_HAS_CLIPBOARD,
      Boolean(nextState && nextState.uris.length > 0)
    );
  };

  const updateViewMessage = (): void => {
    treeView.message =
      provider.getItemCount() === 0 ? "No opened file editors right now." : undefined;
  };

  const resolveSelection = (
    item?: OpenedEditorItem,
    selectedItems?: readonly OpenedEditorItem[]
  ): OpenedEditorItem[] => {
    const fromArgs = selectedItems && selectedItems.length > 0 ? [...selectedItems] : [];
    const fromView = treeView.selection.length > 0 ? [...treeView.selection] : [];
    const fallback = lastSelection.length > 0 ? [...lastSelection] : [];
    const resolved = fromArgs.length > 0 ? fromArgs : fromView.length > 0 ? fromView : fallback;

    if (item) {
      const itemInResolved = resolved.some((entry) => entry.id === item.id);
      return itemInResolved ? resolved : [item];
    }

    return resolved;
  };

  const resolveFileUris = (
    item?: OpenedEditorItem,
    selectedItems?: readonly OpenedEditorItem[]
  ): vscode.Uri[] => {
    const entries = resolveSelection(item, selectedItems);
    return uniqueUris(
      entries
        .map((entry) => entry.resourceUri)
        .filter((uri): uri is vscode.Uri => uri !== undefined && uri.scheme === "file")
    );
  };

  const resolveTabs = (
    item?: OpenedEditorItem,
    selectedItems?: readonly OpenedEditorItem[]
  ): vscode.Tab[] => {
    const entries = resolveSelection(item, selectedItems);
    return resolveLiveTabsFromEntries(entries);
  };

  const resolvePasteTargetDirectory = (
    item?: OpenedEditorItem,
    selectedItems?: readonly OpenedEditorItem[]
  ): vscode.Uri | undefined => {
    const entries = resolveSelection(item, selectedItems);

    for (const entry of entries) {
      if (entry.resourceUri?.scheme === "file") {
        return vscode.Uri.file(path.dirname(entry.resourceUri.fsPath));
      }
    }

    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (activeUri?.scheme === "file") {
      return vscode.Uri.file(path.dirname(activeUri.fsPath));
    }

    return vscode.workspace.workspaceFolders?.[0]?.uri;
  };

  setClipboardState(undefined);

  context.subscriptions.push(
    provider,
    treeView,
    treeView.onDidChangeSelection((event) => {
      lastSelection = event.selection;
    }),
    provider.onDidChangeTreeData(() => updateViewMessage()),
    vscode.commands.registerCommand(COMMAND_REFRESH, () => {
      provider.refresh();
      updateViewMessage();
    }),
    vscode.commands.registerCommand(
      COMMAND_OPEN_EDITOR,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const entries = resolveSelection(item, selectedItems);
        if (entries.length === 0) {
          return;
        }
        await openEditorFromTarget(entries[0].target);
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_OPEN_EDITOR_TO_SIDE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const entries = resolveSelection(item, selectedItems);
        if (entries.length === 0) {
          return;
        }
        await openEditorFromTarget(entries[0].target, {
          preview: false,
          viewColumn: vscode.ViewColumn.Beside,
        });
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_REVEAL_IN_EXPLORER,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          return;
        }
        await vscode.commands.executeCommand("revealInExplorer", uris[0]);
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_COPY_PATH,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file path selected.");
          return;
        }

        await vscode.env.clipboard.writeText(uris.map((uri) => uri.fsPath).join("\n"));
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_COPY_RELATIVE_PATH,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file path selected.");
          return;
        }

        await vscode.env.clipboard.writeText(
          uris.map((uri) => vscode.workspace.asRelativePath(uri, false)).join("\n")
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_COPY,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected to copy.");
          return;
        }

        setClipboardState({ mode: "copy", uris });
        vscode.window.setStatusBarMessage(
          `Opened Editors: copied ${uris.length} item(s).`,
          2000
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_CUT,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected to cut.");
          return;
        }

        setClipboardState({ mode: "cut", uris });
        vscode.window.setStatusBarMessage(
          `Opened Editors: cut ${uris.length} item(s).`,
          2000
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_PASTE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        if (!clipboardState || clipboardState.uris.length === 0) {
          void vscode.window.showInformationMessage("Clipboard is empty.");
          return;
        }

        const targetDirectory = resolvePasteTargetDirectory(item, selectedItems);
        if (!targetDirectory) {
          void vscode.window.showErrorMessage(
            "No target folder found. Open workspace folder first."
          );
          return;
        }

        const result = await pasteClipboardEntries(clipboardState, targetDirectory);
        if (clipboardState.mode === "cut" && result.completed > 0) {
          setClipboardState(undefined);
        }

        provider.refresh();
        updateViewMessage();

        if (result.errors.length > 0) {
          void vscode.window.showWarningMessage(
            `Paste done with ${result.errors.length} issue(s): ${result.errors[0]}`
          );
          return;
        }

        if (result.completed > 0) {
          vscode.window.setStatusBarMessage(
            `Opened Editors: pasted ${result.completed} item(s).`,
            2000
          );
        }
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_RENAME,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected to rename.");
          return;
        }

        const sourceUri = uris[0];
        const currentName = path.basename(sourceUri.fsPath);
        const newName = await vscode.window.showInputBox({
          title: "Rename",
          value: currentName,
          prompt: "Enter new file name",
          validateInput: (value) => {
            if (!value.trim()) {
              return "Name cannot be empty.";
            }
            if (value.includes("/") || value.includes("\\")) {
              return "Use file name only.";
            }
            return undefined;
          },
        });

        if (!newName || newName === currentName) {
          return;
        }

        const parentDirectory = vscode.Uri.file(path.dirname(sourceUri.fsPath));
        const destinationUri = vscode.Uri.joinPath(parentDirectory, newName);

        if (await uriExists(destinationUri)) {
          void vscode.window.showErrorMessage("Target name already exists.");
          return;
        }

        await vscode.workspace.fs.rename(sourceUri, destinationUri, {
          overwrite: false,
        });
        provider.refresh();
        updateViewMessage();
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_CLOSE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const tabs = resolveTabs(item, selectedItems);
        if (tabs.length === 0) {
          void vscode.window.showInformationMessage("No opened editor selected to close.");
          return;
        }

        try {
          await vscode.window.tabGroups.close(tabs, true);
          provider.refresh();
          updateViewMessage();
        } catch (error) {
          void vscode.window.showErrorMessage(`Could not close editor: ${toErrorMessage(error)}`);
        }
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_DELETE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected to delete.");
          return;
        }

        const confirmLabel =
          uris.length === 1
            ? `Delete '${path.basename(uris[0].fsPath)}'?`
            : `Delete ${uris.length} selected files?`;
        const confirm = await vscode.window.showWarningMessage(
          confirmLabel,
          { modal: true },
          "Delete"
        );
        if (confirm !== "Delete") {
          return;
        }

        let deletedCount = 0;
        const errors: string[] = [];

        for (const uri of uris) {
          try {
            await vscode.workspace.fs.delete(uri, {
              recursive: false,
              useTrash: true,
            });
            deletedCount += 1;
          } catch (error) {
            errors.push(`${path.basename(uri.fsPath)}: ${toErrorMessage(error)}`);
          }
        }

        provider.refresh();
        updateViewMessage();

        if (errors.length > 0) {
          void vscode.window.showWarningMessage(
            `Delete done with ${errors.length} issue(s): ${errors[0]}`
          );
          return;
        }

        vscode.window.setStatusBarMessage(
          `Opened Editors: deleted ${deletedCount} item(s).`,
          2000
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_COMPARE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        const activeUri = vscode.window.activeTextEditor?.document.uri;
        const compareUris = [...uris];

        if (
          compareUris.length < 2 &&
          activeUri?.scheme === "file" &&
          !compareUris.some((entry) => entry.toString() === activeUri.toString())
        ) {
          compareUris.push(activeUri);
        }

        if (compareUris.length < 2) {
          void vscode.window.showInformationMessage(
            "Select at least 2 files to compare."
          );
          return;
        }

        const left = compareUris[0];
        const right = compareUris[1];
        const compareTitle = `${path.basename(left.fsPath)} <-> ${path.basename(
          right.fsPath
        )}`;
        await vscode.commands.executeCommand(
          "vscode.diff",
          left,
          right,
          compareTitle,
          { preview: false }
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_ADD_FILES_TO_CURSOR_CHAT,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected for Cursor Chat.");
          return;
        }

        const added = await addFilesToCursorChat(uris, false);
        if (!added) {
          void vscode.window.showWarningMessage(
            "Could not find Cursor Chat command for adding files."
          );
          return;
        }

        vscode.window.setStatusBarMessage(
          `Opened Editors: sent ${uris.length} file(s) to Cursor Chat.`,
          2000
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_ADD_FILES_TO_NEW_CURSOR_CHAT,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected for Cursor Chat.");
          return;
        }

        const added = await addFilesToCursorChat(uris, true);
        if (!added) {
          void vscode.window.showWarningMessage(
            "Could not find Cursor command for creating new chat with files."
          );
          return;
        }

        vscode.window.setStatusBarMessage(
          `Opened Editors: sent ${uris.length} file(s) to new Cursor Chat.`,
          2000
        );
      }
    ),
    vscode.commands.registerCommand(
      COMMAND_OPEN_TIMELINE,
      async (item?: OpenedEditorItem, selectedItems?: readonly OpenedEditorItem[]) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
          void vscode.window.showInformationMessage("No file selected for timeline.");
          return;
        }

        const opened = await openTimelineForUri(uris[0]);
        if (!opened) {
          void vscode.window.showWarningMessage(
            "Could not find a timeline command in this build."
          );
        }
      }
    )
  );

  updateViewMessage();
}

export function deactivate(): void {
  activeDragAndDropController = undefined;
  // No-op
}

async function openEditorFromTarget(
  target: OpenCommandTarget,
  overrides?: Partial<vscode.TextDocumentShowOptions>
): Promise<void> {
  const openOptions: vscode.TextDocumentShowOptions = {
    preview: target.preview,
    preserveFocus: false,
    ...overrides,
  };

  if (openOptions.viewColumn === undefined && target.viewColumn !== undefined) {
    openOptions.viewColumn = target.viewColumn;
  }

  try {
    if (target.kind === "open") {
      await vscode.commands.executeCommand("vscode.open", target.uri, openOptions);
      return;
    }

    if (target.kind === "openWith") {
      await vscode.commands.executeCommand(
        "vscode.openWith",
        target.uri,
        target.viewType,
        openOptions
      );
      return;
    }

    await vscode.commands.executeCommand(
      "vscode.diff",
      target.original,
      target.modified,
      target.title,
      openOptions
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(`Could not open editor: ${reason}`);
  }
}

const CURSOR_CHAT_ADD_FILE_COMMANDS = [
  "cursor.chat.addFiles",
  "cursor.chat.addFile",
  "cursor.addFilesToChat",
  "cursor.addFileToChat",
  "cursor.composer.addFilesToChat",
  "cursor.composer.addFileToChat",
  "composer.addFilesToChat",
  "composer.addFileToChat",
];

const CURSOR_CHAT_NEW_WITH_FILES_COMMANDS = [
  "cursor.chat.newWithFiles",
  "cursor.chat.createWithFiles",
  "cursor.chat.addFilesToNewChat",
  "cursor.composer.newWithFiles",
  "composer.newWithFiles",
];

const CURSOR_CHAT_NEW_COMMANDS = [
  "cursor.chat.new",
  "cursor.chat.newChat",
  "cursor.chat.startNewChat",
  "cursor.composer.new",
  "cursor.composer.newChat",
  "composer.new",
  "composer.newChat",
];

const TIMELINE_COMMANDS = [
  "workbench.action.openTimeline",
  "timeline.focus",
  "files.openTimeline",
  "timeline.open",
  "workbench.view.timeline",
];

async function addFilesToCursorChat(
  uris: readonly vscode.Uri[],
  useNewChat: boolean
): Promise<boolean> {
  const argumentSets = buildFileArgumentSets(uris, useNewChat);

  if (useNewChat) {
    const directNewChatAdd = await executeFirstAvailableCommand(
      CURSOR_CHAT_NEW_WITH_FILES_COMMANDS,
      argumentSets
    );
    if (directNewChatAdd) {
      return true;
    }

    const newChatOpened = await executeFirstAvailableCommand(CURSOR_CHAT_NEW_COMMANDS, [
      [],
    ]);
    if (!newChatOpened) {
      return false;
    }
  }

  return executeFirstAvailableCommand(CURSOR_CHAT_ADD_FILE_COMMANDS, argumentSets);
}

async function openTimelineForUri(uri: vscode.Uri): Promise<boolean> {
  await vscode.commands.executeCommand("vscode.open", uri, {
    preview: true,
    preserveFocus: true,
  });

  return executeFirstAvailableCommand(TIMELINE_COMMANDS, [
    [uri],
    [{ uri }],
    [{ resource: uri }],
    [],
  ]);
}

function buildFileArgumentSets(
  uris: readonly vscode.Uri[],
  useNewChat: boolean
): unknown[][] {
  const uriArray = [...uris];
  const uriStrings = uriArray.map((uri) => uri.toString());
  const fsPaths = uriArray
    .filter((uri) => uri.scheme === "file")
    .map((uri) => uri.fsPath);

  return [
    [uriArray],
    [{ uris: uriArray }],
    [{ files: uriArray }],
    [{ resources: uriArray }],
    [{ uri: uriArray[0], uris: uriArray, newChat: useNewChat }],
    [uriStrings],
    [{ uriStrings, newChat: useNewChat }],
    [fsPaths],
    [{ paths: fsPaths, newChat: useNewChat }],
    [],
  ];
}

async function executeFirstAvailableCommand(
  candidateCommandIds: readonly string[],
  argumentSets: readonly unknown[][]
): Promise<boolean> {
  const availableCommands = new Set(await vscode.commands.getCommands(true));

  for (const commandId of candidateCommandIds) {
    if (!availableCommands.has(commandId)) {
      continue;
    }

    for (const args of argumentSets) {
      try {
        await vscode.commands.executeCommand(commandId, ...args);
        return true;
      } catch {
        // Try next argument signature for this command.
      }
    }
  }

  return false;
}

async function extractDroppedUris(
  dataTransfer: vscode.DataTransfer
): Promise<vscode.Uri[]> {
  const uriCandidates: vscode.Uri[] = [];
  const processedItems = new WeakSet<object>();

  const processItem = async (
    mimeType: string,
    item: vscode.DataTransferItem
  ): Promise<void> => {
    const asObject = item as unknown as object;
    if (processedItems.has(asObject)) {
      return;
    }
    processedItems.add(asObject);

    const asFile = item.asFile();
    if (asFile?.uri) {
      uriCandidates.push(asFile.uri);
    }

    uriCandidates.push(...collectFileLikeValueUris(item.value));

    if (item.value !== undefined) {
      uriCandidates.push(...parseStructuredUnknownPayload(item.value));
    }

    try {
      const raw = await item.asString();
      if (mimeType === "text/uri-list") {
        uriCandidates.push(...parseUriList(raw));
      } else if (mimeType === "text/plain") {
        uriCandidates.push(...parsePlainTextUris(raw));
      } else if (
        mimeType === "files" ||
        mimeType.startsWith("application/vnd.code.tree.") ||
        mimeType.startsWith("application/vnd.code.") ||
        mimeType.includes("uri")
      ) {
        uriCandidates.push(...parseStructuredUriPayload(raw));
      }
    } catch {
      // Ignore payload parse failures for non-string drag payloads.
    }
  };

  const explicitMimeCandidates = [
    "files",
    "Files",
    "resourceurls",
    "text/uri-list",
    "text/x-uri",
    "text/x-moz-url",
    "text/plain",
    "application/octet-stream",
    "application/x-moz-file",
    "application/vnd.code.editor",
    "application/vnd.code.editors",
    "application/vnd.code.tab",
    "application/vnd.code.tabs",
    "application/vnd.code.resource",
    "application/vnd.code.tree.explorer",
    "application/vnd.code.tree.openEditors",
    "application/vnd.code.tree.openeditors",
    "application/vnd.code.tree.editors",
    `application/vnd.code.tree.${VIEW_ID}`,
  ];

  for (const mimeType of explicitMimeCandidates) {
    const item = dataTransfer.get(mimeType);
    if (item) {
      await processItem(mimeType.toLowerCase(), item);
    }
  }

  for (const [mimeType, item] of dataTransfer) {
    await processItem(mimeType.toLowerCase(), item);
  }

  return uniqueUris(uriCandidates);
}

async function filterOpenableUris(uris: readonly vscode.Uri[]): Promise<vscode.Uri[]> {
  const openable: vscode.Uri[] = [];

  for (const uri of uris) {
    if (uri.scheme !== "file") {
      openable.push(uri);
      continue;
    }

    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const isDirectory = (stat.type & vscode.FileType.Directory) !== 0;
      if (!isDirectory) {
        openable.push(uri);
      }
    } catch {
      // Skip entries that cannot be resolved as files.
    }
  }

  return openable;
}

function parseUriList(rawUriList: string): vscode.Uri[] {
  const uris: vscode.Uri[] = [];

  for (const line of rawUriList.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const uri = parseUriLikeText(trimmed);
    if (uri) {
      uris.push(uri);
    }
  }

  return uris;
}

function parsePlainTextUris(rawText: string): vscode.Uri[] {
  const uris: vscode.Uri[] = [];

  for (const token of rawText.split(/\r?\n/)) {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      continue;
    }
    const firstColumn = trimmedToken.split("\t")[0].trim();

    const candidates = [firstColumn];
    const spaceSeparated = firstColumn.split(" ");
    if (spaceSeparated.length > 1) {
      candidates.push(spaceSeparated[spaceSeparated.length - 1]);
    }

    for (const candidate of candidates) {
      const uri = parseUriLikeText(candidate);
      if (uri) {
        uris.push(uri);
      }
    }
  }

  return uris;
}

function parseStructuredUriPayload(rawPayload: string): vscode.Uri[] {
  const uriStrings = new Set<string>();

  const addCandidate = (value: string): void => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    uriStrings.add(trimmed);
  };

  addCandidate(rawPayload);

  try {
    const parsed = JSON.parse(rawPayload) as unknown;
    collectUriCandidates(parsed, addCandidate);
  } catch {
    // Non-JSON payload; fall back to direct parsing.
  }

  const uris: vscode.Uri[] = [];
  for (const candidate of uriStrings) {
    const uri = parseUriLikeText(candidate);
    if (uri) {
      uris.push(uri);
    }
  }

  return uris;
}

function parseStructuredUnknownPayload(payload: unknown): vscode.Uri[] {
  const uriStrings = new Set<string>();
  collectUriCandidates(payload, (candidate) => uriStrings.add(candidate));

  const uris: vscode.Uri[] = [];
  for (const candidate of uriStrings) {
    const parsed = parseUriLikeText(candidate);
    if (parsed) {
      uris.push(parsed);
    }
  }

  return uris;
}

function collectFileLikeValueUris(value: unknown): vscode.Uri[] {
  if (!value) {
    return [];
  }

  const uris: vscode.Uri[] = [];
  const collect = (entry: unknown): void => {
    if (!entry) {
      return;
    }

    if (entry instanceof vscode.Uri) {
      uris.push(entry);
      return;
    }

    if (Array.isArray(entry)) {
      for (const nested of entry) {
        collect(nested);
      }
      return;
    }

    if (typeof entry !== "object") {
      return;
    }

    const maybeFile = entry as { uri?: vscode.Uri | string };
    if (maybeFile.uri instanceof vscode.Uri) {
      uris.push(maybeFile.uri);
      return;
    }

    if (typeof maybeFile.uri === "string") {
      const parsed = parseUriLikeText(maybeFile.uri);
      if (parsed) {
        uris.push(parsed);
      }
    }
  };

  collect(value);
  return uris;
}

function collectUriCandidates(
  value: unknown,
  push: (candidate: string) => void
): void {
  if (value instanceof vscode.Uri) {
    push(value.toString());
    return;
  }

  if (typeof value === "string") {
    push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectUriCandidates(entry, push);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const objectValue = value as Record<string, unknown>;
  const hasUriShape =
    typeof objectValue.scheme === "string" && typeof objectValue.path === "string";

  if (hasUriShape) {
    try {
      const uri = vscode.Uri.from({
        scheme: String(objectValue.scheme),
        authority:
          typeof objectValue.authority === "string" ? objectValue.authority : "",
        path: String(objectValue.path),
        query: typeof objectValue.query === "string" ? objectValue.query : "",
        fragment: typeof objectValue.fragment === "string" ? objectValue.fragment : "",
      });
      push(uri.toString());
    } catch {
      // Fall back to recursive parsing below.
    }
  }

  for (const [key, entry] of Object.entries(objectValue)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey === "uri" ||
      normalizedKey === "resourceuri" ||
      normalizedKey === "path" ||
      normalizedKey === "fspath" ||
      normalizedKey === "sourceuri"
    ) {
      collectUriCandidates(entry, push);
      continue;
    }

    if (
      normalizedKey === "scheme" ||
      normalizedKey === "authority" ||
      normalizedKey === "fragment"
    ) {
      continue;
    }

    collectUriCandidates(entry, push);
  }
}

function parseUriLikeText(text: string): vscode.Uri | undefined {
  if (!text) {
    return undefined;
  }

  const trimmed = text.trim().replace(/^"(.*)"$/, "$1");
  if (!trimmed) {
    return undefined;
  }

  const isWindowsDrivePath = /^[a-zA-Z]:[\\/]/.test(trimmed);
  const isUncPath = /^\\\\/.test(trimmed);
  if (isWindowsDrivePath || isUncPath) {
    return vscode.Uri.file(trimmed);
  }

  const isUriStyleWindowsPath = /^\/[a-zA-Z]:\//.test(trimmed);
  if (isUriStyleWindowsPath) {
    return vscode.Uri.file(trimmed.slice(1));
  }

  if (path.isAbsolute(trimmed)) {
    return vscode.Uri.file(trimmed);
  }

  try {
    const parsed = vscode.Uri.parse(trimmed, true);
    if (parsed.scheme) {
      return parsed;
    }
  } catch {
    // Not a URI-like value.
  }

  return undefined;
}

function resolveLiveTabsFromEntries(entries: readonly OpenedEditorItem[]): vscode.Tab[] {
  const groups = vscode.window.tabGroups.all;
  const used = new Set<vscode.Tab>();
  const resolved: vscode.Tab[] = [];

  for (const entry of entries) {
    const tab = findLiveTabForEntry(entry, groups, used);
    if (!tab) {
      continue;
    }

    used.add(tab);
    resolved.push(tab);
  }

  return resolved;
}

function findLiveTabForEntry(
  entry: OpenedEditorItem,
  groups: readonly vscode.TabGroup[],
  usedTabs: Set<vscode.Tab>
): vscode.Tab | undefined {
  const indexedTab = findIndexedTab(entry.id, groups);
  if (indexedTab && !usedTabs.has(indexedTab) && tabMatchesTarget(indexedTab, entry.target)) {
    return indexedTab;
  }

  for (const group of groups) {
    for (const tab of group.tabs) {
      if (usedTabs.has(tab)) {
        continue;
      }

      if (tabMatchesTarget(tab, entry.target)) {
        return tab;
      }
    }
  }

  if (indexedTab && !usedTabs.has(indexedTab)) {
    return indexedTab;
  }

  return undefined;
}

function findIndexedTab(
  itemId: string | undefined,
  groups: readonly vscode.TabGroup[]
): vscode.Tab | undefined {
  if (!itemId) {
    return undefined;
  }

  const match = /^(\d+):(\d+):/.exec(itemId);
  if (!match) {
    return undefined;
  }

  const groupIndex = Number.parseInt(match[1], 10);
  const tabIndex = Number.parseInt(match[2], 10);
  if (Number.isNaN(groupIndex) || Number.isNaN(tabIndex)) {
    return undefined;
  }

  const group = groups[groupIndex];
  return group?.tabs[tabIndex];
}

function tabMatchesTarget(tab: vscode.Tab, target: OpenCommandTarget): boolean {
  const input = tab.input;

  if (target.kind === "open") {
    return input instanceof vscode.TabInputText && input.uri.toString() === target.uri.toString();
  }

  if (target.kind === "openWith") {
    if (input instanceof vscode.TabInputCustom) {
      return (
        input.uri.toString() === target.uri.toString() && input.viewType === target.viewType
      );
    }

    if (input instanceof vscode.TabInputNotebook) {
      return (
        input.uri.toString() === target.uri.toString() &&
        input.notebookType === target.viewType
      );
    }

    return false;
  }

  if (input instanceof vscode.TabInputTextDiff) {
    return (
      input.original.toString() === target.original.toString() &&
      input.modified.toString() === target.modified.toString()
    );
  }

  if (input instanceof vscode.TabInputNotebookDiff) {
    return (
      input.original.toString() === target.original.toString() &&
      input.modified.toString() === target.modified.toString()
    );
  }

  return false;
}

function uniqueUris(uris: readonly vscode.Uri[]): vscode.Uri[] {
  const byUriString = new Map<string, vscode.Uri>();

  for (const uri of uris) {
    byUriString.set(uri.toString(), uri);
  }

  return [...byUriString.values()];
}

async function uriExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function pasteClipboardEntries(
  clipboard: ClipboardState,
  targetDirectory: vscode.Uri
): Promise<{ completed: number; errors: string[] }> {
  let completed = 0;
  const errors: string[] = [];

  for (const sourceUri of clipboard.uris) {
    if (sourceUri.scheme !== "file") {
      errors.push(`${sourceUri.toString(true)}: only file resources supported.`);
      continue;
    }

    try {
      const destinationUri = await resolvePasteDestination(
        sourceUri,
        targetDirectory,
        clipboard.mode
      );

      if (!destinationUri) {
        errors.push(
          `${path.basename(sourceUri.fsPath)}: target already has item with same name.`
        );
        continue;
      }

      if (destinationUri.toString() === sourceUri.toString()) {
        continue;
      }

      if (clipboard.mode === "copy") {
        await vscode.workspace.fs.copy(sourceUri, destinationUri, {
          overwrite: false,
        });
      } else {
        await vscode.workspace.fs.rename(sourceUri, destinationUri, {
          overwrite: false,
        });
      }

      completed += 1;
    } catch (error) {
      errors.push(`${path.basename(sourceUri.fsPath)}: ${toErrorMessage(error)}`);
    }
  }

  return { completed, errors };
}

async function resolvePasteDestination(
  sourceUri: vscode.Uri,
  targetDirectory: vscode.Uri,
  mode: ClipboardMode
): Promise<vscode.Uri | undefined> {
  const baseName = path.basename(sourceUri.fsPath);
  const directTarget = vscode.Uri.joinPath(targetDirectory, baseName);

  if (directTarget.toString() === sourceUri.toString()) {
    return mode === "copy"
      ? buildCopyNameDestination(targetDirectory, baseName)
      : directTarget;
  }

  if (!(await uriExists(directTarget))) {
    return directTarget;
  }

  if (mode === "cut") {
    return undefined;
  }

  return buildCopyNameDestination(targetDirectory, baseName);
}

async function buildCopyNameDestination(
  targetDirectory: vscode.Uri,
  baseName: string
): Promise<vscode.Uri> {
  const parsed = path.parse(baseName);
  const stem = parsed.ext ? parsed.name : baseName;
  const ext = parsed.ext;

  for (let copyIndex = 1; copyIndex < 1000; copyIndex += 1) {
    const suffix = copyIndex === 1 ? " copy" : ` copy ${copyIndex}`;
    const candidateName = `${stem}${suffix}${ext}`;
    const candidateUri = vscode.Uri.joinPath(targetDirectory, candidateName);

    if (!(await uriExists(candidateUri))) {
      return candidateUri;
    }
  }

  throw new Error("Could not create unique copy name.");
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
