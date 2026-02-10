# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-02-06

### Added
- UI design system and component specs in `docs/ui/` for all views
- Medium type parameter in CommonEMI parser for correct frame structure handling

### Changed
- Reworked KNX interface selection dialog with improved UX
- CommonEMI parser now correctly handles CTRL2 byte based on medium type and message code
  - TP busmonitor (L_Busmon.ind): standard frames pack CTRL2 in the length byte (existing behavior)
  - All other cases (L_Data.ind/req/con, non-TP media): CTRL2 is always a separate byte with full 8-bit length
- Refactored CommonEMI parser internals into reusable helpers (address parsing, APCI decoding, TLC/payload extraction)

### Fixed
- Incorrect parsing of CTRL2 and data length for non-busmonitor cEMI frames
- CI build failure by upgrading Node.js to 20 for @electron/rebuild compatibility

## [1.4.3] - 2025-02-05

### Added
- Configurable busmonitor mode checkbox in interface discovery dialog
- Dynamic connection mode display showing "Bus Monitor" vs "Group Monitor"
- TypeScript interface `KNXInterfaceConfig` for busmonitor configuration
- CSS styling for interface configuration section

### Changed
- Interface connection logic now respects user's busmonitor mode selection
- Service name correctly reflects connection mode: L_Busmon.ind vs L_Data.ind
- Connection name shows "(Bus Monitor)" indicator when busmonitor is enabled
- Menu bar displays actual connection mode instead of hardcoded "Busmonitor"
- Updated all dependencies to latest versions and resolved 17 security vulnerabilities
- Updated knxnetjs dependency to version 1.11.4

### Fixed
- Build errors caused by TypeScript declaration conflicts between @types/node and electron
- Hardcoded "Busmonitor" text now dynamically reflects actual connection mode

## [1.4.2] - 2025-09-27

### Changed
- Updated knxnetjs dependency from version 1.9.0 to 1.11.3

## [1.4.1] - 2025-08-16

### Added
- Professional KNX-themed application icon with network monitoring visualization
- App icon support across all platforms (Windows ICO, macOS/Linux PNG formats)
- Comprehensive icon generation in multiple sizes (16x16 to 512x512)
- CLAUDE.md development documentation with icon conversion commands

### Changed
- Default save filename now includes timestamp in addition to date (e.g., `knx-telegrams-2025-08-16_14-30-25-123Z.xml`)
- Enhanced save dialog with more descriptive filename format
- Updated Electron window configuration to use app icon
- Improved webpack build process to copy icon assets

### Technical Details
- Added robust icon path resolution with fallback mechanisms
- Integrated CopyWebpackPlugin for automatic icon asset copying
- Icon creation workflow documented for future maintenance
- Platform-specific icon format configuration in electron-builder

## [1.4.0] - 2025-08-11

### Added
- File save functionality to export current telegram list to XML format
- Save button in toolbar with purple styling and smart enabled/disabled states
- Support for saving both file-loaded and live captured telegrams
- XML generation that matches the exact format of loaded files
- Proper ConnectorType detection (USB, KnxIpTunneling, KnxIpRouting) based on interface type

### Changed
- Live telegram ordering now adds new telegrams at the end (chronological order)
- Saved XML files use proper chronological sorting with newest telegrams at the end
- Enhanced RecordStart generation with actual interface information (Host, ConnectionName)
- XML format now uses CommunicationLog structure with Connection and RecordStop elements

### Fixed
- Telegram timestamps now properly ordered in saved files
- XML namespace and structure matches standard KNX telegram format
- Service names correctly use L_Busmon.ind for busmonitor telegrams

### Technical Details
- Added xmlGenerator.ts utility for proper XML format generation
- Enhanced Toolbar component with save functionality and proper button states
- Updated IPC handlers for file save dialog with automatic filename generation
- Improved XML escaping and timestamp formatting for cross-tool compatibility

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