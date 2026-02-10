---
implements: src/components/TelegramViewer.tsx
status: implemented
---

# Main Layout

The root layout of the application. Manages all top-level states and transitions.

## Screen States

The app has four mutually exclusive states:

### 1. Empty State (no file, no connection)

```
┌────────────────────────────────────────────────────────────────┐
│ Header                                                         │
│  Telegram Viewer                                               │
├────────────────────────────────────────────────────────────────┤
│ Toolbar                                                        │
│  [Open File] [Save File] [Select Interface] [Refresh] [Clear]  │
│                                           [Search telegrams…]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                                                                │
│                   No Telegram File Loaded                      │
│  Click "Open File" to load an XML telegram file and start      │
│  viewing communications.                                       │
│                                                                │
│                      [Open XML File]                           │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- Save File button: **disabled** (no telegrams)
- Large centered call-to-action button to open a file

### 2. Loading State

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                   Loading telegrams...                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│  └────────────────────────────────────────────────────────┘  │
│  Processing 2,500 of 10,000 telegrams (25.0%)                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Full-screen overlay, replaces all other content
- Progress bar with percentage and absolute counts
- Spinner shown if progress info not yet available

### 3. Error State

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  Error Loading Telegrams                     │
│                  <error message text>                        │
│                                                              │
│                       [Retry]                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4. Data View (file loaded or live connection)

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
│  Telegram Viewer                                             │
│  File: sample.xml | ConnectionName | Busmonitor | host:port  │
├──────────────────────────────────────────────────────────────┤
│ Toolbar                                                      │
├────────────────────────┬─────────────────────────────────────┤
│ Telegram List          │ Telegram Detail                     │
│                        │                                     │
│ Telegrams (1,234)      │ Telegram Details                    │
│ ┌────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ 12:00:01  L_Data   │ │ │ Timestamp                       │ │
│ │ conn1  1.1.1→2/0/1 │ │ │   Date: 2024-01-15              │ │
│ │ 29001100…          │ │ │   Time: 12:00:01                │ │
│ ├────────────────────┤ │ │                                 │ │
│ │ 12:00:02  L_Data   │ │ │ Connection Information          │ │
│ │ conn1  1.1.2→2/0/3 │ │ │   Name: conn1                   │ │
│ │ 29003400…          │ │ │   Service: L_Data.ind           │ │
│ ├────────────────────┤ │ │   Frame: CommonEmi              │ │
│ │ …                  │ │ │                                 │ │
│ └────────────────────┘ │ │ KNX CommonEmi Data              │ │
│                        │ │   Source: 1.1.1                 │ │
│                        │ │   Dest: 2/0/1                   │ │
│                        │ │   Payload: GroupValueWrite      │ │
│                        │ │                                 │ │
│                        │ │ Raw Data                        │ │
│                        │ │   29 00 11 00 …                 │ │
│                        │ └─────────────────────────────────┘ │
└────────────────────────┴─────────────────────────────────────┘
```

- **Split pane**: list on left, detail on right
- List is virtualized for performance (10,000+ items)
- Clicking a list item shows its detail on the right

## Header Variants

### File mode

```
Telegram Viewer
File: sample.xml | ConnectionName | Busmonitor | 192.168.1.1:3671
```

### Live connection mode

```
Telegram Viewer
Live KNX Connection | Bus Monitor | ● Connected | KNX: 192.168.1.100:3671
```

The `● Connected` badge uses color `#28a745`.

## Data Flow

```
File mode:    Open File → parse XML → setCommunicationLog → render list
Live mode:    Select Interface → connect → onKNXTelegram events → append to liveTelegrams
Search:       searchFilter applied via useMemo over either telegram source
Clear:        Resets all state (telegrams, selection, file, search, errors)
```
