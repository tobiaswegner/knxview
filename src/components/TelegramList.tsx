import React from 'react';
import { Telegram } from '../types/telegram';
import './TelegramList.css';

interface TelegramListProps {
  telegrams: Telegram[];
  selectedTelegram: Telegram | null;
  onSelectTelegram: (telegram: Telegram) => void;
}

export const TelegramList: React.FC<TelegramListProps> = ({
  telegrams,
  selectedTelegram,
  onSelectTelegram,
}) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateRawData = (rawData: string, maxLength: number = 20) => {
    return rawData.length > maxLength ? rawData.substring(0, maxLength) + '...' : rawData;
  };

  return (
    <div className="telegram-list">
      <div className="telegram-list-header">
        <h2>Telegrams ({telegrams.length})</h2>
      </div>
      <div className="telegram-list-content">
        {telegrams.map((telegram) => (
          <div
            key={telegram.id}
            className={`telegram-item ${selectedTelegram?.id === telegram.id ? 'selected' : ''}`}
            onClick={() => onSelectTelegram(telegram)}
          >
            <div className="telegram-item-header">
              <span className="telegram-timestamp">{formatTimestamp(telegram.timestamp)}</span>
              <span className="telegram-service">{telegram.service}</span>
            </div>
            <div className="telegram-item-body">
              <span className="telegram-connection">{telegram.connectionName}</span>
              <span className="telegram-raw-data">{truncateRawData(telegram.rawData)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};