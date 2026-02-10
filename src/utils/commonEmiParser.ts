import { Telegram } from '../types/telegram';

/**
 * Parse CommonEmi telegram format according to KNX standard
 *
 * Frame structure depends on context:
 * - TP busmonitor (L_Busmon.ind on Tp medium): raw TP frames where standard
 *   frames pack CTRL2 into the upper 4 bits of the length byte
 * - All other cases (L_Data.ind/req/con, non-Tp media): CTRL2 is always a
 *   separate byte after CTRL1, and length is a full 8-bit field
 */

const parseSourceAddress = (sourceHex: string): string => {
  const area = parseInt(sourceHex.substring(0, 1), 16);
  const line = parseInt(sourceHex.substring(1, 2), 16);
  const device = parseInt(sourceHex.substring(2, 4), 16);
  return `${area}.${line}.${device}`;
};

const parseDestinationAddress = (destHex: string, isGroupAddress: boolean): string => {
  if (isGroupAddress) {
    const destValue = parseInt(destHex, 16);
    const mainGroup = (destValue >> 11) & 0x1F;
    const middleGroup = (destValue >> 8) & 0x07;
    const subGroup = destValue & 0xFF;
    return `${mainGroup}/${middleGroup}/${subGroup}`;
  } else {
    const area = parseInt(destHex.substring(0, 1), 16);
    const line = parseInt(destHex.substring(1, 2), 16);
    const device = parseInt(destHex.substring(2, 4), 16);
    return `${area}.${line}.${device}`;
  }
};

const parseApciType = (apciValue: number): string => {
  if (apciValue === 0x000) {
    return 'GroupValue_Read';
  } else if ((apciValue & 0x3FC) === 0x040) {
    return 'GroupValue_Response';
  } else if ((apciValue & 0x3FC) === 0x080) {
    return 'GroupValue_Write';
  } else if ((apciValue & 0x3FC) === 0x300) {
    return 'DeviceDescriptor_Read';
  } else if ((apciValue & 0x3FC) === 0x340) {
    return 'DeviceDescriptor_Response';
  } else if ((apciValue & 0x3FF) === 0x2c7) {
    return 'FunctionProperty_Command';
  } else if ((apciValue & 0x3FF) === 0x2c9) {
    return 'FunctionProperty_StateResponse';
  }
  return 'Unknown';
};

const parseTlcApciPayload = (data: string, offset: number, dataLength: number) => {
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

    payloadType = parseApciType(apciValue);

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

  return { transportLayerControl, apci, payloadType, payload };
};

export const parseCommonEmi = (rawData: string, mediumType?: string, service?: string): Partial<Telegram> => {
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

    // Control Field 1 (1 byte) - contains frame type and routing info
    const controlByte = data.substring(offset, offset + 2);
    const controlValue = parseInt(controlByte, 16);
    offset += 2;

    // Check if this is extended format (CTRL1 bit 7: 0 = extended, 1 = standard)
    const isExtendedFormat = (controlValue & 0x80) === 0;

    // In TP busmonitor mode, we receive raw TP frames where standard frames
    // pack CTRL2 into the upper 4 bits of the length byte. In all other cases
    // (cEMI L_Data, non-TP media), CTRL2 is always a separate byte.
    const isTpBusmonitor = mediumType?.toLowerCase() === 'tp' &&
      (service === 'L_Busmon.ind' || parseInt(messageCode, 16) === 0x2B);

    let controlByte2: string;
    let dataLength: number;

    if (isTpBusmonitor && !isExtendedFormat) {
      // TP busmonitor standard frame: no separate CTRL2 byte here,
      // it is packed into the length byte after the addresses

      // Source Address (2 bytes)
      const sourceHex = data.substring(offset, offset + 4);
      offset += 4;

      // Destination Address (2 bytes)
      const destHex = data.substring(offset, offset + 4);
      offset += 4;

      // Length byte: upper 4 bits = CTRL2, lower 4 bits = data length
      const lengthByte = parseInt(data.substring(offset, offset + 2), 16);
      dataLength = lengthByte & 0x0F;
      const controlByte2Value = lengthByte & 0xF0;
      controlByte2 = controlByte2Value.toString(16).padStart(2, '0').toUpperCase();
      offset += 2;

      const isGroupAddress = (controlByte2Value & 0x80) !== 0;
      const sourceAddress = parseSourceAddress(sourceHex);
      const destinationAddress = parseDestinationAddress(destHex, isGroupAddress);
      const { transportLayerControl, apci, payloadType, payload } =
        parseTlcApciPayload(data, offset, dataLength);

      return {
        sourceAddress,
        destinationAddress,
        payloadType,
        payload,
        isExtendedFormat,
        controlByte1: controlByte,
        controlByte2,
        transportLayerControl,
        apci
      };
    }

    // All other cases: CTRL2 is always a separate byte after CTRL1
    // (TP busmonitor extended frames also have a separate CTRL2)
    controlByte2 = data.substring(offset, offset + 2);
    offset += 2;

    // Source Address (2 bytes)
    const sourceHex = data.substring(offset, offset + 4);
    offset += 4;

    // Destination Address (2 bytes)
    const destHex = data.substring(offset, offset + 4);
    offset += 4;

    // Length is always a full 8-bit field
    dataLength = parseInt(data.substring(offset, offset + 2), 16);
    offset += 2;

    const isGroupAddress = (parseInt(controlByte2, 16) & 0x80) !== 0;
    const sourceAddress = parseSourceAddress(sourceHex);
    const destinationAddress = parseDestinationAddress(destHex, isGroupAddress);
    const { transportLayerControl, apci, payloadType, payload } =
      parseTlcApciPayload(data, offset, dataLength);

    return {
      sourceAddress,
      destinationAddress,
      payloadType,
      payload,
      isExtendedFormat,
      controlByte1: controlByte,
      controlByte2,
      transportLayerControl,
      apci
    };

  } catch (error) {
    return {
      parseError: `CommonEmi parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const parseFrameFormat = (telegram: Telegram, mediumType?: string): Telegram => {
  if (telegram.frameFormat === 'CommonEmi') {
    const parsed = parseCommonEmi(telegram.rawData, mediumType, telegram.service);
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
