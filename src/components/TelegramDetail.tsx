import React from 'react';
import { Telegram } from '../types/telegram';
import './TelegramDetail.css';

interface TelegramDetailProps {
  telegram: Telegram | null;
}

export const TelegramDetail: React.FC<TelegramDetailProps> = ({ telegram }) => {
  if (!telegram) {
    return (
      <div className="telegram-detail">
        <div className="telegram-detail-empty">
          <h3>No telegram selected</h3>
          <p>Select a telegram from the list to view its details.</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      iso: timestamp
    };
  };

  const formatRawData = (rawData: string) => {
    // Format as hex pairs for better readability
    return rawData.match(/.{1,2}/g)?.join(' ') || rawData;
  };

  const { date, time, iso } = formatTimestamp(telegram.timestamp);

  return (
    <div className="telegram-detail">
      <div className="telegram-detail-header">
        <h2>Telegram Details</h2>
      </div>
      <div className="telegram-detail-content">
        <div className="detail-section">
          <h3>Timestamp</h3>
          <div className="detail-group">
            <div className="detail-item">
              <label>Date:</label>
              <span>{date}</span>
            </div>
            <div className="detail-item">
              <label>Time:</label>
              <span>{time}</span>
            </div>
            <div className="detail-item">
              <label>ISO:</label>
              <span className="monospace">{iso}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Connection Information</h3>
          <div className="detail-group">
            <div className="detail-item">
              <label>Connection Name:</label>
              <span>{telegram.connectionName}</span>
            </div>
            <div className="detail-item">
              <label>Service:</label>
              <span className="service-badge">{telegram.service}</span>
            </div>
            <div className="detail-item">
              <label>Frame Format:</label>
              <span>{telegram.frameFormat}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Raw Data</h3>
          <div className="raw-data-container">
            <div className="raw-data-header">
              <span>Length: {telegram.rawData.length / 2} bytes</span>
            </div>
            <div className="raw-data-content">
              <div className="raw-data-formatted monospace">
                {formatRawData(telegram.rawData)}
              </div>
              <div className="raw-data-original monospace">
                <label>Original:</label>
                <span>{telegram.rawData}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Identification</h3>
          <div className="detail-group">
            <div className="detail-item">
              <label>ID:</label>
              <span className="monospace">{telegram.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};