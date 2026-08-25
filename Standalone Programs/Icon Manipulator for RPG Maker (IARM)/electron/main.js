'use strict';

const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const pngio = require('../src/pngio');

const APP_NAME = 'Icon Manipulator for RPG Maker - v1.0';
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
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
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

async function collectExisting(filePaths) {
  const existing = [];
  for (const filePath of filePaths) {
    try {
      await fs.promises.access(filePath);
      existing.push(filePath);
    } catch (_ignored) {
      // missing
    }
  }
  return existing;
}

function registerIpc() {
  ipcMain.handle('pick-pngs', async (_event, options) => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: options && options.title ? String(options.title) : 'Select PNG files',
      properties: ['openFile', 'multiSelections'],
      filters: PNG_FILTER
    });
    if (result.canceled) return [];
    return (result.filePaths || []).filter((filePath) => path.extname(filePath).toLowerCase() === '.png');
  });

  ipcMain.handle('pick-png', async (_event, options) => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: options && options.title ? String(options.title) : 'Select a PNG file',
      properties: ['openFile'],
      filters: PNG_FILTER
    });
    if (result.canceled) return '';
    const filePath = String((result.filePaths && result.filePaths[0]) || '');
    return path.extname(filePath).toLowerCase() === '.png' ? filePath : '';
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
      title: options && options.title ? String(options.title) : 'Save PNG',
      defaultPath: options && options.defaultPath ? String(options.defaultPath) : 'Iconset.png',
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

  ipcMain.handle('save-png-file', async (_event, payload) => {
    const data = payload || {};
    const filePath = String(data.filePath || '');
    if (!filePath) {
      throw new Error('No save path was chosen.');
    }
    if (!data.overwrite) {
      const existing = await collectExisting([filePath]);
      if (existing.length) {
        return { ok: false, code: 'exists', paths: existing };
      }
    }
    const saved = await pngio.saveRgbaPng(filePath, data.width, data.height, data.rgba);
    return { ok: true, paths: [saved] };
  });

  ipcMain.handle('save-png-files', async (_event, payload) => {
    const data = payload || {};
    const directory = String(data.directory || '');
    const files = Array.isArray(data.files) ? data.files : [];
    const targets = files.map((file) => path.join(directory, pngio.sanitizeBaseName(file.name) + '.png'));
    if (!data.overwrite) {
      const existing = await collectExisting(targets);
      if (existing.length) {
        return { ok: false, code: 'exists', paths: existing };
      }
    }
    const paths = await pngio.saveRgbaPngs(data);
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
    shell.showItemInFolder(path.resolve(String(filePath || '')));
    return true;
  });
}

async function bootstrap() {
  app.setAppUserModelId('IconManipulatorForRPGMaker');
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
    // ignore
  }
  app.exit(1);
});
