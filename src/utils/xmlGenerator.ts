import { Telegram, CommunicationLog } from '../types/telegram';

export const generateTelegramsXML = (telegrams: Telegram[], recordStart?: any, interfaceInfo?: any): string => {
  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const formatTimestamp = (timestamp: string): string => {
    // If timestamp is already in ISO format, use it as is
    if (timestamp.includes('T')) {
      return timestamp;
    }
    // Otherwise, try to parse and format it
    try {
      const date = new Date(timestamp);
      return date.toISOString();
    } catch {
      return timestamp;
    }
  };

  // Build XML content
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<CommunicationLog xmlns="http://knx.org/xml/telegrams/01">\n';
  
  // Add Connection element
  const now = new Date().toISOString();
  xml += `  <Connection Timestamp="${now}" State="Established" />\n`;
  
  // Add RecordStart element
  if (recordStart) {
    xml += `  <RecordStart`;
    if (recordStart.timestamp) xml += ` Timestamp="${escapeXml(formatTimestamp(recordStart.timestamp))}"`;
    if (recordStart.mode) xml += ` Mode="${escapeXml(recordStart.mode)}"`;
    if (recordStart.host) xml += ` Host="${escapeXml(recordStart.host)}"`;
    if (recordStart.connectionName) xml += ` ConnectionName="${escapeXml(recordStart.connectionName)}"`;
    if (recordStart.connectionOptions) xml += ` ConnectionOptions="${escapeXml(recordStart.connectionOptions)}"`;
    if (recordStart.connectorType) xml += ` ConnectorType="${escapeXml(recordStart.connectorType)}"`;
    if (recordStart.mediumType) xml += ` MediumType="${escapeXml(recordStart.mediumType)}"`;
    xml += ' />\n';
  } else {
    // Default RecordStart for export - determine connector type from interface info
    let connectorType = "KnxIpTunneling"; // default
    
    if (interfaceInfo?.type) {
      switch (interfaceInfo.type.toLowerCase()) {
        case 'usb':
          connectorType = "USB";
          break;
        case 'routing':
          connectorType = "KnxIpRouting";
          break;
        case 'tunneling':
        default:
          connectorType = "KnxIpTunneling";
          break;
      }
    }
    
    const connectionName = interfaceInfo?.name || interfaceInfo?.description || "KNX Viewer Export";
    const host = interfaceInfo?.address || "KNX Viewer";
    
    xml += `  <RecordStart Timestamp="${now}" Mode="Busmonitor" Host="${escapeXml(host)}" ConnectionName="${escapeXml(connectionName)}" ConnectorType="${connectorType}" MediumType="Tp" />\n`;
  }
  
  // Sort telegrams by timestamp (oldest first) and add telegram elements
  const sortedTelegrams = [...telegrams].sort((a, b) => {
    const timestampA = new Date(a.timestamp || 0).getTime();
    const timestampB = new Date(b.timestamp || 0).getTime();
    return timestampA - timestampB;
  });
  
  sortedTelegrams.forEach(telegram => {
    xml += `  <Telegram`;
    if (telegram.timestamp) xml += ` Timestamp="${escapeXml(formatTimestamp(telegram.timestamp))}"`;
    // Use L_Busmon.ind for busmonitor telegrams, or keep original service
    const service = telegram.service === 'L_Data.ind' ? 'L_Busmon.ind' : (telegram.service || 'L_Busmon.ind');
    xml += ` Service="${escapeXml(service)}"`;
    if (telegram.frameFormat) xml += ` FrameFormat="${escapeXml(telegram.frameFormat)}"`;
    if (telegram.rawData) xml += ` RawData="${escapeXml(telegram.rawData)}"`;
    xml += ' />\n';
  });
  
  // Add RecordStop element
  xml += `  <RecordStop Timestamp="${now}" />\n`;
  xml += '</CommunicationLog>\n';
  
  return xml;
};

export const generateCommunicationLogXML = (communicationLog: CommunicationLog): string => {
  return generateTelegramsXML(communicationLog.telegrams, communicationLog.recordStart);
};