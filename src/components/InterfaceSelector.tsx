import React, { useState } from 'react';
import { KNXInterface } from '../types/electron';
import './InterfaceSelector.css';
import { LoadingIcon, WarningIcon } from './Icons';

interface InterfaceSelectorProps {
  isOpen: boolean;
  interfaces: KNXInterface[];
  isDiscovering: boolean;
  error?: string;
  onClose: () => void;
  onSelect: (knxInterface: KNXInterface) => void;
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

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedInterface) {
      onSelect(selectedInterface);
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
          <div className="discovery-section">
            <button 
              className="discover-button" 
              onClick={onDiscover}
              disabled={isDiscovering}
            >
              {isDiscovering ? 'Discovering...' : 'Discover Interfaces'}
            </button>
            {isDiscovering && (
              <div className="spinner">
                <LoadingIcon size={16} />
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <WarningIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="interfaces-list">
            {interfaces.length === 0 && !isDiscovering && (
              <div className="no-interfaces">
                No KNX interfaces found. Click "Discover Interfaces" to search for available interfaces.
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

        <div className="interface-selector-footer">
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
  );
};