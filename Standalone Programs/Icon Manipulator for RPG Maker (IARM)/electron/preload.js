'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('iarm', {
  isElectron: true,
  getPathForFile(file) {
    try {
      return webUtils.getPathForFile(file);
    } catch (_error) {
      return file && file.path ? String(file.path) : '';
    }
  },
  pickPngs: (options) => ipcRenderer.invoke('pick-pngs', options),
  pickPng: (options) => ipcRenderer.invoke('pick-png', options),
  pickDirectory: (options) => ipcRenderer.invoke('pick-directory', options),
  pickSavePng: (options) => ipcRenderer.invoke('pick-save-png', options),
  readPng: (filePath) => ipcRenderer.invoke('read-png', filePath),
  savePngFile: (payload) => ipcRenderer.invoke('save-png-file', payload),
  savePngFiles: (payload) => ipcRenderer.invoke('save-png-files', payload),
  confirm: (options) => ipcRenderer.invoke('confirm', options),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath)
});
