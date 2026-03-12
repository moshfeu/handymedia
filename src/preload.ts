import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  startConversion: (data: { filePath: string, targetFolder: string }) => ipcRenderer.invoke('start-conversion', data),
  onProgress: (callback: (percent: number) => void) => {
    const listener = (_event: any, value: number) => callback(value);
    ipcRenderer.on('conversion-progress', listener);
    return () => ipcRenderer.removeListener('conversion-progress', listener);
  }
});
