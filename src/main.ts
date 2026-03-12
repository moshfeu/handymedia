import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';

// Set ffmpeg path to the bundled static binary
if (ffmpegInstaller) {
  ffmpeg.setFfmpegPath(ffmpegInstaller);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1612'
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);

    // Support DevTools hotkeys in development
    win.webContents.on('before-input-event', (event, input) => {
      const isCmdOrCtrl = input.control || input.meta;
      const isDevToolsKey = (isCmdOrCtrl && input.shift && input.key.toLowerCase() === 'i') ||
        (isCmdOrCtrl && input.alt && input.key.toLowerCase() === 'i') ||
        input.key === 'F12';

      if (input.type === 'keyDown' && isDevToolsKey) {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  } else {
    win.loadFile(path.join(__dirname, '../index.html'));
  }

  // Auto-updater listeners
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
  });
}

ipcMain.handle('restart-app', () => {
  autoUpdater.quitAndInstall();
});

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
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'm4v', 'mkv'] }]
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

interface ConversionParams {
  filePath: string;
  targetFolder: string;
}

// Handle conversion
ipcMain.handle('start-conversion', async (event, { filePath, targetFolder }: ConversionParams) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(targetFolder, `${fileName}_landscape.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',
        '-c:a', 'copy'
      ])
      .on('progress', (progress: any) => {
        event.sender.send('conversion-progress', progress.percent);
      })
      .on('error', (err: Error) => {
        reject(err.message);
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .save(outputPath);
  });
});
