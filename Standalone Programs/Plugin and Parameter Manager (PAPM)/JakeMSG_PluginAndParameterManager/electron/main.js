'use strict';

const path = require('path');
const { app, BrowserWindow, dialog } = require('electron');

const {
  APP_NAME,
  startServer
} = require('../src/server');

let mainWindow = null;
let serverRuntime = null;
let quitting = false;
const SHUTDOWN_TIMEOUT_MS = 2500;
const EXTERNAL_PLUGINS_PROMPT_HASH = '#external-plugins-change-prompt';
const externalPluginsPromptWindows = new Set();

function isExternalPluginsPromptUrl(urlValue) {
  return String(urlValue || '').includes(EXTERNAL_PLUGINS_PROMPT_HASH);
}

function unregisterExternalPluginsPromptWindow(promptWindow) {
  if (!promptWindow) return;
  externalPluginsPromptWindows.delete(promptWindow);
}

function bringExternalPluginsPromptWindowToFront(promptWindow) {
  if (!promptWindow || promptWindow.isDestroyed()) {
    return false;
  }

  try {
    if (promptWindow.isMinimized()) {
      promptWindow.restore();
    }

    promptWindow.show();
    promptWindow.moveTop();
    promptWindow.focus();
    promptWindow.flashFrame(false);
    return true;
  } catch (_error) {
    return false;
  }
}

function bringAnyExternalPluginsPromptWindowToFront() {
  for (const promptWindow of Array.from(externalPluginsPromptWindows)) {
    if (!promptWindow || promptWindow.isDestroyed()) {
      unregisterExternalPluginsPromptWindow(promptWindow);
      continue;
    }

    if (bringExternalPluginsPromptWindowToFront(promptWindow)) {
      return true;
    }
  }

  return false;
}

function registerExternalPluginsPromptWindow(promptWindow) {
  if (!promptWindow || promptWindow.isDestroyed()) return;

  externalPluginsPromptWindows.add(promptWindow);

  promptWindow.on('focus', () => {
    try {
      promptWindow.flashFrame(false);
    } catch (_error) {
      // no-op
    }
  });

  promptWindow.on('blur', () => {
    if (!externalPluginsPromptWindows.has(promptWindow)) return;

    try {
      promptWindow.flashFrame(true);
    } catch (_error) {
      // no-op
    }
  });

  promptWindow.on('closed', () => {
    unregisterExternalPluginsPromptWindow(promptWindow);
  });
}

function createBridge() {
  return {
    async pickDirectory(options) {
      const result = await dialog.showOpenDialog(mainWindow || undefined, {
        title: options && options.title ? String(options.title) : 'Select Folder',
        properties: ['openDirectory']
      });

      if (result.canceled) return '';
      if (!Array.isArray(result.filePaths) || result.filePaths.length <= 0) return '';
      return String(result.filePaths[0] || '').trim();
    },

    async pickPluginFile(options) {
      const result = await dialog.showOpenDialog(mainWindow || undefined, {
        title: options && options.title ? String(options.title) : 'Select Plugin File',
        defaultPath: options && options.defaultPath ? String(options.defaultPath) : undefined,
        properties: ['openFile'],
        filters: [
          { name: 'JavaScript Plugin', extensions: ['js'] }
        ]
      });

      if (result.canceled) return '';
      if (!Array.isArray(result.filePaths) || result.filePaths.length <= 0) return '';
      return String(result.filePaths[0] || '').trim();
    }
  };
}

function createMainWindow(serverUrl) {
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1600,
    height: 980,
    minWidth: 1120,
    minHeight: 700,
    backgroundColor: '#12151a',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadURL(serverUrl);

  mainWindow.webContents.on('did-create-window', (childWindow, details) => {
    if (!isExternalPluginsPromptUrl(details && details.url)) {
      return;
    }

    registerExternalPluginsPromptWindow(childWindow);

    try {
      childWindow.flashFrame(true);
    } catch (_error) {
      // no-op
    }

    if (mainWindow && mainWindow.isFocused()) {
      setTimeout(() => {
        bringExternalPluginsPromptWindowToFront(childWindow);
      }, 0);
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on('focus', () => {
    bringAnyExternalPluginsPromptWindowToFront();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    externalPluginsPromptWindows.clear();
  });

  mainWindow.on('close', (event) => {
    if (quitting) return;
    event.preventDefault();
    shutdownAndQuit();
  });
}

async function shutdownAndQuit() {
  if (quitting) return;
  quitting = true;

  if (mainWindow && !mainWindow.isDestroyed()) {
    const target = mainWindow;
    mainWindow = null;

    try {
      target.removeAllListeners('close');
      target.destroy();
    } catch (_ignored) {
      // no-op
    }
  }

  let timedOut = false;

  try {
    if (serverRuntime && typeof serverRuntime.close === 'function') {
      await Promise.race([
        serverRuntime.close(),
        new Promise((resolve) => {
          setTimeout(() => {
            timedOut = true;
            resolve();
          }, SHUTDOWN_TIMEOUT_MS);
        })
      ]);
    }
  } catch (err) {
    // no-op: app is exiting
  } finally {
    if (timedOut) {
      console.warn(`[${APP_NAME}] shutdown timeout hit; forcing exit.`);
    }

    app.exit(0);
  }
}

async function bootstrap() {
  app.setAppUserModelId('JakeMSG.PluginAndParameterManager');

  await app.whenReady();

  serverRuntime = await startServer({
    port: 0,
    electronBridge: createBridge(),
    autoDetectCandidates: [
      process.cwd(),
      path.resolve(process.cwd(), '..'),
      path.resolve(process.cwd(), '..', '..'),
      path.resolve(__dirname, '..')
    ]
  });

  createMainWindow(serverRuntime.url);

  app.on('activate', () => {
    if (!mainWindow && serverRuntime) {
      createMainWindow(serverRuntime.url);
    }
  });

  app.on('window-all-closed', () => {
    shutdownAndQuit();
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

  await shutdownAndQuit();
});
