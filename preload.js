const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  startConversion: (data) => ipcRenderer.invoke('start-conversion', data),
  onProgress: (callback) => ipcRenderer.on('conversion-progress', (_event, value) => callback(value))
});
