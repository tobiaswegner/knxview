# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-08-11

### Changed
- Updated knxnetjs dependency to version 1.9.0
- Migrated from `createDiscovery` and `createBusmonitor` to new `discoverInterfaces` and `createInterface` APIs
- Updated interface discovery to use callback-based `discoverInterfaces` API
- Fixed interface connection to use proper `open()` method instead of `connect()`
- Converted main.ts from CommonJS require() to ES6 import statements

### Fixed
- Resolved callback error when discovering KNX interfaces
- Fixed interface selection and connection issues with new API
- Improved interface configuration mapping for better compatibility

### Technical Details
- Interface discovery now uses callback pattern: `discoverInterfaces(callback, options)`
- Interface creation uses `createInterface(interfaceInfo, busmonitorMode)` with proper type mapping
- Enhanced interface information structure to include all required properties

## [1.2.0] - 2025-08-05

### Added
- Dedicated toolbar with all main action buttons (Open File, Select Interface, Disconnect, Refresh, Clear)
- Integrated search functionality in toolbar with inline clear button
- Modern button design with icons and hover effects
- Consistent toolbar interface across all application states

### Changed
- Moved all action buttons from header to dedicated toolbar
- Simplified header to focus on information display only
- Enhanced UI organization with better visual hierarchy
- Search input now always visible and easily accessible

### Improved
- Better user experience with more intuitive button placement
- Cleaner interface design with separated concerns (info vs actions)
- More discoverable actions with consistent positioning

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