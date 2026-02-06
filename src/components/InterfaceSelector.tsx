import React, { useState, useEffect } from 'react';
import { KNXInterface } from '../types/electron';
import './InterfaceSelector.css';
import { LoadingIcon, WarningIcon } from './Icons';

interface InterfaceSelectorProps {
  isOpen: boolean;
  interfaces: KNXInterface[];
  isDiscovering: boolean;
  error?: string;
  onClose: () => void;
  onSelect: (knxInterface: KNXInterface, busmonitorMode?: boolean) => void;
  onDiscover: () => void;
}

export const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({
  isOpen,
  interfaces,
  isDiscovering,
  error,
  onClose,
  onSelect,
  onDiscover
}) => {
  const [selectedInterface, setSelectedInterface] = useState<KNXInterface | null>(null);
  const [busmonitorMode, setBusmonitorMode] = useState<boolean>(true);

  // Auto-discover interfaces when dialog opens
  useEffect(() => {
    if (isOpen && interfaces.length === 0 && !isDiscovering) {
      onDiscover();
    }
  }, [isOpen, interfaces.length, isDiscovering, onDiscover]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedInterface) {
      onSelect(selectedInterface, busmonitorMode);
      onClose();
    }
  };

  return (
    <div className="interface-selector-overlay">
      <div className="interface-selector-dialog">
        <div className="interface-selector-header">
          <h2>Select KNX Interface</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="interface-selector-content">
          {error && (
            <div className="error-message">
              <WarningIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="interfaces-list">
            {interfaces.length === 0 && !isDiscovering && (
              <div className="no-interfaces">
                No KNX interfaces found. Click "Refresh Interfaces" to search again.
              </div>
            )}

            {isDiscovering && (
              <div className="discovering-message">
                <LoadingIcon size={16} />
                <span>Discovering interfaces...</span>
              </div>
            )}
            
            {interfaces.map((knxInterface, index) => (
              <div 
                key={`${knxInterface.ip}-${index}`}
                className={`interface-item ${selectedInterface === knxInterface ? 'selected' : ''}`}
                onClick={() => setSelectedInterface(knxInterface)}
              >
                <div className="interface-main">
                  <div className="interface-name">
                    {knxInterface.name || `Interface ${index + 1}`}
                  </div>
                  <div className="interface-ip">
                    {knxInterface.ip}:{knxInterface.port}
                  </div>
                </div>
                
                {(knxInterface.description || knxInterface.mac || knxInterface.serialNumber) && (
                  <div className="interface-details">
                    {knxInterface.description && (
                      <div className="interface-description">{knxInterface.description}</div>
                    )}
                    {knxInterface.mac && (
                      <div className="interface-mac">MAC: {knxInterface.mac}</div>
                    )}
                    {knxInterface.serialNumber && (
                      <div className="interface-serial">S/N: {knxInterface.serialNumber}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="configuration-section">
          <label className="busmonitor-checkbox">
            <input
              type="checkbox"
              checked={busmonitorMode}
              onChange={(e) => setBusmonitorMode(e.target.checked)}
            />
            <div className="checkbox-content">
              <span className="checkbox-label">Enable Bus Monitor Mode</span>
              <span className="checkbox-description">
                Monitor all KNX traffic passively (recommended for logging and analysis)
              </span>
            </div>
          </label>
        </div>

        <div className="interface-selector-footer">
          <div className="refresh-section">
            <button
              className="refresh-button"
              onClick={onDiscover}
              disabled={isDiscovering}
            >
              {isDiscovering ? 'Refreshing...' : 'Refresh Interfaces'}
            </button>
            {isDiscovering && (
              <div className="refresh-spinner">
                <LoadingIcon size={16} />
              </div>
            )}
          </div>
          <div className="footer-right-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="select-button"
              onClick={handleSelect}
              disabled={!selectedInterface}
            >
              Select Interface
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};