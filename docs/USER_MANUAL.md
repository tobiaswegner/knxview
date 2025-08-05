# KNX Viewer - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Working with Files](#working-with-files)
5. [Real-time Monitoring](#real-time-monitoring)
6. [Analyzing Telegrams](#analyzing-telegrams)
7. [Search and Filtering](#search-and-filtering)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Introduction

KNX Viewer is a powerful tool for monitoring and analyzing KNX/EIB bus communication. It provides two main modes of operation:

- **File Analysis**: Load and analyze KNX telegram files (XML format)
- **Real-time Monitoring**: Connect directly to KNX interfaces to monitor live bus traffic

### Key Features

- ✅ Real-time KNX bus monitoring
- ✅ XML telegram file analysis
- ✅ Comprehensive CommonEmi parsing
- ✅ Advanced search and filtering
- ✅ Detailed telegram inspection
- ✅ High-performance virtualized display
- ✅ Cross-platform support (Windows, macOS, Linux)

## Installation

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Network**: Ethernet connection for KNX interface communication
- **Storage**: 100MB free disk space

### Download and Install

1. **Download**: Get the latest release from the releases page
   - Windows: `knxview-setup-1.1.0.exe`
   - macOS: `knxview-1.1.0.dmg`
   - Linux: `knxview-1.1.0.AppImage` or `knxview_1.1.0_amd64.deb`

2. **Install**:
   - **Windows**: Run the installer and follow the setup wizard
   - **macOS**: Open the DMG and drag KNX Viewer to Applications
   - **Linux**: Make AppImage executable or install DEB package

3. **Launch**: Start KNX Viewer from your applications menu or desktop shortcut

## Getting Started

### First Launch

When you first open KNX Viewer, you'll see the main interface with two primary options:

1. **Select Interface** - Connect to a KNX interface for real-time monitoring
2. **Open File** - Load an XML telegram file for analysis

### Interface Overview

The main window consists of:

- **Header Bar**: Shows connection status, file information, and controls
- **Telegram List**: Displays telegrams in a scrollable, virtualized list
- **Detail Panel**: Shows detailed information about the selected telegram
- **Search Bar**: Allows filtering telegrams by various criteria

## Working with Files

### Supported File Formats

KNX Viewer supports XML files containing KNX telegram data, typically exported from:
- ETS (Engineering Tool Software)
- Other KNX monitoring tools
- Custom logging applications

### Loading a File

1. Click **"Open File"** in the header or main screen
2. Browse to your XML file location
3. Select the file and click **"Open"**
4. Wait for the file to be processed (progress shown for large files)

### File Processing

Large files are processed in chunks to maintain responsive performance:
- Files are processed in 1000-telegram batches
- Progress indicator shows processing status
- You can interact with already-loaded telegrams while processing continues

### Example File Structure

Your XML file should follow this general structure:
```xml
<?xml version="1.0" encoding="utf-8"?>
<KnxLog>
  <RecordStart Timestamp="2024-08-04T10:30:00" 
               ConnectionName="KNX Connection" 
               Mode="Busmonitor" 
               Host="192.168.1.100"/>
  <Telegram Timestamp="2024-08-04T10:30:01.123" 
            Service="L_Data.ind" 
            FrameFormat="CommonEmi" 
            RawData="BC110C01020304050607"/>
  <!-- More telegrams... -->
</KnxLog>
```

## Real-time Monitoring

### Network Setup

Before connecting to a KNX interface, ensure:
- Your computer is on the same network as the KNX interface
- The KNX interface supports KNXnet/IP protocol
- Firewall allows UDP traffic on port 3671
- No other applications are using the interface

### Discovering Interfaces

1. Click **"Select Interface"** to open the interface selector
2. Click **"Discover Interfaces"** to scan for available KNX interfaces
3. Wait for the discovery process to complete (usually 5-10 seconds)
4. Available interfaces will be listed with their details

### Interface Information

Each discovered interface shows:
- **Name**: Device name or identifier
- **IP Address**: Network address and port
- **Description**: Additional device information
- **MAC Address**: Hardware address (if available)
- **Serial Number**: Device serial number (if available)

### Connecting to an Interface

1. Select an interface from the discovered list
2. Click **"Select Interface"** to establish connection
3. Wait for connection confirmation (status shows "Connecting...")
4. Once connected, status changes to "● Connected" with interface details

### Monitoring Live Traffic

When connected to an interface:
- New telegrams appear in real-time at the top of the list
- Connection status is shown in the header
- Live telegrams are parsed with the same detail as file-loaded telegrams
- You can search and filter live telegrams just like file data

### Disconnecting

To stop monitoring:
1. Click **"Disconnect"** in the header
2. Connection closes and live telegram collection stops
3. Previously captured telegrams remain visible
4. You can reconnect or switch to file mode

## Analyzing Telegrams

### Telegram List View

The main telegram list shows key information:
- **Timestamp**: When the telegram was captured/recorded
- **Service**: KNX service type (typically L_Data.ind)
- **Source**: Source device address
- **Destination**: Target address (individual or group)
- **Type**: Payload type (Read, Write, Response, etc.)
- **Data**: Payload data in hex format

### Detailed View

Click any telegram to see detailed information:

#### Address Information
- **Source Address**: Individual address of sending device (Area.Line.Device)
- **Destination Address**: Target address
  - Individual: Area.Line.Device format
  - Group: Main/Middle/Sub format

#### Frame Details
- **Frame Format**: Protocol format (typically CommonEmi)
- **Raw Data**: Complete frame in hexadecimal
- **Control Bytes**: Frame control information
- **Extended Format**: Whether extended frame format is used

#### Protocol Information
- **Transport Layer Control**: TLC information
- **APCI**: Application Layer Protocol Control Information
- **Message Type**: Specific operation type:
  - `GroupValue_Read`: Request to read a group value
  - `GroupValue_Write`: Command to write a group value
  - `GroupValue_Response`: Response with a group value
  - `DeviceDescriptor_Read`: Request device information
  - And more...

#### Payload Analysis
- **Payload Type**: Identified message type
- **Payload Data**: Parsed data content
- **Data Length**: Size of payload in bytes

### Understanding KNX Addresses

#### Individual Addresses (Physical)
Format: `Area.Line.Device` (e.g., 1.2.34)
- **Area**: Main area (1-15)
- **Line**: Line within area (0-15)  
- **Device**: Device on line (0-255)

#### Group Addresses (Logical)
Format: `Main/Middle/Sub` (e.g., 1/2/34)
- **Main Group**: Primary function (0-31)
- **Middle Group**: Sub-function (0-7)
- **Sub Group**: Specific datapoint (0-255)

### Common Message Types

- **GroupValue_Read**: Device requesting current value
- **GroupValue_Write**: Device sending new value
- **GroupValue_Response**: Device responding with current value
- **DeviceDescriptor_Read**: Requesting device capabilities
- **DeviceDescriptor_Response**: Device reporting capabilities

## Search and Filtering

### Search Bar

The search function allows filtering telegrams by multiple criteria:
- Service type
- Connection name
- Raw data (hex values)
- Timestamp
- Payload type
- Source address
- Destination address
- Payload data

### Search Examples

- **Find all writes**: Search for "write"
- **Specific address**: Search for "1.2.34" or "1/2/34"
- **Hex data**: Search for "BC11" to find frames containing this sequence
- **Time range**: Search for "10:30" to find telegrams around that time
- **Device communication**: Search for specific device addresses

### Advanced Filtering

- Search is case-insensitive
- Partial matches are supported
- Multiple search criteria can be combined
- Real-time filtering updates as you type
- Search works on both file-loaded and live telegrams

### Clearing Search

Click the **"×"** button in the search bar to clear filters and show all telegrams.

## Troubleshooting

### Connection Issues

**Problem**: No KNX interfaces found
- **Solution**: 
  - Verify network connectivity
  - Check that interface supports KNXnet/IP
  - Ensure computer and interface are on same subnet
  - Try disabling firewall temporarily

**Problem**: Connection timeout
- **Solution**:
  - Interface may be busy with another connection
  - Check network latency
  - Restart the KNX interface
  - Verify interface supports busmonitor mode

**Problem**: Connection drops frequently
- **Solution**:
  - Check network stability
  - Verify power supply to KNX interface
  - Look for network congestion
  - Update interface firmware if available

### File Loading Issues

**Problem**: XML file won't load
- **Solution**:
  - Verify file is valid XML format
  - Check file permissions
  - Try with a smaller test file
  - Ensure file isn't corrupted

**Problem**: Slow file processing
- **Solution**:
  - Close other applications to free memory
  - Use SSD storage for better performance
  - Split very large files into smaller chunks
  - Increase system memory if possible

### Performance Issues

**Problem**: Application runs slowly
- **Solution**:
  - Reduce number of live telegrams (automatic after 10,000)
  - Close other resource-intensive applications
  - Restart application periodically for long sessions
  - Update to latest version

**Problem**: High memory usage
- **Solution**:
  - Clear old data by disconnecting and reconnecting
  - Avoid keeping multiple large files loaded
  - Monitor system memory and close other applications

### Display Issues

**Problem**: Telegrams not appearing
- **Solution**:
  - Check connection status in header
  - Verify search filters aren't too restrictive
  - Try refreshing the view
  - Check console for error messages

**Problem**: Incorrect parsing results
- **Solution**:
  - Verify KNX frame format is supported
  - Check for transmission errors in raw data
  - Update to latest version for improved parsing
  - Report parsing issues with sample data

## FAQ

### General Questions

**Q: What types of KNX interfaces are supported?**
A: Any KNX interface that supports KNXnet/IP protocol and busmonitor mode. This includes most modern KNX IP interfaces and gateways.

**Q: Can I monitor multiple interfaces simultaneously?**
A: Currently, KNX Viewer supports one active connection at a time. You can switch between interfaces by disconnecting and reconnecting.

**Q: What's the maximum file size supported?**
A: KNX Viewer can handle very large files (several GB) thanks to chunked processing, but performance depends on available system memory.

**Q: Are there any network security considerations?**
A: KNX Viewer only communicates with devices on your local network. No external connections are made. Standard network security practices apply.

### Technical Questions

**Q: What KNX frame formats are supported?**
A: Currently supports CommonEmi format, which is the standard for KNXnet/IP communication. Additional formats may be added in future versions.

**Q: Can I export analyzed data?**
A: Data export functionality is planned for future releases. Currently, you can use the search function to isolate specific telegrams.

**Q: How accurate is the timestamp information?**
A: Timestamps for live monitoring are generated when frames are received by the application. File-loaded timestamps use the original capture time from the XML file.

**Q: What happens if I lose network connection during monitoring?**
A: The application will detect the connection loss and automatically attempt to reconnect. Previously captured telegrams are preserved.

### Troubleshooting Questions

**Q: Why can't I see any telegrams even though I'm connected?**
A: Ensure there's actual KNX bus activity. Try triggering a device (light switch, sensor) to generate traffic. Also check that the interface supports passive monitoring.

**Q: The application crashes when loading large files. What should I do?**
A: Increase system memory if possible, close other applications, and try processing the file in smaller sections. Report crashes with system information.

**Q: How do I report bugs or request features?**
A: Create an issue on the project's GitHub repository with detailed information about the problem or feature request.

## Support and Updates

### Getting Help

- **Documentation**: Check this manual and development documentation
- **Issues**: Report bugs and ask questions on GitHub
- **Updates**: New versions are released with bug fixes and features

### Staying Updated

- Watch the GitHub repository for new releases
- Check the changelog for new features and fixes
- Update notifications may appear in the application

### Community

- Share your experience with other KNX professionals
- Contribute feedback for improving the application
- Suggest new features based on your needs

---

**Version**: 1.1.0  
**Last Updated**: August 2024  
**For technical support**: Create an issue on GitHub with detailed information about your problem.