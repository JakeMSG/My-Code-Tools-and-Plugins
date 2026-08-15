'use strict';

const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const pngio = require('../src/pngio');

const APP_NAME = 'Face Cutter for RPG Maker - v1.0';
const PNG_FILTER = [{ name: 'PNG Images', extensions: ['png'] }];

let mainWindow = null;
let quitting = false;

function assertPngPath(filePath) {
  const resolved = path.resolve(String(filePath || ''));
  if (!resolved || path.extname(resolved).toLowerCase() !== '.png') {
    throw new Error('Only .png files are supported.');
  }
  return resolved;
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0d1117',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpc() {
  ipcMain.handle('pick-source-pngs', async () => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: 'Select PNG pictures to cut faces from',
      properties: ['openFile', 'multiSelections'],
      filters: PNG_FILTER
    });
    if (result.canceled) return [];
    return (result.filePaths || []).filter((filePath) => path.extname(filePath).toLowerCase() === '.png');
  });

  ipcMain.handle('pick-face-pngs', async () => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: 'Select existing RPG Maker Face PNG file(s)',
      properties: ['openFile', 'multiSelections'],
      filters: PNG_FILTER
    });
    if (result.canceled) return [];
    return (result.filePaths || []).filter((filePath) => path.extname(filePath).toLowerCase() === '.png');
  });

  ipcMain.handle('pick-directory', async (_event, options) => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: options && options.title ? String(options.title) : 'Select output folder',
      defaultPath: options && options.defaultPath ? String(options.defaultPath) : undefined,
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled) return '';
    return String((result.filePaths && result.filePaths[0]) || '').trim();
  });

  ipcMain.handle('pick-save-png', async (_event, options) => {
    const result = await dialog.showSaveDialog(mainWindow || undefined, {
      title: options && options.title ? String(options.title) : 'Save Face PNG',
      defaultPath: options && options.defaultPath ? String(options.defaultPath) : 'Faces.png',
      filters: PNG_FILTER
    });
    if (result.canceled) return '';
    return String(result.filePath || '').trim();
  });

  ipcMain.handle('read-png', async (_event, filePath) => {
    const resolved = assertPngPath(filePath);
    const buffer = await fs.promises.readFile(resolved);
    const png = await pngio.parsePngBuffer(buffer);
    return {
      path: resolved,
      name: path.basename(resolved),
      width: png.width,
      height: png.height,
      bytes: buffer
    };
  });

  ipcMain.handle('save-create-sheets', async (_event, payload) => {
    const data = payload || {};
    const directory = String(data.directory || '');
    const sheets = Array.isArray(data.sheets) ? data.sheets : [];
    const baseName = pngio.sanitizeBaseName(data.baseName);
    if (!directory) {
      throw new Error('No output folder was chosen.');
    }

    const existing = [];
    for (let i = 0; i < sheets.length; i += 1) {
      const filePath = path.join(directory, pngio.fileNameForSheet(baseName, i, sheets.length));
      try {
        await fs.promises.access(filePath);
        existing.push(filePath);
      } catch (_ignored) {
        // file does not exist
      }
    }

    if (existing.length > 0 && !data.overwrite) {
      return { ok: false, code: 'exists', paths: existing };
    }

    const paths = await pngio.createSheets(data);
    return { ok: true, paths };
  });

  ipcMain.handle('save-modify-sheets', async (_event, payload) => {
    const data = payload || {};
    const sheets = Array.isArray(data.sheets) ? data.sheets : [];
    const existing = [];

    for (const sheet of sheets) {
      const outputPath = String(sheet.outputPath || sheet.path || '');
      const sourcePath = String(sheet.path || '');
      if (outputPath && outputPath !== sourcePath) {
        try {
          await fs.promises.access(outputPath);
          existing.push(outputPath);
        } catch (_ignored) {
          // file does not exist
        }
      }
    }

    if (existing.length > 0 && !data.overwrite) {
      return { ok: false, code: 'exists', paths: existing };
    }

    const paths = await pngio.modifySheets(data);
    return { ok: true, paths };
  });

  ipcMain.handle('confirm', async (_event, options) => {
    const result = await dialog.showMessageBox(mainWindow || undefined, {
      type: (options && options.type) || 'question',
      title: (options && options.title) || APP_NAME,
      message: (options && options.message) || '',
      detail: (options && options.detail) || '',
      buttons: (options && options.buttons) || ['Cancel', 'OK'],
      defaultId: options && Number.isInteger(options.defaultId) ? options.defaultId : 1,
      cancelId: options && Number.isInteger(options.cancelId) ? options.cancelId : 0,
      noLink: true
    });
    return result.response;
  });

  ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
    const resolved = path.resolve(String(filePath || ''));
    shell.showItemInFolder(resolved);
    return true;
  });
}

async function bootstrap() {
  app.setAppUserModelId('FaceCutterForRPGMaker');
  registerIpc();
  await app.whenReady();
  createMainWindow();

  app.on('activate', () => {
    if (!mainWindow) {
      createMainWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (quitting) return;
    quitting = true;
    app.quit();
  });
}

bootstrap().catch(async (err) => {
  const message = err && err.message ? err.message : String(err);
  try {
    await dialog.showMessageBox({
      type: 'error',
      title: APP_NAME,
      message: 'Failed to start application.',
      detail: message
    });
  } catch (_ignored) {
    // ignore secondary failure
  }
  app.exit(1);
});
