# InterfaceSelector Component

## Overview

The `InterfaceSelector` is a modal dialog component that allows users to discover, select, and connect to KNX (KNX/EIB) network interfaces. It provides an intuitive interface for scanning the network for available KNX interfaces and configuring connection parameters.

## Features

- **Automatic Discovery**: Automatically scans for KNX interfaces when the dialog opens
- **Manual Refresh**: Users can manually refresh the interface list
- **Interface Selection**: Click to select from discovered interfaces
- **Bus Monitor Configuration**: Toggle bus monitor mode for passive monitoring
- **Error Handling**: Displays discovery and connection errors
- **Responsive Design**: Adapts to different screen sizes

## Component Structure

### File Locations
- Component: `src/components/InterfaceSelector.tsx`
- Styles: `src/components/InterfaceSelector.css`
- Types: `src/types/electron.ts`

## Props API

### InterfaceSelectorProps

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Controls the visibility of the dialog |
| `interfaces` | `KNXInterface[]` | ✅ | Array of discovered KNX interfaces |
| `isDiscovering` | `boolean` | ✅ | Indicates if interface discovery is in progress |
| `error` | `string \| undefined` | ❌ | Error message to display |
| `onClose` | `() => void` | ✅ | Callback when dialog is closed |
| `onSelect` | `(knxInterface: KNXInterface, busmonitorMode?: boolean) => void` | ✅ | Callback when interface is selected |
| `onDiscover` | `() => void` | ✅ | Callback to trigger interface discovery |

### KNXInterface Type

```typescript
interface KNXInterface {
  ip: string;
  port: number;
  name?: string;
  description?: string;
  mac?: string;
  serialNumber?: string;
}
```

## Behavior Specification

### Dialog Lifecycle

1. **Opening**
   - Dialog appears as a modal overlay
   - Automatic discovery is triggered if no interfaces are present and discovery isn't running
   - Focus is set to the dialog

2. **Discovery Process**
   - Shows "Discovering interfaces..." message in the main area
   - Refresh button shows "Refreshing..." text and is disabled
   - Spinning loading icon appears next to the refresh button
   - Discovery runs asynchronously via `onDiscover` callback

3. **Interface Display**
   - Interfaces are displayed as clickable cards
   - Each card shows IP:port, name, and optional details (description, MAC, S/N)
   - Selected interface is highlighted with blue border and background

4. **Configuration**
   - Bus Monitor Mode checkbox (enabled by default)
   - Recommended for passive monitoring and logging

5. **Actions**
   - **Refresh Interfaces**: Triggers new discovery (left side of footer)
   - **Cancel**: Closes dialog without selection (right side of footer)
   - **Select Interface**: Confirms selection and closes dialog (right side of footer)

### State Management

The component maintains internal state for:
- `selectedInterface`: Currently selected KNX interface
- `busmonitorMode`: Bus monitor configuration toggle

External state is managed by the parent component:
- Interface list
- Discovery status
- Error states

### Error Handling

Errors are displayed in a prominent red banner at the top of the dialog content area. Common error scenarios:

- Network discovery failures
- No interfaces found
- Connection timeouts
- Invalid interface responses

## Usage Example

```typescript
import { InterfaceSelector } from './components/InterfaceSelector';
import { KNXInterface } from './types/electron';

function MyComponent() {
  const [showSelector, setShowSelector] = useState(false);
  const [interfaces, setInterfaces] = useState<KNXInterface[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string>();

  const handleDiscover = async () => {
    setIsDiscovering(true);
    setError(undefined);
    try {
      const result = await window.electronAPI.discoverKNXInterfaces();
      if (result.success) {
        setInterfaces(result.interfaces);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSelect = async (knxInterface: KNXInterface, busmonitorMode: boolean) => {
    // Connect to the selected interface
    const config = { ...knxInterface, busmonitorMode };
    await window.electronAPI.connectKNXInterface(config);
  };

  return (
    <>
      <button onClick={() => setShowSelector(true)}>
        Select KNX Interface
      </button>

      <InterfaceSelector
        isOpen={showSelector}
        interfaces={interfaces}
        isDiscovering={isDiscovering}
        error={error}
        onClose={() => setShowSelector(false)}
        onSelect={handleSelect}
        onDiscover={handleDiscover}
      />
    </>
  );
}
```

## Styling

### CSS Classes

| Class | Description |
|-------|-------------|
| `.interface-selector-overlay` | Modal backdrop overlay |
| `.interface-selector-dialog` | Main dialog container |
| `.interface-selector-header` | Dialog header with title and close button |
| `.interface-selector-content` | Scrollable content area |
| `.interface-selector-footer` | Footer with action buttons |
| `.interfaces-list` | Container for interface items |
| `.interface-item` | Individual interface card |
| `.interface-item.selected` | Selected interface styling |
| `.error-message` | Error banner styling |
| `.discovering-message` | Discovery status message |
| `.refresh-section` | Refresh button and spinner container |
| `.refresh-spinner` | Spinning loading icon |
| `.configuration-section` | Bus monitor configuration area |

### Responsive Design

- Dialog width: 90% of viewport, max 600px
- Dialog height: max 80% of viewport
- Scrollable content area when interface list is long
- Touch-friendly interface sizing

## Accessibility

- **Keyboard Navigation**: Tab through interactive elements
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Focus Management**: Focus trapped within modal
- **Contrast**: High contrast colors for text and borders
- **Interactive States**: Clear hover and focus indicators

## Testing Considerations

### Unit Tests
- Props validation
- State management
- Event handlers
- Conditional rendering

### Integration Tests
- Dialog open/close behavior
- Interface selection flow
- Discovery process
- Error scenarios

### E2E Tests
- Full user workflow
- Network discovery simulation
- Connection establishment
- Error recovery

## Performance

- **Virtualization**: Consider for large interface lists (>100 items)
- **Debouncing**: Discovery requests are debounced
- **Memory Management**: Component unmounts cleanly
- **Animation**: CSS transitions for smooth interactions

## Dependencies

- React hooks: `useState`, `useEffect`
- Icons: `LoadingIcon`, `WarningIcon`
- Types: `KNXInterface` from electron types
- Electron API: Via `window.electronAPI`

## Browser Compatibility

Requires modern browser with:
- ES6+ support
- CSS Grid and Flexbox
- Promise support
- Electron environment for KNX functionality