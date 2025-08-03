# KNXView

A modern Electron-based application for viewing and analyzing KNX telegrams with advanced parsing capabilities for the KNX/EIB protocol.

## Features

- **Telegram Viewer**: Comprehensive list and detail view for KNX telegrams
- **Virtual Scrolling**: Optimized performance for large datasets (50,000+ telegrams)
- **KNX Protocol Support**: Full parsing of telegram format according to KNX standard
- **File Operations**: Load XML files containing telegram data via file dialog
- **Search & Filter**: Real-time search across all telegram fields including payload types
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **Modern UI**: Clean, responsive interface built with React

## Installation

### Binary Releases
Download pre-built binaries from the releases page for your platform:
- Windows: `.exe` installer
- macOS: `.dmg` disk image 
- Linux: `.AppImage` or `.deb` package

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd knxview
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build-all
   ```

5. **Package binary:**
   ```bash
   npm run package
   ```

## Usage

### Loading Telegram Data
1. Click "Open File" to select an XML file containing telegram data
2. The application will parse and display telegrams in the main list view
3. Use "Clear" to remove all loaded telegrams

### Viewing Telegrams
- **List View**: Shows overview of all telegrams with timestamps, addresses, and payload types
- **Detail View**: Click any telegram to see comprehensive parsed data including:
  - Source and destination addresses
  - Control bytes and format information
  - Transport layer control and APCI values
  - Payload data in hexadecimal format

### Search & Navigation
- Use the search box to filter telegrams by any field
- Search works across timestamps, addresses, payload types, and data
- Scroll through large datasets smoothly with virtual scrolling

## KNX Protocol Support

### Telegram Format Parsing
The application provides comprehensive parsing of telegram format according to the KNX standard:

#### Frame Structure
- **Message Code**: Command identifier
- **Additional Info**: Variable length metadata
- **Control Field**: Frame type and routing information
- **Source Address**: Individual address in format `area.line.device`
- **Destination Address**: Individual (`area.line.device`) or group (`main/middle/sub`) address
- **Data Length**: Payload size indicator
- **Transport Layer Control (TLC)**: 6-bit transport control field
- **APCI**: 10-bit Application Layer Protocol Control Information
- **Payload**: Variable length data

#### Format Detection
- **Standard Format**: MSB of control byte = 1, uses 4-bit data length
- **Extended Format**: MSB of control byte = 0, uses 8-bit data length
- **Control Byte 2**: Additional control information
  - Extended format: Separate byte
  - Standard format: Encoded in upper 4 bits of length field

#### APCI Command Types
Supported Application Layer Protocol Control Information commands:
- `0x000`: GroupValue_Read
- `0x040` (mask `0x3FC`): GroupValue_Response  
- `0x080` (mask `0x3FC`): GroupValue_Write
- `0x300` (mask `0x3FC`): DeviceDescriptor_Read
- `0x340` (mask `0x3FC`): DeviceDescriptor_Response
- `0x2C7` (mask `0x3FF`): FunctionProperty_Command
- `0x2C9` (mask `0x3FF`): FunctionProperty_StateResponse

#### Address Types
- **Individual Addresses**: Physical device addresses in dotted notation
- **Group Addresses**: Logical addresses for group communication in slash notation
- **Address Detection**: Automatic identification based on control byte 2 MSB

## Technical Architecture

### Core Components
- **Main Process** (`main.ts`): Electron main process with file dialog handling
- **Renderer Process**: React application with virtual scrolling
- **Preload Script** (`preload.ts`): Secure IPC communication bridge
- **Telegram Parser** (`commonEmiParser.ts`): KNX protocol parsing engine

### Performance Features
- **Virtual Scrolling**: Renders only visible items for optimal performance
- **Chunked Processing**: Large files processed in chunks to prevent UI blocking
- **Efficient Search**: Real-time filtering without performance degradation
- **Memory Management**: Optimized data structures for large datasets

### Security
- **Context Isolation**: Secure separation between main and renderer processes
- **No Node Integration**: Renderer process runs in sandboxed environment
- **IPC Communication**: All file operations handled securely in main process

## Development

### Project Structure
```
├── main.ts              # Electron main process
├── preload.ts           # Preload script for IPC
├── src/
│   ├── components/      # React components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and parsers
├── dist/               # Compiled output
├── public/             # Static assets
└── release/            # Packaged binaries
```

### Build Scripts
- `npm run dev`: Start development server
- `npm run build-all`: Build both Electron and React
- `npm run package`: Create platform-specific binaries
- `npm run package-all`: Build for all platforms

### Technology Stack
- **Electron**: Cross-platform desktop application framework
- **React**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript development
- **Webpack**: Module bundling and development server

## Troubleshooting

### Common Issues
- **File not loading**: Ensure XML file contains valid telegram data
- **Performance issues**: Use virtual scrolling for large datasets
- **Search not working**: Check that search terms match telegram field formats

### Development Issues
- **Build failures**: Verify all dependencies are installed
- **TypeScript errors**: Check type definitions match actual data structures
- **Electron issues**: Ensure proper IPC communication setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Author

Tobias Wegner - git@tobiaswegner.de  
Homepage: https://www.tobiaswegner.de