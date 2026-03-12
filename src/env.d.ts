/// <reference types="vite/client" />

declare interface Window {
  electronAPI: {
    selectFile: () => Promise<string | undefined>;
    selectFolder: () => Promise<string | undefined>;
    startConversion: (data: { filePath: string; targetFolder: string }) => Promise<string>;
    onProgress: (callback: (percent: number) => void) => () => void;
  };
}
