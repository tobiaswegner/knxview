export interface Telegram {
  timestamp: string;
  connectionName: string;
  service: string;
  frameFormat: string;
  rawData: string;
  id: string;
  sourceAddress?: string;
  destinationAddress?: string;
  payloadType?: string;
  payload?: string;
  isExtendedFormat?: boolean;
  controlByte1?: string;
  controlByte2?: string;
  transportLayerControl?: string;
  apci?: string;
  parseError?: string;
}

export interface CommunicationLog {
  recordStart: {
    timestamp: string;
    connectionName: string;
    mode: string;
    host: string;
    connectionOptions: string;
    connectorType: string;
    mediumType: string;
  };
  telegrams: Telegram[];
}