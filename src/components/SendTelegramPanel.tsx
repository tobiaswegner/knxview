import React, { useState } from 'react';
import { KNXSendRequest } from '../types/electron';
import './SendTelegramPanel.css';

interface SendTelegramPanelProps {
  knownGroupAddresses: string[];
  onSend: (request: KNXSendRequest) => void;
  isSending: boolean;
}

const GROUP_ADDRESS_REGEX = /^\d{1,2}\/\d\/\d{1,3}$/;

export const SendTelegramPanel: React.FC<SendTelegramPanelProps> = ({
  knownGroupAddresses,
  onSend,
  isSending
}) => {
  const [groupAddress, setGroupAddress] = useState('');
  const [dpt, setDpt] = useState('DPT1');
  const [valueDpt1, setValueDpt1] = useState('1');
  const [valueDpt5, setValueDpt5] = useState('0');
  const [valueDpt9, setValueDpt9] = useState('0');
  const [valueRaw, setValueRaw] = useState('');

  const isValidAddress = GROUP_ADDRESS_REGEX.test(groupAddress);
  const isValidRawHex = /^[0-9a-fA-F]{2,}$/.test(valueRaw) && valueRaw.length % 2 === 0;

  const handleSend = () => {
    if (!isValidAddress || isSending) return;

    if (dpt === 'READ') {
      onSend({ groupAddress, dpt, value: 0 });
      return;
    }

    let value: number | boolean | string;
    switch (dpt) {
      case 'DPT1':
        value = valueDpt1 === '1';
        break;
      case 'DPT5':
        value = parseInt(valueDpt5, 10);
        break;
      case 'DPT9':
        value = parseFloat(valueDpt9);
        break;
      case 'RAW':
        if (!isValidRawHex) return;
        value = valueRaw;
        break;
      default:
        return;
    }

    onSend({ groupAddress, dpt, value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="send-telegram-panel">
      <div className="send-field">
        <label>Group Address</label>
        <input
          type="text"
          placeholder="1/2/3"
          value={groupAddress}
          onChange={(e) => setGroupAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          list="known-addresses"
          className={groupAddress && !isValidAddress ? 'invalid' : ''}
        />
        <datalist id="known-addresses">
          {knownGroupAddresses.map((addr) => (
            <option key={addr} value={addr} />
          ))}
        </datalist>
      </div>

      <div className="send-field">
        <label>Type</label>
        <select value={dpt} onChange={(e) => setDpt(e.target.value)}>
          <option value="DPT1">DPT 1 (Switch)</option>
          <option value="DPT5">DPT 5 (Unsigned %)</option>
          <option value="DPT9">DPT 9 (Float)</option>
          <option value="RAW">Raw (Hex)</option>
          <option value="READ">Read Request</option>
        </select>
      </div>

      {dpt !== 'READ' && <div className="send-field">
        <label>Value</label>
        {dpt === 'DPT1' && (
          <select value={valueDpt1} onChange={(e) => setValueDpt1(e.target.value)}>
            <option value="1">On</option>
            <option value="0">Off</option>
          </select>
        )}
        {dpt === 'DPT5' && (
          <input
            type="number"
            min="0"
            max="255"
            value={valueDpt5}
            onChange={(e) => setValueDpt5(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
        {dpt === 'DPT9' && (
          <input
            type="number"
            step="0.1"
            value={valueDpt9}
            onChange={(e) => setValueDpt9(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
        {dpt === 'RAW' && (
          <input
            type="text"
            placeholder="0A1B2C"
            value={valueRaw}
            onChange={(e) => setValueRaw(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            onKeyDown={handleKeyDown}
            className={valueRaw && !isValidRawHex ? 'invalid' : ''}
          />
        )}
      </div>}

      <div className="send-field send-action">
        <button
          onClick={handleSend}
          disabled={!isValidAddress || isSending || (dpt === 'RAW' && !isValidRawHex)}
          className="send-button"
        >
          {isSending ? 'Sending...' : (dpt === 'READ' ? 'Read' : 'Send')}
        </button>
      </div>
    </div>
  );
};
