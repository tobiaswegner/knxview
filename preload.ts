const { contextBridge, ipcRenderer } = require('electron');

interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<FileResult> => ipcRenderer.invoke('dialog:openFile')
});