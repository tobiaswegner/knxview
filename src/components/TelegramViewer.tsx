import React, { useState, useEffect } from 'react';
import { Telegram, CommunicationLog } from '../types/telegram';
import { VirtualizedTelegramList } from './VirtualizedTelegramList';
import { TelegramDetail } from './TelegramDetail';
import { InterfaceSelector } from './InterfaceSelector';
import { Toolbar } from './Toolbar';
import { parseTelegramsXML } from '../utils/xmlParser';
import { generateCommunicationLogXML, generateTelegramsXML } from '../utils/xmlGenerator';
import { KNXInterface } from '../types/electron';
import '../types/electron';
import './TelegramViewer.css';

export const TelegramViewer: React.FC = () => {
  const [communicationLog, setCommunicationLog] = useState<CommunicationLog | null>(null);
  const [selectedTelegram, setSelectedTelegram] = useState<Telegram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState<{
    progress: number;
    processed: number;
    total: number;
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Interface selector state
  const [showInterfaceSelector, setShowInterfaceSelector] = useState(false);
  const [knxInterfaces, setKnxInterfaces] = useState<KNXInterface[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [interfaceError, setInterfaceError] = useState<string | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<KNXInterface | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveTelegrams, setLiveTelegrams] = useState<Telegram[]>([]);

  // Set up KNX event listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleKNXTelegram = (telegram: any) => {
      console.log('Frontend received KNX telegram:', telegram);
      
      const newTelegram: Telegram = {
        ...telegram,
        // Ensure we have an ID if not provided
        id: telegram.id || `live-${Date.now()}-${Math.random()}`
      };
      
      console.log('Adding telegram to live telegrams:', newTelegram);
      setLiveTelegrams(prev => {
        const updated = [...prev, newTelegram].slice(-10000); // Keep last 10000 telegrams
        console.log('Live telegrams count:', updated.length);
        return updated;
      });
    };

    const handleKNXConnected = (data: any) => {
      console.log('KNX connection established:', data);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleKNXDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setSelectedInterface(null);
    };

    const handleKNXError = (error: any) => {
      setInterfaceError(error.error);
      setIsConnecting(false);
      setIsConnected(false);
    };

    window.electronAPI.onKNXTelegram(handleKNXTelegram);
    window.electronAPI.onKNXConnected(handleKNXConnected);
    window.electronAPI.onKNXDisconnected(handleKNXDisconnected);
    window.electronAPI.onKNXError(handleKNXError);

    return () => {
      window.electronAPI.removeKNXListeners();
    };
  }, []);

  // Remove auto-loading of sample data

  const handleSelectTelegram = (telegram: Telegram) => {
    setSelectedTelegram(telegram);
  };

  // Filter telegrams based on search - combine file telegrams and live telegrams
  const filteredTelegrams = React.useMemo(() => {
    const allTelegrams = isConnected ? liveTelegrams : (communicationLog?.telegrams || []);
    
    if (!searchFilter.trim()) {
      return allTelegrams;
    }

    const filter = searchFilter.toLowerCase();
    return allTelegrams.filter(telegram => 
      telegram.service.toLowerCase().includes(filter) ||
      telegram.connectionName.toLowerCase().includes(filter) ||
      telegram.rawData.toLowerCase().includes(filter) ||
      telegram.timestamp.includes(filter) ||
      (telegram.payloadType && telegram.payloadType.toLowerCase().includes(filter)) ||
      (telegram.sourceAddress && telegram.sourceAddress.toLowerCase().includes(filter)) ||
      (telegram.destinationAddress && telegram.destinationAddress.toLowerCase().includes(filter)) ||
      (telegram.payload && telegram.payload.toLowerCase().includes(filter))
    );
  }, [communicationLog, liveTelegrams, searchFilter, isConnected]);

  const hasTelegrams = React.useMemo(() => {
    const allTelegrams = isConnected ? liveTelegrams : (communicationLog?.telegrams || []);
    return allTelegrams.length > 0;
  }, [communicationLog?.telegrams, liveTelegrams, isConnected]);

  const handleRefresh = () => {
    if (currentFile) {
      // If we have a loaded file, reload it
      loadFromFile();
    } else {
      // No file loaded, prompt to open one
      handleOpenFile();
    }
  };

  const loadFromXMLContent = async (xmlContent: string, filePath?: string) => {
    try {
      setLoading(true);
      setError(null);
      setParseProgress(null);
      
      const data = await parseTelegramsXML(xmlContent, (progress, processed, total) => {
        setParseProgress({ progress, processed, total });
      });
      
      setCommunicationLog(data);
      setCurrentFile(filePath || null);
      
      // Auto-select the first telegram if available
      if (data.telegrams.length > 0) {
        setSelectedTelegram(data.telegrams[0]);
      } else {
        setSelectedTelegram(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse XML');
      console.error('Error parsing XML:', err);
    } finally {
      setLoading(false);
      setParseProgress(null);
    }
  };

  const handleOpenFile = async () => {
    if (!window.electronAPI) {
      setError('File dialog not available. This feature requires the Electron environment.');
      return;
    }

    try {
      const result = await window.electronAPI.openFile();
      
      if (result.success && result.content) {
        await loadFromXMLContent(result.content, result.filePath);
      } else {
        if (result.error && result.error !== 'No file selected') {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file');
      console.error('Error opening file:', err);
    }
  };

  const loadFromFile = async () => {
    // This would re-read the current file if we stored the path
    // For now, just prompt to open a new file
    handleOpenFile();
  };

  const handleClearData = () => {
    setCommunicationLog(null);
    setLiveTelegrams([]);
    setSelectedTelegram(null);
    setCurrentFile(null);
    setSearchFilter('');
    setError(null);
  };

  const handleSaveFile = async () => {
    if (!window.electronAPI) {
      setError('File dialog not available. This feature requires the Electron environment.');
      return;
    }

    try {
      const allTelegrams = isConnected ? liveTelegrams : (communicationLog?.telegrams || []);
      if (allTelegrams.length === 0) {
        setError('No telegrams to save');
        return;
      }

      let xmlContent: string;
      
      if (communicationLog && communicationLog.telegrams.length > 0 && !isConnected) {
        // Save file-loaded telegrams with original record start info
        xmlContent = generateCommunicationLogXML(communicationLog);
      } else {
        // Save live telegrams with generated record start, pass interface info for proper ConnectorType
        xmlContent = generateTelegramsXML(allTelegrams, undefined, selectedInterface);
      }

      const result = await window.electronAPI.saveFile(xmlContent);
      
      if (result.success) {
        setError(null);
        // Could add a success message here if desired
        console.log('File saved successfully to:', result.filePath);
      } else {
        if (result.error && result.error !== 'Save cancelled') {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      console.error('Error saving file:', err);
    }
  };

  const handleOpenInterfaceSelector = () => {
    setShowInterfaceSelector(true);
    setInterfaceError(null);
  };

  const handleDiscoverInterfaces = async () => {
    if (!window.electronAPI) {
      setInterfaceError('KNX discovery not available. This feature requires the Electron environment.');
      return;
    }

    setIsDiscovering(true);
    setInterfaceError(null);
    
    try {
      const result = await window.electronAPI.discoverKNXInterfaces();
      
      if (result.success && result.interfaces) {
        setKnxInterfaces(result.interfaces);
        if (result.interfaces.length === 0) {
          setInterfaceError('No KNX interfaces found on the network. Make sure your KNX interface is connected and accessible.');
        }
      } else {
        setInterfaceError(result.error || 'Failed to discover KNX interfaces');
        setKnxInterfaces([]);
      }
    } catch (err) {
      setInterfaceError(err instanceof Error ? err.message : 'Failed to discover KNX interfaces');
      setKnxInterfaces([]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSelectInterface = async (knxInterface: KNXInterface) => {
    if (!window.electronAPI) {
      setInterfaceError('KNX connection not available. This feature requires the Electron environment.');
      return;
    }

    setIsConnecting(true);
    setInterfaceError(null);
    
    try {
      const result = await window.electronAPI.connectKNXInterface(knxInterface);
      
      if (result.success) {
        setSelectedInterface(knxInterface);
        // Clear existing data when connecting to live interface
        setCommunicationLog(null);
        setSelectedTelegram(null);
        setLiveTelegrams([]);
        setCurrentFile(null);
        setError(null);
      } else {
        setInterfaceError(result.error || 'Failed to connect to KNX interface');
        setIsConnecting(false);
      }
    } catch (err) {
      setInterfaceError(err instanceof Error ? err.message : 'Failed to connect to KNX interface');
      setIsConnecting(false);
    }
  };

  const handleDisconnectInterface = async () => {
    if (!window.electronAPI || !isConnected) return;
    
    try {
      const result = await window.electronAPI.disconnectKNXInterface();
      if (result.success) {
        setIsConnected(false);
        setSelectedInterface(null);
        setLiveTelegrams([]);
      } else {
        setInterfaceError(result.error || 'Failed to disconnect from KNX interface');
      }
    } catch (err) {
      setInterfaceError(err instanceof Error ? err.message : 'Failed to disconnect from KNX interface');
    }
  };

  const handleCloseInterfaceSelector = () => {
    setShowInterfaceSelector(false);
    setInterfaceError(null);
  };

  if (loading) {
    return (
      <div className="telegram-viewer">
        <div className="telegram-viewer-loading">
          <h2>Loading telegrams...</h2>
          {parseProgress ? (
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${parseProgress.progress}%` }}
                />
              </div>
              <div className="progress-text">
                Processing {parseProgress.processed.toLocaleString()} of {parseProgress.total.toLocaleString()} telegrams 
                ({parseProgress.progress.toFixed(1)}%)
              </div>
            </div>
          ) : (
            <div className="loading-spinner"></div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="telegram-viewer">
        <div className="telegram-viewer-error">
          <h2>Error Loading Telegrams</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!communicationLog && !isConnected) {
    return (
      <div className="telegram-viewer">
        <div className="telegram-viewer-header">
          <div className="header-info">
            <h1>Telegram Viewer</h1>
          </div>
        </div>
        <Toolbar
          isConnected={isConnected}
          isConnecting={isConnecting}
          onOpenFile={handleOpenFile}
          onSaveFile={handleSaveFile}
          onSelectInterface={handleOpenInterfaceSelector}
          onDisconnect={handleDisconnectInterface}
          onRefresh={handleRefresh}
          onClear={handleClearData}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
          hasTelegrams={hasTelegrams}
        />
        <div className="telegram-viewer-empty">
          <h2>No Telegram File Loaded</h2>
          <p>Click "Open File" to load an XML telegram file and start viewing communications.</p>
          <button onClick={handleOpenFile} className="open-file-button large">
            Open XML File
          </button>
        </div>
        
        <InterfaceSelector
          isOpen={showInterfaceSelector}
          interfaces={knxInterfaces}
          isDiscovering={isDiscovering}
          error={interfaceError || undefined}
          onClose={handleCloseInterfaceSelector}
          onSelect={handleSelectInterface}
          onDiscover={handleDiscoverInterfaces}
        />
      </div>
    );
  }

  return (
    <div className="telegram-viewer">
      <div className="telegram-viewer-header">
        <div className="header-info">
          <h1>Telegram Viewer</h1>
          <div className="file-info">
            {currentFile && (
              <span className="current-file">File: {currentFile.split(/[/\\]/).pop()}</span>
            )}
          </div>
          <div className="connection-info">
            {isConnected && selectedInterface ? (
              <>
                <span className="connection-name">Live KNX Connection</span>
                <span className="connection-mode">Busmonitor</span>
                <span className="connection-status connected">● Connected</span>
                <span className="knx-interface">KNX: {selectedInterface.ip}:{selectedInterface.port}</span>
              </>
            ) : communicationLog ? (
              <>
                <span className="connection-name">{communicationLog.recordStart.connectionName}</span>
                <span className="connection-mode">{communicationLog.recordStart.mode}</span>
                <span className="connection-host">{communicationLog.recordStart.host}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <Toolbar
        isConnected={isConnected}
        isConnecting={isConnecting}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onSelectInterface={handleOpenInterfaceSelector}
        onDisconnect={handleDisconnectInterface}
        onRefresh={handleRefresh}
        onClear={handleClearData}
        searchFilter={searchFilter}
        onSearchChange={setSearchFilter}
        hasTelegrams={hasTelegrams}
      />
      <div className="telegram-viewer-content">
        <VirtualizedTelegramList
          telegrams={filteredTelegrams}
          selectedTelegram={selectedTelegram}
          onSelectTelegram={handleSelectTelegram}
        />
        <TelegramDetail telegram={selectedTelegram} />
      </div>
      
      <InterfaceSelector
        isOpen={showInterfaceSelector}
        interfaces={knxInterfaces}
        isDiscovering={isDiscovering}
        error={interfaceError || undefined}
        onClose={handleCloseInterfaceSelector}
        onSelect={handleSelectInterface}
        onDiscover={handleDiscoverInterfaces}
      />
    </div>
  );
};