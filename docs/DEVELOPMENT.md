# KNX Viewer - Development Documentation

## Overview

KNX Viewer is an Electron-based application for monitoring and analyzing KNX/EIB bus traffic. It supports both file-based telegram analysis and real-time bus monitoring through KNX interfaces.

## Architecture

### Technology Stack

- **Frontend**: React 19.1.1 with TypeScript
- **Backend**: Electron 37.2.5 with Node.js
- **Build System**: Webpack 5 + TypeScript Compiler
- **KNX Communication**: knxnetjs 1.6.0
- **Styling**: CSS3 with custom components

### Project Structure

```
knxview/
├── src/                          # React frontend source
│   ├── components/              # React components
│   │   ├── TelegramViewer.tsx   # Main application component
│   │   ├── InterfaceSelector.tsx # KNX interface selection
│   │   ├── TelegramDetail.tsx   # Detailed telegram view
│   │   └── VirtualizedTelegramList.tsx # Performance-optimized list
│   ├── types/                   # TypeScript type definitions
│   │   ├── telegram.ts          # Telegram data structures
│   │   └── electron.ts          # Electron API types
│   └── utils/                   # Utility functions
│       ├── xmlParser.ts         # XML telegram file parser
│       └── commonEmiParser.ts   # KNX CommonEmi protocol parser
├── main.ts                      # Electron main process
├── preload.ts                   # Electron preload script
├── public/                      # Static assets
├── dist/                        # Build output
└── docs/                        # Documentation
```

## Development Setup

### Prerequisites

- Node.js 16.0.0 or later
- npm or yarn package manager
- Git for version control

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd knxview
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build-all
```

### Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build React frontend only
npm run build-react

# Build Electron backend only
npm run build-electron

# Build entire application
npm run build-all

# Start production build
npm start

# Package for distribution
npm run package

# Package for all platforms
npm run package-all
```

## Core Components

### Main Process (main.ts)

The Electron main process handles:
- Application lifecycle management
- IPC (Inter-Process Communication) handlers
- KNX interface discovery and connection
- File dialog operations
- Real-time telegram processing and parsing

#### Key IPC Handlers

- `dialog:openFile` - File selection for XML telegram files
- `knx:discoverInterfaces` - Discover available KNX interfaces
- `knx:connectInterface` - Connect to KNX interface in busmonitor mode
- `knx:disconnectInterface` - Disconnect from active KNX connection

### Preload Script (preload.ts)

Provides secure bridge between main and renderer processes:
- Exposes electron APIs to frontend
- Sets up event listeners for KNX events
- Manages IPC communication

### Frontend Components

#### TelegramViewer (Primary Component)
- Manages application state
- Handles both file-based and live telegram display
- Provides search and filtering functionality
- Manages KNX connection lifecycle

#### InterfaceSelector
- KNX interface discovery UI
- Connection management interface
- Error handling and status display

#### VirtualizedTelegramList
- Performance-optimized rendering for large datasets
- Virtual scrolling for thousands of telegrams
- Selection and interaction handling

## KNX Integration

### Protocol Support

The application supports KNX communication through:
- **KNXnet/IP**: Standard KNX over IP protocol
- **Busmonitor Mode**: Passive monitoring of all bus traffic
- **CommonEmi Parsing**: Full KNX frame analysis

### Telegram Parsing

The CommonEmi parser (`commonEmiParser.ts`) provides:
- Message type identification (GroupValue_Read/Write/Response, etc.)
- Source/destination address parsing (individual and group addresses)
- Payload extraction and analysis
- Transport layer control and APCI decoding
- Error handling for malformed frames

#### Supported APCI Types

- GroupValue_Read (0x000)
- GroupValue_Response (0x040)
- GroupValue_Write (0x080)
- DeviceDescriptor_Read (0x300)
- DeviceDescriptor_Response (0x340)
- FunctionProperty_Command (0x2c7)
- FunctionProperty_StateResponse (0x2c9)

### Address Formats

- **Individual Addresses**: Area.Line.Device (e.g., 1.2.34)
- **Group Addresses**: Main/Middle/Sub (e.g., 1/2/34)

## Data Flow

### File-Based Analysis

1. User selects XML file through file dialog
2. XML parser processes file in chunks for performance
3. CommonEmi parser analyzes each telegram
4. Parsed telegrams displayed in virtualized list
5. User can filter, search, and inspect individual telegrams

### Real-Time Monitoring

1. User discovers KNX interfaces on network
2. Application creates busmonitor connection
3. Raw KNX frames received via 'recv' events
4. Frames parsed using CommonEmi parser
5. Live telegrams added to display in real-time
6. Same filtering and analysis tools available

## State Management

### React State Structure

