export interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

export interface ElectronAPI {
  openFile: () => Promise<FileResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}