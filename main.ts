import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { discoverInterfaces, createInterface, CEMIFrame, CEMIMessageCode } from 'knxnetjs';

// Import the parsing function
import { parseCommonEmi } from './src/utils/commonEmiParser';

const createWindow = (): void => {
  // Try to find the icon in multiple possible locations
  let iconPath = path.join(__dirname, 'app-icon-transparent.png');
  
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, 'app-icon-256.png');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, 'app-icon.png');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, 'app-icon.ico');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '..', 'public', 'app-icon.png');
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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

// IPC handler for saving file
ipcMain.handle('dialog:saveFile', async (_event: any, content: string) => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'XML Files', extensions: ['xml'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: `knx-telegrams-${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_')}.xml`
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf-8');
      return {
        success: true,
        filePath: result.filePath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  return {
    success: false,
    error: 'Save cancelled'
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

// IPC handler for connecting to KNX interface with configurable busmonitor mode
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

    // Create interface connection using discovered interface info
    // Use busmonitor mode based on configuration (defaults to true for backward compatibility)
    const busmonitorMode = interfaceConfig.busmonitorMode !== undefined ? interfaceConfig.busmonitorMode : true;
    currentBusmonitorMode = busmonitorMode;
    const knxInterface = createInterface(interfaceConfig, busmonitorMode);

    // Set up telegram monitoring
    knxInterface.on('recv', (frame: any) => {
      console.log('Received KNX frame:', frame);
      
      if (mainWindow && mainWindow.webContents) {
        // Get raw data from frame
        const rawData = frame.raw ? frame.raw.toString('hex') : (frame.toString ? frame.toString('hex') : JSON.stringify(frame));
        
        // Create base telegram
        const baseTelegram = {
          timestamp: new Date().toISOString(),
          service: busmonitorMode ? 'L_Busmon.ind' : 'L_Data.ind',
          connectionName: `KNX Interface ${interfaceConfig.ip}${busmonitorMode ? ' (Bus Monitor)' : ''}`,
          frameFormat: 'CommonEmi',
          rawData: rawData,
          id: `live-${Date.now()}-${Math.random()}`,
          isExtendedFormat: false
        };
        
        // Parse the telegram using CommonEmi parser (default to Tp medium for KNXnet/IP)
        const parsedData = parseCommonEmi(rawData, 'Tp', baseTelegram.service);
        
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

// Track busmonitor mode for send validation
let currentBusmonitorMode = true;

// IPC handler for sending KNX telegrams
ipcMain.handle('knx:sendTelegram', async (_event: any, request: any) => {
  try {
    if (!activeTunnel) {
      return { success: false, error: 'No active KNX connection' };
    }
    if (currentBusmonitorMode) {
      return { success: false, error: 'Cannot send telegrams in busmonitor mode' };
    }

    const { groupAddress, dpt, value } = request;

    // Parse group address "M/m/S" → 16-bit integer
    const parts = groupAddress.split('/');
    if (parts.length !== 3) {
      return { success: false, error: 'Invalid group address format. Use M/m/S (e.g. 1/2/3)' };
    }
    const main = parseInt(parts[0], 10);
    const middle = parseInt(parts[1], 10);
    const sub = parseInt(parts[2], 10);
    if (isNaN(main) || isNaN(middle) || isNaN(sub) ||
        main < 0 || main > 31 || middle < 0 || middle > 7 || sub < 0 || sub > 255) {
      return { success: false, error: 'Group address out of range' };
    }
    const destAddr = (main << 11) | (middle << 8) | sub;

    // Encode value based on DPT, then wrap with APCI GroupValue_Write (0x0080)
    // Short data (≤6 bits, e.g. DPT1): value packed into lower 6 bits of APCI byte
    //   APDU = [0x00, 0x80 | (value & 0x3F)]
    // Long data (>6 bits, e.g. DPT5, DPT9): data follows after 2-byte APCI header
    //   APDU = [0x00, 0x80, ...data_bytes]
    let data: Buffer;
    switch (dpt) {
      case 'READ': // GroupValue_Read — APCI 0x0000, no payload
        data = Buffer.from([0x00, 0x00]);
        break;
      case 'DPT1': // Switch (boolean) — short APDU, value in APCI byte
        data = Buffer.from([0x00, 0x80 | (value ? 0x01 : 0x00)]);
        break;
      case 'DPT5': // 8-bit unsigned (0-255) — long APDU
        data = Buffer.from([0x00, 0x80, Math.round(Number(value)) & 0xFF]);
        break;
      case 'DPT9': { // 2-byte KNX float — long APDU
        let mantissa = Math.round(Number(value) * 100);
        let exponent = 0;
        const sign = mantissa < 0 ? 1 : 0;
        if (sign) mantissa = -mantissa;
        while (mantissa > 2047 && exponent < 15) {
          mantissa = Math.round(mantissa / 2);
          exponent++;
        }
        if (sign) mantissa = -mantissa;
        // Encode: MEEEEMMM MMMMMMMM (sign in bit 15, exponent bits 14-11, mantissa bits 10-0)
        const encoded = ((sign << 15) | (exponent << 11) | (mantissa & 0x07FF)) & 0xFFFF;
        data = Buffer.from([0x00, 0x80, (encoded >> 8) & 0xFF, encoded & 0xFF]);
        break;
      }
      case 'RAW': { // Raw hex payload — wrapped with APCI GroupValue_Write
        const hexStr = String(value).replace(/\s/g, '');
        if (!/^[0-9a-fA-F]*$/.test(hexStr) || hexStr.length === 0 || hexStr.length % 2 !== 0) {
          return { success: false, error: 'Invalid hex string. Provide even number of hex characters (e.g. 0A1B2C)' };
        }
        const rawPayload = Buffer.from(hexStr, 'hex');
        data = Buffer.concat([Buffer.from([0x00, 0x80]), rawPayload]);
        break;
      }
      default:
        return { success: false, error: `Unsupported DPT: ${dpt}` };
    }

    const frame = CEMIFrame.create(CEMIMessageCode.L_DATA_REQ, 0x0000, destAddr, data);
    // Set group address flag (bit 7) in CTRL2 byte.
    // CEMIFrame.create() defaults to physical address; for group telegrams
    // we must set CTRL2 bit 7. CTRL2 is at buffer offset 3
    // (messageCode[0] + addInfoLen[0]=0 + CTRL1[1] + CTRL2[1]).
    const buf = frame.rawBuffer;
    const ctrl2Offset = 2 + buf[1] + 1; // skip messageCode, addInfoLen, additional info bytes, CTRL1
    buf[ctrl2Offset] = buf[ctrl2Offset] | 0x80;
    await activeTunnel.send(frame);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to send telegram: ${error instanceof Error ? error.message : error}`
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