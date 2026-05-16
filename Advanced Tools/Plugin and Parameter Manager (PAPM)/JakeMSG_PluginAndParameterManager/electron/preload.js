'use strict';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('JakeElectron', {
  isElectron: true
});
