# KNX Viewer

A powerful Electron-based application for monitoring and analyzing KNX/EIB bus communication in real-time and from recorded files.

![KNX Viewer](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
[![CI](https://github.com/tobiaswegner/knxview/workflows/CI/badge.svg)](https://github.com/tobiaswegner/knxview/actions/workflows/build.yml)
[![Security](https://github.com/tobiaswegner/knxview/workflows/Security/badge.svg)](https://github.com/tobiaswegner/knxview/actions/workflows/security.yml)

## Features

### 🔄 Real-time Monitoring
- Connect to KNX interfaces via KNXnet/IP
- Live busmonitor mode for passive traffic monitoring
- Automatic interface discovery on local network
- Real-time telegram parsing and display

### 📊 Comprehensive Analysis
- Full CommonEmi protocol parsing
- Individual and group address resolution
- APCI (Application Protocol Control Information) decoding
- Message type identification (Read/Write/Response)
- Payload analysis and hex data inspection

### 📁 File Support
- Import XML telegram files from ETS and other tools
- High-performance processing of large datasets
- Chunked loading with progress indication
- Support for thousands of telegrams

### 🔍 Advanced Search & Filtering
- Real-time search across all telegram fields
- Filter by address, payload, timestamp, or message type
- Case-insensitive partial matching
- Works with both live and file-loaded data

### ⚡ Performance Optimized
- Virtualized rendering for smooth scrolling
- Memory-efficient handling of large datasets
- Non-blocking file processing
- Responsive UI during heavy operations

## Installation

### Pre-built Binaries

Download the latest release for your platform:

- **Windows**: [knxview-setup-1.1.0.exe](../../releases)
- **macOS**: [knxview-1.1.0.dmg](../../releases)
- **Linux**: [knxview-1.1.0.AppImage](../../releases) or [knxview_1.1.0_amd64.deb](../../releases)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/tobiaswegner/knxview.git
cd knxview

# Install dependencies
npm install

# Build the application
npm run build-all

# Start the application
npm start
```

## Quick Start

### 1. Real-time Monitoring

1. **Launch** KNX Viewer
2. **Click** "Select Interface" to discover KNX interfaces
3. **Choose** your KNX interface from the list
4. **Connect** and start monitoring live bus traffic
5. **Analyze** telegrams in real-time with detailed parsing

### 2. File Analysis

1. **Click** "Open File" to load an XML telegram file
2. **Browse** to your KNX log file (ETS export or similar)
3. **Wait** for processing (progress shown for large files)
4. **Explore** telegrams with search and filtering tools

## System Requirements

- **OS**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Network**: Ethernet connection for KNX interface access
- **Storage**: 100MB free space

## Supported KNX Features

### Protocol Support
- **KNXnet/IP**: Standard KNX over IP communication
- **CommonEmi**: Complete frame parsing and analysis
- **Busmonitor Mode**: Passive monitoring of all bus traffic

### Address Formats
- **Individual Addresses**: Area.Line.Device (e.g., 1.2.34)
- **Group Addresses**: Main/Middle/Sub (e.g., 1/2/34)

### Message Types
- GroupValue_Read/Write/Response
- DeviceDescriptor_Read/Response
- FunctionProperty_Command/StateResponse
- And more...

## Documentation

- **[User Manual](docs/USER_MANUAL.md)**: Complete guide for end users
- **[Development Guide](docs/DEVELOPMENT.md)**: Technical documentation for developers
- **[Changelog](CHANGELOG.md)**: Version history and release notes

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│  Electron Main   │◄──►│  KNX Interface  │
│                 │    │                  │    │                 │
│ • Telegram List │    │ • IPC Handlers   │    │ • KNXnet/IP     │
│ • Search/Filter │    │ • KNX Connection │    │ • Busmonitor    │
│ • Detail View   │    │ • CommonEmi      │    │ • Real-time     │
│                 │    │   Parser         │    │   Telegrams     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Contributing

We welcome contributions! Please see our [Development Guide](docs/DEVELOPMENT.md) for:

- Development setup instructions
- Code style guidelines  
- Architecture overview
- Testing procedures

### Development Commands

```bash
npm run dev          # Development mode with hot reload
npm run build-all    # Build complete application
npm run package      # Create distributable package
npm test             # Run test suite (when available)
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and new features.

## Support

- **🐛 Bug Reports**: [Create an issue](../../issues) with detailed reproduction steps
- **💡 Feature Requests**: [Open a discussion](../../discussions) to propose new features
- **📖 Documentation**: Check the [User Manual](docs/USER_MANUAL.md) and [Development Guide](docs/DEVELOPMENT.md)
- **💬 Questions**: Use [GitHub Discussions](../../discussions) for general questions

## Acknowledgments

- Built with [Electron](https://electronjs.org/) and [React](https://reactjs.org/)
- KNX communication via [knxnetjs](https://www.npmjs.com/package/knxnetjs)
- Inspired by the KNX/EIB automation community

---

**Made with ❤️ for the KNX community**

*KNX Viewer helps you understand your building automation better through detailed bus traffic analysis and real-time monitoring.*