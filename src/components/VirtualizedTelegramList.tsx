import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Telegram } from '../types/telegram';
import './VirtualizedTelegramList.css';

interface VirtualizedTelegramListProps {
  telegrams: Telegram[];
  selectedTelegram: Telegram | null;
  onSelectTelegram: (telegram: Telegram) => void;
}

const ITEM_HEIGHT = 80; // Height of each telegram item in pixels
const BUFFER_SIZE = 5; // Number of items to render outside visible area

export const VirtualizedTelegramList: React.FC<VirtualizedTelegramListProps> = ({
  telegrams,
  selectedTelegram,
  onSelectTelegram,
}) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: 0 };
    
    const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const visibleEnd = Math.min(
      telegrams.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT)
    );
    
    // Add buffer
    const start = Math.max(0, visibleStart - BUFFER_SIZE);
    const end = Math.min(telegrams.length - 1, visibleEnd + BUFFER_SIZE);
    
    return { start, end };
  }, [scrollTop, containerHeight, telegrams.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return telegrams.slice(visibleRange.start, visibleRange.end + 1);
  }, [telegrams, visibleRange]);

  // Update container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // scrollToItem function removed - no auto-scrolling to prevent jumping

  // Removed auto-scroll to prevent jumping during user scrolling
  // Users can manually scroll to find items or use search functionality

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateRawData = (rawData: string, maxLength: number = 20) => {
    return rawData.length > maxLength ? rawData.substring(0, maxLength) + '...' : rawData;
  };

  const totalHeight = telegrams.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  return (
    <div className="virtualized-telegram-list">
      <div className="telegram-list-header">
        <h2>Telegrams ({telegrams.length.toLocaleString()})</h2>
      </div>
      <div 
        ref={containerRef}
        className="telegram-list-container"
        onScroll={handleScroll}
      >
        {/* Spacer div to create the full scrollable height */}
        <div 
          className="telegram-list-spacer"
          style={{ height: totalHeight, position: 'relative' }}
        >
          {/* Container for visible items */}
          <div
            className="telegram-list-visible-items"
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map((telegram, index) => {
              const actualIndex = visibleRange.start + index;
              return (
                <div
                  key={telegram.id}
                  className={`telegram-item ${selectedTelegram?.id === telegram.id ? 'selected' : ''}`}
                  style={{ height: ITEM_HEIGHT }}
                  onClick={() => onSelectTelegram(telegram)}
                >
                  <div className="telegram-item-header">
                    <span className="telegram-timestamp">{formatTimestamp(telegram.timestamp)}</span>
                    <span className="telegram-service">{telegram.service}</span>
                    <span className="telegram-index">#{actualIndex + 1}</span>
                  </div>
                  <div className="telegram-item-body">
                    <span className="telegram-connection">{telegram.connectionName}</span>
                    {telegram.sourceAddress && telegram.destinationAddress && (
                      <span className="telegram-addresses">
                        {telegram.sourceAddress} → {telegram.destinationAddress}
                      </span>
                    )}
                    <span className="telegram-raw-data">{truncateRawData(telegram.rawData)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};