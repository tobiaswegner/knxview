export interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

export interface KNXInterface {
  ip: string;
  port: number;
  name?: string;
  mac?: string;
  multicastAddress?: string;
  serialNumber?: string;
  description?: string;
}

export interface KNXDiscoveryResult {
  success: boolean;
  interfaces?: KNXInterface[];
  error?: string;
}

export interface KNXConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ElectronAPI {
  openFile: () => Promise<FileResult>;
  saveFile: (content: string) => Promise<FileResult>;
  discoverKNXInterfaces: () => Promise<KNXDiscoveryResult>;
  connectKNXInterface: (interfaceConfig: KNXInterface) => Promise<KNXConnectionResult>;
  disconnectKNXInterface: () => Promise<KNXConnectionResult>;
  onKNXTelegram: (callback: (telegram: any) => void) => void;
  onKNXConnected: (callback: (data: any) => void) => void;
  onKNXDisconnected: (callback: () => void) => void;
  onKNXError: (callback: (error: any) => void) => void;
  removeKNXListeners: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}