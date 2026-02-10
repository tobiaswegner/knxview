import { Telegram, CommunicationLog } from '../types/telegram';
import { parseFrameFormat } from './commonEmiParser';

export const parseTelegramsXML = async (
  xmlContent: string, 
  onProgress?: (progress: number, processed: number, total: number) => void
): Promise<CommunicationLog> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

  // Parse RecordStart information
  const recordStartElement = xmlDoc.querySelector('RecordStart');
  const recordStart = {
    timestamp: recordStartElement?.getAttribute('Timestamp') || '',
    connectionName: recordStartElement?.getAttribute('ConnectionName') || '',
    mode: recordStartElement?.getAttribute('Mode') || '',
    host: recordStartElement?.getAttribute('Host') || '',
    connectionOptions: recordStartElement?.getAttribute('ConnectionOptions') || '',
    connectorType: recordStartElement?.getAttribute('ConnectorType') || '',
    mediumType: recordStartElement?.getAttribute('MediumType') || '',
  };

  // Parse telegrams with chunked processing for better performance
  const telegramElements = xmlDoc.querySelectorAll('Telegram');
  const totalElements = telegramElements.length;
  const telegrams: Telegram[] = [];
  
  // Process in chunks to avoid blocking the UI
  const CHUNK_SIZE = 1000;
  
  for (let i = 0; i < totalElements; i += CHUNK_SIZE) {
    const chunkEnd = Math.min(i + CHUNK_SIZE, totalElements);
    
    // Process chunk
    const chunkElements = Array.from(telegramElements).slice(i, chunkEnd);
    const chunkTelegrams = chunkElements.map((element, chunkIndex) => {
      const baseTelegram: Telegram = {
        id: `telegram-${i + chunkIndex + 1}`,
        timestamp: element.getAttribute('Timestamp') || '',
        connectionName: element.getAttribute('ConnectionName') || '',
        service: element.getAttribute('Service') || '',
        frameFormat: element.getAttribute('FrameFormat') || '',
        rawData: element.getAttribute('RawData') || '',
      };
      
      // Parse frame format (CommonEmi, etc.), passing mediumType for correct CTRL2 handling
      return parseFrameFormat(baseTelegram, recordStart.mediumType);
    });
    
    telegrams.push(...chunkTelegrams);
    
    // Report progress
    if (onProgress) {
      const progress = (chunkEnd / totalElements) * 100;
      onProgress(progress, chunkEnd, totalElements);
    }
    
    // Yield control to prevent blocking
    if (i + CHUNK_SIZE < totalElements) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return {
    recordStart,
    telegrams,
  };
};

export const loadTelegramsFromFile = async (filePath: string): Promise<CommunicationLog> => {
  try {
    const response = await fetch(filePath);
    const xmlContent = await response.text();
    return parseTelegramsXML(xmlContent);
  } catch (error) {
    console.error('Error loading telegrams:', error);
    throw error;
  }
};