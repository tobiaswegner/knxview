const { contextBridge, ipcRenderer } = require('electron');

interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

interface KNXInterface {
  ip: string;
  port: number;
  name?: string;
  mac?: string;
  multicastAddress?: string;
  serialNumber?: string;
  description?: string;
}

interface KNXDiscoveryResult {
  success: boolean;
  interfaces?: KNXInterface[];
  error?: string;
}

interface KNXConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (): Promise<FileResult> => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string): Promise<FileResult> => ipcRenderer.invoke('dialog:saveFile', content),
  discoverKNXInterfaces: (): Promise<KNXDiscoveryResult> => ipcRenderer.invoke('knx:discoverInterfaces'),
  connectKNXInterface: (interfaceConfig: KNXInterface): Promise<KNXConnectionResult> => 
    ipcRenderer.invoke('knx:connectInterface', interfaceConfig),
  disconnectKNXInterface: (): Promise<KNXConnectionResult> => 
    ipcRenderer.invoke('knx:disconnectInterface'),
  
  sendKNXTelegram: (request: any): Promise<any> =>
    ipcRenderer.invoke('knx:sendTelegram', request),

  // Event listeners for KNX events
  onKNXTelegram: (callback: (telegram: any) => void) => {
    ipcRenderer.on('knx:telegram', (_event: any, telegram: any) => callback(telegram));
  },
  onKNXConnected: (callback: (data: any) => void) => {
    ipcRenderer.on('knx:connected', (_event: any, data: any) => callback(data));
  },
  onKNXDisconnected: (callback: () => void) => {
    ipcRenderer.on('knx:disconnected', () => callback());
  },
  onKNXError: (callback: (error: any) => void) => {
    ipcRenderer.on('knx:error', (_event: any, error: any) => callback(error));
  },
  
  // Remove event listeners
  removeKNXListeners: () => {
    ipcRenderer.removeAllListeners('knx:telegram');
    ipcRenderer.removeAllListeners('knx:connected');
    ipcRenderer.removeAllListeners('knx:disconnected');
    ipcRenderer.removeAllListeners('knx:error');
  }
});