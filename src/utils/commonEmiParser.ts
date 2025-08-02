import { Telegram } from '../types/telegram';

/**
 * Parse CommonEmi telegram format according to KNX standard
 * CommonEmi frame structure (hex):
 * - Message Code (1 byte)
 * - Additional Info Length (1 byte) 
 * - Additional Info (variable)
 * - Service Info (1 byte)
 * - Source Address (2 bytes)
 * - Destination Address (2 bytes)
 * - Data Length (1 byte)
 * - Data (variable)
 * - Checksum (1 byte)
 */

export const parseCommonEmi = (rawData: string): Partial<Telegram> => {
  try {
    // Remove any whitespace and convert to uppercase
    const data = rawData.replace(/\s/g, '').toUpperCase();
    
    // Validate hex string
    if (!/^[0-9A-F]+$/.test(data) || data.length < 16) {
      throw new Error('Invalid hex data or insufficient length');
    }
    
    let offset = 0;
    
    // Message Code (1 byte)
    const messageCode = data.substring(offset, offset + 2);
    offset += 2;
    
    // Additional Info Length (1 byte)
    const addInfoLength = parseInt(data.substring(offset, offset + 2), 16);
    offset += 2;
    
    // Skip Additional Info
    offset += addInfoLength * 2;
    
    // Control Field (1 byte) - contains frame type and routing info
    const controlByte = data.substring(offset, offset + 2);
    const controlValue = parseInt(controlByte, 16);
    offset += 2;
    
    // Check if this is extended format (MSB = 0)
    const isExtendedFormat = (controlValue & 0x80) === 0;
    
    let controlByte2 = '';
    // Extended format has an additional control byte
    if (isExtendedFormat) {
      controlByte2 = data.substring(offset, offset + 2);
      offset += 2;
    }
    
    // Source Address (2 bytes)
    const sourceHex = data.substring(offset, offset + 4);
    const sourceArea = parseInt(sourceHex.substring(0, 1), 16);
    const sourceLine = parseInt(sourceHex.substring(1, 2), 16);
    const sourceDevice = parseInt(sourceHex.substring(2, 4), 16);
    const sourceAddress = `${sourceArea}.${sourceLine}.${sourceDevice}`;
    offset += 4;
    
    // Destination Address (2 bytes)
    const destHex = data.substring(offset, offset + 4);
    offset += 4;
    
    // Data Length handling differs between standard and extended frames
    let dataLength: number;
    
    if (isExtendedFormat) {
      // Extended frames: full 8-bit length field
      dataLength = parseInt(data.substring(offset, offset + 2), 16);
    } else {
      // Standard frames: upper 4 bits = control byte 2, lower 4 bits = length
      const lengthByte = parseInt(data.substring(offset, offset + 2), 16);
      dataLength = lengthByte & 0x0F; // Lower 4 bits = actual length
      
      // Extract control byte 2 from upper 4 bits directly
      const controlByte2Value = lengthByte & 0xF0;
      controlByte2 = controlByte2Value.toString(16).padStart(2, '0').toUpperCase();
    }
    
    offset += 2;
    
    // Now that we have control byte 2, determine destination address format
    // Check if it's a group address - always derived from MSB of control byte 2
    const isGroupAddress = (parseInt(controlByte2, 16) & 0x80) !== 0;
    
    let destinationAddress: string;
    if (isGroupAddress) {
      const destValue = parseInt(destHex, 16);
      const mainGroup = (destValue >> 11) & 0x1F;
      const middleGroup = (destValue >> 8) & 0x07;
      const subGroup = destValue & 0xFF;
      destinationAddress = `${mainGroup}/${middleGroup}/${subGroup}`;
    } else {
      const destArea = parseInt(destHex.substring(0, 1), 16);
      const destLine = parseInt(destHex.substring(1, 2), 16);
      const destDevice = parseInt(destHex.substring(2, 4), 16);
      destinationAddress = `${destArea}.${destLine}.${destDevice}`;
    }
    
    // Extract Transport Layer Control and APCI from next 2 bytes
    let transportLayerControl = '';
    let apci = '';
    let payloadType = 'Unknown';
    let payload = '';
    
    if (dataLength > 0 && offset + 4 <= data.length) {
      // Read 2 bytes containing TLC (6 bits) and APCI (10 bits)
      const tlcApciBytes = data.substring(offset, offset + 4);
      const tlcApciValue = parseInt(tlcApciBytes, 16);
      
      // Extract Transport Layer Control (upper 6 bits of first byte)
      const tlcValue = (tlcApciValue >> 10) & 0x3F;
      transportLayerControl = tlcValue.toString(16).padStart(2, '0').toUpperCase();
      
      // Extract APCI (lower 10 bits)
      const apciValue = tlcApciValue & 0x3FF;
      apci = apciValue.toString(16).padStart(3, '0').toUpperCase();
      
      offset += 4;
      
      // Determine payload type from APCI
      if (apciValue === 0x000) {
        payloadType = 'GroupValue_Read';
      } else if ((apciValue & 0x3FC) === 0x040) {
        payloadType = 'GroupValue_Response';
      } else if ((apciValue & 0x3FC) === 0x080) {
        payloadType = 'GroupValue_Write';
      } else if ((apciValue & 0x3FC) === 0x300) {
        payloadType = 'DeviceDescriptor_Read';
      } else if ((apciValue & 0x3FC) === 0x340) {
        payloadType = 'DeviceDescriptor_Response';
      } else if ((apciValue & 0x3FF) === 0x2c7) {
        payloadType = 'FunctionProperty_Command';
      } else if ((apciValue & 0x3FF) === 0x2c9) {
        payloadType = 'FunctionProperty_StateResponse';
      }
      
      // Extract remaining payload data if any
      const remainingLength = dataLength - 2; // Subtract 2 bytes for TLC+APCI
      if (remainingLength > 0 && offset < data.length) {
        payload = data.substring(offset, offset + remainingLength * 2);
      } else if (payloadType === 'GroupValue_Write' || payloadType === 'GroupValue_Response') {
        // For short telegrams, data might be encoded in lower 6 bits of APCI
        const shortValue = apciValue & 0x3F;
        payload = shortValue.toString(16).padStart(2, '0').toUpperCase();
      }
    }
      
    return {
      sourceAddress,
      destinationAddress,
      payloadType,
      payload,
      isExtendedFormat,
      controlByte1: controlByte,
      controlByte2: controlByte2,
      transportLayerControl,
      apci
    };
    
  } catch (error) {
    return {
      parseError: `CommonEmi parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const parseFrameFormat = (telegram: Telegram): Telegram => {
  if (telegram.frameFormat === 'CommonEmi') {
    const parsed = parseCommonEmi(telegram.rawData);
    return {
      ...telegram,
      ...parsed
    };
  } else {
    return {
      ...telegram,
      parseError: `Unsupported frame format: ${telegram.frameFormat}`
    };
  }
};