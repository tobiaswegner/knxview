export interface Telegram {
  timestamp: string;
  connectionName: string;
  service: string;
  frameFormat: string;
  rawData: string;
  id: string;
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