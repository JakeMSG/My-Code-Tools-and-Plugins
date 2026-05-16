# JakeMSG_PluginAndParameterManager

Standalone plugin manager for RPG Maker MV and MZ projects.

## Features

- Standalone app (no in-game runtime required)
- Auto-detects MV/MZ project roots from current path
- Fallback folder picker when auto-detect fails
- Reads/writes `plugins.js`
- Plugin order editing with drag and drop
- Plugin parameter editing with typed controls + plain text field
- Separate internal folder grouping (does not change plugin load order)
- Multi-tab parameter editing
- Developer mode: edit plugin parameter schema (`@param` blocks) and write back into plugin file

## Requirements

- Windows
- Node.js 18+

## Run

### Option A: Batch launcher

Double-click `JakeMSG_PluginAndParameterManager.bat`

### Option B: Terminal

```powershell
cd JakeMSG_PluginAndParameterManager
npm start
```

Then open http://localhost:47842

## Detection rules

- MV root: folder containing `www/js/plugins.js`
- MV subfolders: `www`, `www/js`, `www/js/plugins`
- MZ root: folder containing `js/plugins.js`
- MZ subfolders: `js`, `js/plugins`

If not detected, use folder picker:

- MV: select `www` folder (or game root)
- MZ: select game root folder

## Developer mode notes

Schema editor rewrites main plugin header `/*: ... */` parameter section (`@param` block sequence) in order shown in UI.
