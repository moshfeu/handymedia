const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('ffmpeg-static');
const fs = require('fs');

// Set ffmpeg path to the bundled static binary
ffmpeg.setFfmpegPath(ffmpegInstaller);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1612'
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle file selection
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'm4v', 'kv'] }]
  });
  return result.filePaths[0];
});

// Handle target folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// Handle conversion
ipcMain.handle('start-conversion', async (event, { filePath, targetFolder }) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(targetFolder, `${fileName}_landscape.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',
        '-c:a', 'copy'
      ])
      .on('progress', (progress) => {
        event.sender.send('conversion-progress', progress.percent);
      })
      .on('error', (err) => {
        reject(err.message);
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .save(outputPath);
  });
});