```typescript
// Connection state
const [isConnected, setIsConnected] = useState<boolean>(false);
const [selectedInterface, setSelectedInterface] = useState<KNXInterface | null>(null);
const [liveTelegrams, setLiveTelegrams] = useState<Telegram[]>([]);

// File-based state
const [communicationLog, setCommunicationLog] = useState<CommunicationLog | null>(null);
const [currentFile, setCurrentFile] = useState<string | null>(null);

// UI state
const [selectedTelegram, setSelectedTelegram] = useState<Telegram | null>(null);
const [searchFilter, setSearchFilter] = useState<string>('');
const [loading, setLoading] = useState<boolean>(false);
```

## Performance Optimizations

### Virtualized Rendering
- Only renders visible telegrams in viewport
- Handles datasets of 10,000+ telegrams efficiently
- Smooth scrolling with minimal memory usage

### Chunked Processing
- XML files processed in 1000-telegram chunks
- Non-blocking parsing with progress indication
- Prevents UI freezing during large file processing

### Memory Management
- Live telegrams limited to 10,000 most recent
- Automatic cleanup of old data
- Efficient string handling for hex data

## Error Handling

### KNX Connection Errors
- Network connectivity issues
- Interface compatibility problems
- Protocol-level errors
- Graceful fallback and user notification

### Parsing Errors
- Malformed XML files
- Invalid hex data
- Unsupported frame formats
- Error reporting with context

## Testing

### Development Testing
- Manual testing with various KNX interfaces
- XML file format validation
- Performance testing with large datasets
- Cross-platform compatibility testing

### Recommended Test Cases
1. Interface discovery and connection
2. Real-time telegram reception
3. Large XML file processing
4. Search and filter functionality
5. Connection error scenarios
6. Application shutdown cleanup

## Build and Deployment

### Electron Builder Configuration

The application uses electron-builder for packaging:

```json
{
  "build": {
    "appId": "de.tobiaswegner.knxview",
    "productName": "knxview",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "public/**/*", 
      "node_modules/**/*",
      "package.json"
    ]
  }
}
```

### Platform Support
- **macOS**: DMG installer for x64 and ARM64
- **Windows**: NSIS installer for x64
- **Linux**: AppImage and DEB packages for x64

## Security Considerations

### Context Isolation
- Enabled context isolation in Electron
- Secure IPC communication through preload script
- No direct Node.js access from renderer

### Network Security
- KNX communication over local network only
- No external network dependencies for core functionality
- Secure handling of network credentials

## Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for consistent formatting
- React functional components with hooks
- Async/await for promise handling

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Test on target platforms
4. Update documentation
5. Submit pull request with detailed description

### Debugging

#### Frontend Debugging
- React DevTools for component inspection
- Browser DevTools for console logging
- Source maps for TypeScript debugging

#### Backend Debugging
- Electron main process debugging
- Console logging for KNX communication
- IPC message tracing

```bash
# Enable debug logging
NODE_ENV=development npm run dev-electron
```

## API Reference

### KNX Interface Types

```typescript
interface KNXInterface {
  ip: string;
  port: number;
  name?: string;
  mac?: string;
  multicastAddress?: string;
  serialNumber?: string;
  description?: string;
}
```

### Telegram Structure

```typescript
interface Telegram {
  timestamp: string;
  connectionName: string;
  service: string;
  frameFormat?: string;
  rawData: string;
  id?: string;
  sourceAddress?: string;
  destinationAddress?: string;
  payloadType?: string;
  payload?: string;
  isExtendedFormat?: boolean;
  controlByte1?: string;
  controlByte2?: string;
  transportLayerControl?: string;
  apci?: string;
  parseError?: string;
  parsed?: any;
}
```

## Troubleshooting

### Common Issues

**KNX Interface Not Found**
- Ensure interface is on same network segment
- Check firewall settings for UDP port 3671
- Verify interface supports KNXnet/IP

**Connection Timeouts**
- Network latency issues
- Interface busy with other connections
- Router/switch configuration problems

**Parsing Errors**
- Malformed KNX frames
- Unsupported protocol extensions
- Network transmission errors

**Performance Issues**
- Large XML files (>100MB)
- Memory constraints
- Outdated hardware

### Debug Tools

Enable verbose logging:
```bash
DEBUG=knx* npm run dev
```

Monitor IPC communication:
```javascript
// In main process
console.log('IPC:', event, data);
```

## Future Enhancements

### Planned Features
- Support for KNX Secure
- Advanced filtering and analysis tools
- Telegram statistics and visualization
- Export functionality for analysis results
- Plugin architecture for custom parsers

### Technical Improvements
- WebSocket API for external integrations
- Database storage for large datasets
- Advanced search with regular expressions
- Telegram scripting and automation

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

For development questions and issues:
- Check existing GitHub issues
- Review this documentation
- Create detailed bug reports with reproduction steps
- Include system information and error logs