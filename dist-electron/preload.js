"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => electron.ipcRenderer.invoke("select-file"),
  selectFolder: () => electron.ipcRenderer.invoke("select-folder"),
  startConversion: (data) => electron.ipcRenderer.invoke("start-conversion", data),
  onProgress: (callback) => {
    const listener = (_event, value) => callback(value);
    electron.ipcRenderer.on("conversion-progress", listener);
    return () => electron.ipcRenderer.removeListener("conversion-progress", listener);
  }
});
