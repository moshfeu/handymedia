export interface IElectronAPI {
  selectFile: () => Promise<string | undefined>;
  selectFolder: () => Promise<string | undefined>;
  startConversion: (data: { filePath: string; targetFolder: string }) => Promise<string>;
  onProgress: (callback: (percent: number) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
