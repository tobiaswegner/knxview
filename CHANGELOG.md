# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-04

### Added
- KNX tunneling connection in busmonitor mode for real-time telegram monitoring
- Live telegram capture and display from KNX interfaces
- CommonEmi parsing for live telegrams with same detail level as file-loaded telegrams
- Real-time connection status display with connect/disconnect functionality
- Interface selector with KNX interface discovery
- Live telegram filtering and search capabilities
- Connection status indicators and error handling

### Changed
- Telegram viewer now supports both file-loaded and live telegram display modes
- Updated Telegram interface to support live telegram fields
- Enhanced UI to show connection status and provide disconnect functionality

### Fixed
- Telegram display logic to properly show live telegrams when connected
- TypeScript compilation issues with KNX API integration
- Event handling for KNX connection, disconnection, and error states

### Technical Details
- Implemented `createBusmonitor` API from knxnetjs library
- Added IPC handlers for KNX connection management
- Integrated CommonEmi parser for consistent telegram parsing
- Added proper cleanup on application quit and connection management

## [1.0.0] - 2025-08-04

### Added
- Initial release with basic Electron application
- Telegram viewer with performance optimizations and file dialog
- Comprehensive KNX CommonEmi parsing with APCI support
- File-based telegram loading and analysis
- Virtualized telegram list for handling large datasets
- Detailed telegram inspection and analysis
- XML telegram file import functionality
- Binary packaging configuration for multiple platforms