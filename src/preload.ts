import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  startConversion: (data: { filePath: string, targetFolder: string }) => ipcRenderer.invoke('start-conversion', data),
  onProgress: (callback: (percent: number) => void) => {
    const listener = (_event: any, value: number) => callback(value);
    ipcRenderer.on('conversion-progress', listener);
    return () => ipcRenderer.removeListener('conversion-progress', listener);
  },
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback);
    return () => ipcRenderer.removeListener('update-available', callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback);
    return () => ipcRenderer.removeListener('update-downloaded', callback);
  },
  restartApp: () => ipcRenderer.invoke('restart-app'),
  generatePreview: (filePath: string) => ipcRenderer.invoke('generate-preview', filePath)
});
