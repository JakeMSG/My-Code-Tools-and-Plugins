'use strict';

const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const pngio = require('../src/pngio');
const webp = require('../src/webp');

const APP_NAME = 'Image Mask Maker - v1.0';
const OPEN_FILTER = [{ name: 'PNG and WebP', extensions: ['png', 'webp'] }];
const SAVE_FILTERS = [
  { name: 'PNG Image', extensions: ['png'] },
  { name: 'WebP Image', extensions: ['webp'] }
];

let mainWindow = null;
let quitting = false;

function assertImagePath(filePath) {
  const resolved = path.resolve(String(filePath || ''));
  const ext = path.extname(resolved).toLowerCase();
  if (!resolved || (ext !== '.png' && ext !== '.webp')) {
    throw new Error('Only .png and .webp files are supported.');
  }
  return resolved;
}

function isImagePath(filePath) {
  const ext = path.extname(String(filePath || '')).toLowerCase();
  return ext === '.png' || ext === '.webp';
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
      title: options && options.title ? String(options.title) : 'Select PNG or WebP pictures',
      properties: ['openFile', 'multiSelections'],
      filters: OPEN_FILTER
    });
    if (result.canceled) return [];
    return (result.filePaths || []).filter(isImagePath);
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
    const suggested = options && options.defaultPath ? String(options.defaultPath) : 'Mask.png';
    const result = await dialog.showSaveDialog(mainWindow || undefined, {
      title: options && options.title ? String(options.title) : 'Save mask',
      defaultPath: suggested,
      filters: SAVE_FILTERS
    });
    if (result.canceled) return '';
    let filePath = String(result.filePath || '').trim();
    if (filePath && !isImagePath(filePath)) {
      const fallback = path.extname(suggested).toLowerCase() === '.webp' ? '.webp' : '.png';
      filePath += fallback;
    }
    return filePath;
  });

  ipcMain.handle('read-png', async (_event, filePath) => {
    const resolved = assertImagePath(filePath);
    const buffer = await fs.promises.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const size = ext === '.webp' ? webp.readWebpSize(buffer) : await pngio.parsePngBuffer(buffer);
    return {
      path: resolved,
      name: path.basename(resolved),
      width: size.width,
      height: size.height,
      mime: ext === '.webp' ? 'image/webp' : 'image/png',
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
    const saved = await pngio.saveRgbaImage(filePath, data.width, data.height, data.rgba);
    return { ok: true, paths: [saved] };
  });

  ipcMain.handle('save-png-files', async (_event, payload) => {
    const data = payload || {};
    const directory = String(data.directory || '');
    const files = Array.isArray(data.files) ? data.files : [];
    const targets = files.map((file) => path.join(directory, pngio.sanitizeBaseName(file.name) + pngio.imageExt(file.ext)));
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
  app.setAppUserModelId('ImageMaskMaker');
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
