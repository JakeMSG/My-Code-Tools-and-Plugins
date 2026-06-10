# Open Editors list in Sidebar

Adds an `OPENED EDITORS` view to the Explorer sidebar.  
The view lists currently opened file editors in the same left-to-right order as editor tabs, but vertically.

## Features

- Shows open editors from all tab groups.
- Keeps order aligned with tab bar order.
- Updates automatically when tabs are opened, closed, moved, focused, or changed.
- Supports multi-select in the `OPENED EDITORS` view (`Ctrl/Cmd+Click`, `Shift+Click`, `Ctrl/Cmd+A`).
- Supports file operations on current selection:
  - `Ctrl/Cmd+D` closes selected opened editor tabs
  - `Delete` key (Key Code 46 on Windows) moves files to Trash
  - `Ctrl/Cmd+C`, `Ctrl/Cmd+X`, `Ctrl/Cmd+V` (copy/cut/paste)
  - `F2` rename
- Supports drag out of selected entries (URI payload + text payload).
- Supports drag in / drop from other views or windows to open dropped files and add them to `OPENED EDITORS`.
- Adds right-click context menu on entries:
  - Open, Open to the Side, Reveal in Explorer View
  - Compare, Open Timeline
  - Add Files to Cursor Chat, Add Files to New Cursor Chat
  - Copy, Cut, Paste, Rename, Close (`Ctrl/Cmd+D`), Delete
  - Copy Path, Copy Relative Path
- Clicking an item opens/focuses that editor.
- Shows `No opened file editors right now.` when no file tab exists.

## Development setup

1. Install dependencies:
   - `npm install`
2. Compile extension:
   - `npm run compile`
3. Start Extension Development Host:
   - Press `F5` (or `Run and Debug` -> `Run Open Editors list in Sidebar`).

## Manual test checklist

1. In development host, open several files in different orders.
2. Check Explorer for `OPENED EDITORS` view.
3. Confirm order matches top tab bar order.
4. Drag tabs to reorder; verify view order updates.
5. Open split editor group; verify entries show group marker (`G1`, `G2`, ...).
6. Try multi-select:
   - `Ctrl/Cmd+Click` multiple entries.
   - `Shift+Click` range select.
   - `Ctrl/Cmd+A` select all.
7. Keyboard ops on selected entries:
   - `Ctrl/Cmd+D` closes selected opened tabs.
   - `Delete` removes selected files (confirm prompt appears).
   - `Ctrl/Cmd+C`, `Ctrl/Cmd+X`, `Ctrl/Cmd+V` copy/cut/paste selected files.
   - `F2` rename first selected file.
8. Right-click entry and verify context menu actions execute correctly.
   - Compare (2 selected files)
   - Add Files to Cursor Chat / Add Files to New Cursor Chat
   - Open Timeline
9. Drag selected entries into other windows/inputs and confirm URI/text payload appears.
10. Drag files from Explorer/other windows and drop into `OPENED EDITORS`; verify dropped files open and appear in list.
11. Close tabs; verify items disappear.
12. Edit file without saving; verify dirty marker (`●`) appears.

## Install in Cursor (non-debug)

1. Package extension:
   - `npm install --save-dev @vscode/vsce`
   - `npx @vscode/vsce package`
2. In Cursor, open Command Palette and run:
   - `Extensions: Install from VSIX...`
3. Pick generated `.vsix` file.
4. Reload Cursor when prompted.

## Update existing local install

1. Bump `version` in `package.json` (already `0.0.7` now).
2. Rebuild package:
   - `npm run compile`
   - `npx @vscode/vsce package`
3. Reinstall updated `.vsix` using `Extensions: Install from VSIX...`.
4. Reload Cursor.

## Publish to marketplaces (for Cursor users)

Cursor supports VS Code-compatible extensions. To make public installs easier, publish to Open VSX (and optionally VS Marketplace).

### Open VSX (recommended for Cursor compatibility)

1. Change `publisher` in `package.json` from `localdev` to your real namespace.
2. Create namespace/account at [Open VSX](https://open-vsx.org/).
3. Create Open VSX access token.
4. Publish:
   - `npm install --save-dev ovsx`
   - `npx ovsx publish -p <OPEN_VSX_TOKEN>`

### VS Marketplace (optional but useful)

1. Create a publisher in Azure DevOps Marketplace.
2. Create personal access token with Marketplace publish permission.
3. Publish:
   - `npm install --save-dev @vscode/vsce`
   - `npx @vscode/vsce publish`

### Notes

- Each release must increment `version` in `package.json`.
- Keep `README`, `LICENSE`, and repository metadata up to date for review/compliance.
