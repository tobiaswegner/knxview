import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
  isConnected: boolean;
  isConnecting: boolean;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSelectInterface: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onClear: () => void;
  searchFilter: string;
  onSearchChange: (value: string) => void;
  hasTelegrams: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isConnected,
  isConnecting,
  onOpenFile,
  onSaveFile,
  onSelectInterface,
  onDisconnect,
  onRefresh,
  onClear,
  searchFilter,
  onSearchChange,
  hasTelegrams
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button onClick={onOpenFile} className="toolbar-button open-file">
          📁 Open File
        </button>
        <button 
          onClick={onSaveFile} 
          className="toolbar-button save-file"
          disabled={!hasTelegrams}
          title={hasTelegrams ? "Save telegrams to XML file" : "No telegrams to save"}
        >
          💾 Save File
        </button>
        {isConnected ? (
          <button onClick={onDisconnect} className="toolbar-button disconnect">
            🔌 Disconnect
          </button>
        ) : (
          <button onClick={onSelectInterface} className="toolbar-button interface">
            {isConnecting ? '⏳ Connecting...' : '🔗 Select Interface'}
          </button>
        )}
        <button onClick={onRefresh} className="toolbar-button refresh">
          🔄 Refresh
        </button>
        <button onClick={onClear} className="toolbar-button clear">
          🗑️ Clear
        </button>
      </div>
      
      <div className="toolbar-section">
        <div className="search-container-toolbar">
          <input
            type="text"
            placeholder="Search telegrams..."
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input-toolbar"
          />
          {searchFilter && (
            <button 
              onClick={() => onSearchChange('')}
              className="clear-search-button-toolbar"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};