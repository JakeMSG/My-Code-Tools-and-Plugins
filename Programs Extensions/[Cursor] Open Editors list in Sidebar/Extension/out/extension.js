"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
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
const COMMAND_DELETE = "openEditorsList.delete";
const COMMAND_COMPARE = "openEditorsList.compare";
const COMMAND_ADD_FILES_TO_CURSOR_CHAT = "openEditorsList.addFilesToCursorChat";
const COMMAND_ADD_FILES_TO_NEW_CURSOR_CHAT = "openEditorsList.addFilesToNewCursorChat";
const COMMAND_OPEN_TIMELINE = "openEditorsList.openTimeline";
const CONTEXT_HAS_CLIPBOARD = "openEditorsList.hasClipboard";
class OpenedEditorItem extends vscode.TreeItem {
    target;
    isFileResource;
    constructor(params) {
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
class OpenedEditorsDragAndDropController {
    dragMimeTypes = [
        "text/uri-list",
        "text/plain",
        `application/vnd.code.tree.${VIEW_ID}`,
    ];
    dropMimeTypes = [];
    async handleDrag(source, dataTransfer) {
        const dragUris = uniqueUris(source
            .map((item) => item.resourceUri)
            .filter((uri) => uri !== undefined));
        if (dragUris.length === 0) {
            return;
        }
        dataTransfer.set("text/uri-list", new vscode.DataTransferItem(dragUris.map((uri) => uri.toString()).join("\r\n")));
        dataTransfer.set("text/plain", new vscode.DataTransferItem(dragUris
            .map((uri) => (uri.scheme === "file" ? uri.fsPath : uri.toString(true)))
            .join("\n")));
        dataTransfer.set(`application/vnd.code.tree.${VIEW_ID}`, new vscode.DataTransferItem(JSON.stringify(dragUris.map((uri) => uri.toString()))));
    }
    async handleDrop(_target, _dataTransfer, _token) {
        // Drag-out only for this view.
    }
}
class OpenedEditorsProvider {
    changeEmitter = new vscode.EventEmitter();
    onDidChangeTreeData = this.changeEmitter.event;
    disposables = [];
    constructor() {
        this.disposables.push(vscode.window.tabGroups.onDidChangeTabs(() => this.refresh()), vscode.window.tabGroups.onDidChangeTabGroups(() => this.refresh()), vscode.window.onDidChangeActiveTextEditor(() => this.refresh()), vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh()));
    }
    dispose() {
        this.changeEmitter.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
    refresh() {
        this.changeEmitter.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return [];
        }
        return this.collectItems();
    }
    getItemCount() {
        return this.collectItems().length;
    }
    collectItems() {
        const groups = vscode.window.tabGroups.all;
        const hasMultipleGroups = groups.length > 1;
        const items = [];
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
    buildOpenTarget(tab, viewColumn) {
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
    extractResourceUri(tab) {
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
    buildStableId(groupIndex, tabIndex, resourceUri, tab) {
        const resourcePart = resourceUri ? resourceUri.toString() : tab.label;
        return `${groupIndex}:${tabIndex}:${resourcePart}`;
    }
    buildDescription(resourceUri, groupIndex, hasMultipleGroups) {
        const parts = [];
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
    buildTooltip(tab, resourceUri, groupIndex, hasMultipleGroups) {
        const lines = [tab.label];
        if (resourceUri) {
            lines.push(resourceUri.scheme === "file" ? resourceUri.fsPath : resourceUri.toString(true));
        }
        if (hasMultipleGroups) {
            lines.push(`Group ${groupIndex + 1}`);
        }
        if (tab.isDirty) {
            lines.push("Unsaved changes");
        }
        return lines.join("\n");
    }
    getParentPathForDisplay(resourceUri) {
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
function activate(context) {
    const provider = new OpenedEditorsProvider();
    const dragAndDropController = new OpenedEditorsDragAndDropController();
    const treeView = vscode.window.createTreeView(VIEW_ID, {
        treeDataProvider: provider,
        showCollapseAll: false,
        canSelectMany: true,
        dragAndDropController,
    });
    let lastSelection = [];
    let clipboardState;
    const setClipboardState = (nextState) => {
        clipboardState = nextState;
        void vscode.commands.executeCommand("setContext", CONTEXT_HAS_CLIPBOARD, Boolean(nextState && nextState.uris.length > 0));
    };
    const updateViewMessage = () => {
        treeView.message =
            provider.getItemCount() === 0 ? "No opened file editors right now." : undefined;
    };
    const resolveSelection = (item, selectedItems) => {
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
    const resolveFileUris = (item, selectedItems) => {
        const entries = resolveSelection(item, selectedItems);
        return uniqueUris(entries
            .map((entry) => entry.resourceUri)
            .filter((uri) => uri !== undefined && uri.scheme === "file"));
    };
    const resolvePasteTargetDirectory = (item, selectedItems) => {
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
    context.subscriptions.push(provider, treeView, treeView.onDidChangeSelection((event) => {
        lastSelection = event.selection;
    }), provider.onDidChangeTreeData(() => updateViewMessage()), vscode.commands.registerCommand(COMMAND_REFRESH, () => {
        provider.refresh();
        updateViewMessage();
    }), vscode.commands.registerCommand(COMMAND_OPEN_EDITOR, async (item, selectedItems) => {
        const entries = resolveSelection(item, selectedItems);
        if (entries.length === 0) {
            return;
        }
        await openEditorFromTarget(entries[0].target);
    }), vscode.commands.registerCommand(COMMAND_OPEN_EDITOR_TO_SIDE, async (item, selectedItems) => {
        const entries = resolveSelection(item, selectedItems);
        if (entries.length === 0) {
            return;
        }
        await openEditorFromTarget(entries[0].target, {
            preview: false,
            viewColumn: vscode.ViewColumn.Beside,
        });
    }), vscode.commands.registerCommand(COMMAND_REVEAL_IN_EXPLORER, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            return;
        }
        await vscode.commands.executeCommand("revealInExplorer", uris[0]);
    }), vscode.commands.registerCommand(COMMAND_COPY_PATH, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file path selected.");
            return;
        }
        await vscode.env.clipboard.writeText(uris.map((uri) => uri.fsPath).join("\n"));
    }), vscode.commands.registerCommand(COMMAND_COPY_RELATIVE_PATH, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file path selected.");
            return;
        }
        await vscode.env.clipboard.writeText(uris.map((uri) => vscode.workspace.asRelativePath(uri, false)).join("\n"));
    }), vscode.commands.registerCommand(COMMAND_COPY, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected to copy.");
            return;
        }
        setClipboardState({ mode: "copy", uris });
        vscode.window.setStatusBarMessage(`Opened Editors: copied ${uris.length} item(s).`, 2000);
    }), vscode.commands.registerCommand(COMMAND_CUT, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected to cut.");
            return;
        }
        setClipboardState({ mode: "cut", uris });
        vscode.window.setStatusBarMessage(`Opened Editors: cut ${uris.length} item(s).`, 2000);
    }), vscode.commands.registerCommand(COMMAND_PASTE, async (item, selectedItems) => {
        if (!clipboardState || clipboardState.uris.length === 0) {
            void vscode.window.showInformationMessage("Clipboard is empty.");
            return;
        }
        const targetDirectory = resolvePasteTargetDirectory(item, selectedItems);
        if (!targetDirectory) {
            void vscode.window.showErrorMessage("No target folder found. Open workspace folder first.");
            return;
        }
        const result = await pasteClipboardEntries(clipboardState, targetDirectory);
        if (clipboardState.mode === "cut" && result.completed > 0) {
            setClipboardState(undefined);
        }
        provider.refresh();
        updateViewMessage();
        if (result.errors.length > 0) {
            void vscode.window.showWarningMessage(`Paste done with ${result.errors.length} issue(s): ${result.errors[0]}`);
            return;
        }
        if (result.completed > 0) {
            vscode.window.setStatusBarMessage(`Opened Editors: pasted ${result.completed} item(s).`, 2000);
        }
    }), vscode.commands.registerCommand(COMMAND_RENAME, async (item, selectedItems) => {
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
    }), vscode.commands.registerCommand(COMMAND_DELETE, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected to delete.");
            return;
        }
        const confirmLabel = uris.length === 1
            ? `Delete '${path.basename(uris[0].fsPath)}'?`
            : `Delete ${uris.length} selected files?`;
        const confirm = await vscode.window.showWarningMessage(confirmLabel, { modal: true }, "Delete");
        if (confirm !== "Delete") {
            return;
        }
        let deletedCount = 0;
        const errors = [];
        for (const uri of uris) {
            try {
                await vscode.workspace.fs.delete(uri, {
                    recursive: false,
                    useTrash: true,
                });
                deletedCount += 1;
            }
            catch (error) {
                errors.push(`${path.basename(uri.fsPath)}: ${toErrorMessage(error)}`);
            }
        }
        provider.refresh();
        updateViewMessage();
        if (errors.length > 0) {
            void vscode.window.showWarningMessage(`Delete done with ${errors.length} issue(s): ${errors[0]}`);
            return;
        }
        vscode.window.setStatusBarMessage(`Opened Editors: deleted ${deletedCount} item(s).`, 2000);
    }), vscode.commands.registerCommand(COMMAND_COMPARE, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        const activeUri = vscode.window.activeTextEditor?.document.uri;
        const compareUris = [...uris];
        if (compareUris.length < 2 &&
            activeUri?.scheme === "file" &&
            !compareUris.some((entry) => entry.toString() === activeUri.toString())) {
            compareUris.push(activeUri);
        }
        if (compareUris.length < 2) {
            void vscode.window.showInformationMessage("Select at least 2 files to compare.");
            return;
        }
        const left = compareUris[0];
        const right = compareUris[1];
        const compareTitle = `${path.basename(left.fsPath)} <-> ${path.basename(right.fsPath)}`;
        await vscode.commands.executeCommand("vscode.diff", left, right, compareTitle, { preview: false });
    }), vscode.commands.registerCommand(COMMAND_ADD_FILES_TO_CURSOR_CHAT, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected for Cursor Chat.");
            return;
        }
        const added = await addFilesToCursorChat(uris, false);
        if (!added) {
            void vscode.window.showWarningMessage("Could not find Cursor Chat command for adding files.");
            return;
        }
        vscode.window.setStatusBarMessage(`Opened Editors: sent ${uris.length} file(s) to Cursor Chat.`, 2000);
    }), vscode.commands.registerCommand(COMMAND_ADD_FILES_TO_NEW_CURSOR_CHAT, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected for Cursor Chat.");
            return;
        }
        const added = await addFilesToCursorChat(uris, true);
        if (!added) {
            void vscode.window.showWarningMessage("Could not find Cursor command for creating new chat with files.");
            return;
        }
        vscode.window.setStatusBarMessage(`Opened Editors: sent ${uris.length} file(s) to new Cursor Chat.`, 2000);
    }), vscode.commands.registerCommand(COMMAND_OPEN_TIMELINE, async (item, selectedItems) => {
        const uris = resolveFileUris(item, selectedItems);
        if (uris.length === 0) {
            void vscode.window.showInformationMessage("No file selected for timeline.");
            return;
        }
        const opened = await openTimelineForUri(uris[0]);
        if (!opened) {
            void vscode.window.showWarningMessage("Could not find a timeline command in this build.");
        }
    }));
    updateViewMessage();
}
function deactivate() {
    // No-op
}
async function openEditorFromTarget(target, overrides) {
    const openOptions = {
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
            await vscode.commands.executeCommand("vscode.openWith", target.uri, target.viewType, openOptions);
            return;
        }
        await vscode.commands.executeCommand("vscode.diff", target.original, target.modified, target.title, openOptions);
    }
    catch (error) {
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
async function addFilesToCursorChat(uris, useNewChat) {
    const argumentSets = buildFileArgumentSets(uris, useNewChat);
    if (useNewChat) {
        const directNewChatAdd = await executeFirstAvailableCommand(CURSOR_CHAT_NEW_WITH_FILES_COMMANDS, argumentSets);
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
async function openTimelineForUri(uri) {
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
function buildFileArgumentSets(uris, useNewChat) {
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
async function executeFirstAvailableCommand(candidateCommandIds, argumentSets) {
    const availableCommands = new Set(await vscode.commands.getCommands(true));
    for (const commandId of candidateCommandIds) {
        if (!availableCommands.has(commandId)) {
            continue;
        }
        for (const args of argumentSets) {
            try {
                await vscode.commands.executeCommand(commandId, ...args);
                return true;
            }
            catch {
                // Try next argument signature for this command.
            }
        }
    }
    return false;
}
function uniqueUris(uris) {
    const byUriString = new Map();
    for (const uri of uris) {
        byUriString.set(uri.toString(), uri);
    }
    return [...byUriString.values()];
}
async function uriExists(uri) {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    }
    catch {
        return false;
    }
}
async function pasteClipboardEntries(clipboard, targetDirectory) {
    let completed = 0;
    const errors = [];
    for (const sourceUri of clipboard.uris) {
        if (sourceUri.scheme !== "file") {
            errors.push(`${sourceUri.toString(true)}: only file resources supported.`);
            continue;
        }
        try {
            const destinationUri = await resolvePasteDestination(sourceUri, targetDirectory, clipboard.mode);
            if (!destinationUri) {
                errors.push(`${path.basename(sourceUri.fsPath)}: target already has item with same name.`);
                continue;
            }
            if (destinationUri.toString() === sourceUri.toString()) {
                continue;
            }
            if (clipboard.mode === "copy") {
                await vscode.workspace.fs.copy(sourceUri, destinationUri, {
                    overwrite: false,
                });
            }
            else {
                await vscode.workspace.fs.rename(sourceUri, destinationUri, {
                    overwrite: false,
                });
            }
            completed += 1;
        }
        catch (error) {
            errors.push(`${path.basename(sourceUri.fsPath)}: ${toErrorMessage(error)}`);
        }
    }
    return { completed, errors };
}
async function resolvePasteDestination(sourceUri, targetDirectory, mode) {
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
async function buildCopyNameDestination(targetDirectory, baseName) {
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
function toErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=extension.js.map