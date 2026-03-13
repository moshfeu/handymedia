import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';

// Set ffmpeg path to the bundled static binary
const getFfmpegPath = () => {
    if (!ffmpegInstaller) return null;

    // In dev mode, use the node_modules path directly if possible
    if (process.env.VITE_DEV_SERVER_URL) {
        if (typeof ffmpegInstaller === 'string' && path.isAbsolute(ffmpegInstaller)) {
            return ffmpegInstaller;
        }
        return path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
    }

    // In production (Electron build), the path might be changed
    // or we might need to point to the app.asar.unpacked directory
    return ffmpegInstaller.replace('app.asar', 'app.asar.unpacked');
};

const finalFfmpegPath = getFfmpegPath();
console.log('[FFMPEG] Path resolved to:', finalFfmpegPath);
if (finalFfmpegPath) {
    ffmpeg.setFfmpegPath(finalFfmpegPath);
} else {
    console.error('[FFMPEG] Failed to resolve ffmpeg path during startup');
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
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
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

ipcMain.handle('generate-preview', async (event, filePath) => {
  const getFrame = (filters: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(`data:image/jpeg;base64,${buffer.toString('base64')}`);
      });
      stream.on('error', reject);

      ffmpeg(filePath)
        .outputOptions([
          '-frames:v', '1',
          '-vf', filters.join(','),
          '-f', 'image2pipe',
          '-vcodec', 'mjpeg'
        ])
        .on('error', (err: Error) => {
          console.error('ffmpeg error:', err);
          reject(err);
        })
        .pipe(stream, { end: true });
    });
  };

  try {
    const [original, padded] = await Promise.all([
      getFrame(['scale=640:-1']), // Smaller original for preview
      getFrame(['scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black', 'scale=640:360']) // Smaller padded preview
    ]);
    return { original, padded };
  } catch (error: any) {
    throw new Error('Failed to generate preview: ' + error.message);
  }
});
