import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { discoverInterfaces, createInterface } from 'knxnetjs';

// Import the parsing function
import { parseCommonEmi } from './src/utils/commonEmiParser';

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Global tunnel connection state
let activeTunnel: any = null;
let mainWindow: any = null;

// IPC handlers for file operations
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'XML Files', extensions: ['xml'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return {
        success: true,
        filePath,
        content: fileContent
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  return {
    success: false,
    error: 'No file selected'
  };
});

// IPC handler for KNX interface discovery
ipcMain.handle('knx:discoverInterfaces', async () => {
  try {
    const discoveredInterfaces: any[] = [];
    
    // Use the new discoverInterfaces API with callback
    await discoverInterfaces(
      (interfaceInfo: any) => {
        // Callback called for each discovered interface
        discoveredInterfaces.push({
          address: interfaceInfo.address,
          port: interfaceInfo.port || 3671,
          type: interfaceInfo.type,
          name: interfaceInfo.name,
          macAddress: interfaceInfo.macAddress,
          multicastAddress: interfaceInfo.multicastAddress,
          serialNumber: interfaceInfo.serialNumber,
          description: interfaceInfo.friendlyName || interfaceInfo.description || `KNX Interface at ${interfaceInfo.address}`,
          // Keep ip for backward compatibility with frontend
          ip: interfaceInfo.address
        });
      },
      { timeout: 5000 }
    );

    return {
      success: true,
      interfaces: discoveredInterfaces
    };
  } catch (error) {
    return {
      success: false,
      error: `KNX discovery error: ${error instanceof Error ? error.message : error}`
    };
  }
});

// IPC handler for connecting to KNX interface in busmonitor mode
ipcMain.handle('knx:connectInterface', async (_event: any, interfaceConfig: any) => {
  try {
    // Disconnect existing tunnel if any
    if (activeTunnel) {
      try {
        await activeTunnel.close();
      } catch (error) {
        console.error('Error closing existing connection:', error);
      }
      activeTunnel = null;
    }

    // Create interface connection in busmonitor mode using discovered interface info
    const knxInterface = createInterface(interfaceConfig, true); // true for busmonitor mode

    // Set up telegram monitoring
    knxInterface.on('recv', (frame: any) => {
      console.log('Received KNX frame:', frame);
      
      if (mainWindow && mainWindow.webContents) {
        // Get raw data from frame
        const rawData = frame.raw ? frame.raw.toString('hex') : (frame.toString ? frame.toString('hex') : JSON.stringify(frame));
        
        // Create base telegram
        const baseTelegram = {
          timestamp: new Date().toISOString(),
          service: 'L_Data.ind',
          connectionName: `KNX Interface ${interfaceConfig.ip}`,
          frameFormat: 'CommonEmi',
          rawData: rawData,
          id: `live-${Date.now()}-${Math.random()}`,
          isExtendedFormat: false
        };
        
        // Parse the telegram using CommonEmi parser
        const parsedData = parseCommonEmi(rawData);
        
        // Combine base telegram with parsed data
        const telegram = {
          ...baseTelegram,
          ...parsedData
        };
        
        console.log('Sending parsed telegram to frontend:', telegram);
        mainWindow.webContents.send('knx:telegram', telegram);
      }
    });

    knxInterface.on('error', (error: any) => {
      console.error('KNX busmonitor error:', error);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('knx:error', {
          error: `Busmonitor error: ${error.message || error}`
        });
      }
    });

    // Connect to the interface
    await knxInterface.open();
    
    console.log('KNX busmonitor connected');
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('knx:connected', {
        interface: interfaceConfig
      });
    }
    
    activeTunnel = knxInterface;

    return {
      success: true,
      message: `Connected to KNX interface at ${interfaceConfig.ip}:${interfaceConfig.port}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to connect to KNX interface: ${error instanceof Error ? error.message : error}`
    };
  }
});

// IPC handler for disconnecting from KNX interface
ipcMain.handle('knx:disconnectInterface', async () => {
  try {
    if (activeTunnel) {
      await activeTunnel.close();
      activeTunnel = null;
      return {
        success: true,
        message: 'Disconnected from KNX interface'
      };
    } else {
      return {
        success: false,
        error: 'No active KNX connection to disconnect'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to disconnect from KNX interface: ${error instanceof Error ? error.message : error}`
    };
  }
});

// Clean up on app quit
app.on('before-quit', async () => {
  if (activeTunnel) {
    try {
      await activeTunnel.close();
    } catch (error) {
      console.error('Error closing KNX connection:', error);
    }
    activeTunnel = null;
  }
});