'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('fcrm', {
  isElectron: true,
  getPathForFile(file) {
    try {
      return webUtils.getPathForFile(file);
    } catch (_error) {
      return file && file.path ? String(file.path) : '';
    }
  },
  pickSourcePngs: () => ipcRenderer.invoke('pick-source-pngs'),
  pickFacePngs: () => ipcRenderer.invoke('pick-face-pngs'),
  pickDirectory: (options) => ipcRenderer.invoke('pick-directory', options),
  pickSavePng: (options) => ipcRenderer.invoke('pick-save-png', options),
  readPng: (filePath) => ipcRenderer.invoke('read-png', filePath),
  saveCreateSheets: (payload) => ipcRenderer.invoke('save-create-sheets', payload),
  saveModifySheets: (payload) => ipcRenderer.invoke('save-modify-sheets', payload),
  confirm: (options) => ipcRenderer.invoke('confirm', options),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath)
});
