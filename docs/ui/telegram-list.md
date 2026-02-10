---
implements: src/components/VirtualizedTelegramList.tsx
status: implemented
---

# Telegram List

Virtualized scrolling list of KNX telegrams. Designed to handle 10,000+ items smoothly.

## Layout

```
┌──────────────────────────────┐
│ Telegrams (1,234)            │  ← header with count
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 12:00:01   L_Data    #1  │ │  ← timestamp, service, index
│ │ conn1  1.1.1→2/0/1       │ │  ← connection, addresses
│ │ 29001100BCC10B01…        │ │  ← raw data preview
│ ├──────────────────────────┤ │
│ │ 12:00:02   L_Data    #2  │ │
│ │ conn1  1.1.2→2/0/3       │ │
│ │ 29003400…                │ │
│ ├──────────────────────────┤ │
│ │ …                        │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

## Item Structure

Each item is 80px tall, fixed height.

```
┌──────────────────────────────────────────┐
│ Row 1:  timestamp     service       #idx │
│ Row 2:  connectionName    src → dest     │
│         rawData (truncated to 20 chars)  │
└──────────────────────────────────────────┘
```

### Selected state

- Added CSS class `.selected`
- Visual distinction via background/border highlight

## Virtualization

- **Item height**: 80px (constant)
- **Buffer**: 5 items above and below visible area
- **Technique**: Single spacer div at full height, visible items positioned absolutely via `top` offset
- Container height measured via `getBoundingClientRect` on mount + resize listener
- No auto-scroll on selection (prevents jumping during user scrolling)

## Data Display

| Field      | Source                    | Formatting                  |
| ---------- | ------------------------- | --------------------------- |
| Timestamp  | `telegram.timestamp`      | `toLocaleTimeString()`      |
| Service    | `telegram.service`        | As-is                       |
| Index      | Array position            | `#N` (1-based)              |
| Connection | `telegram.connectionName` | As-is                       |
| Addresses  | `src → dest`              | Only shown if both exist    |
| Raw data   | `telegram.rawData`        | Truncated to 20 chars + `…` |

## Props

| Prop               | Type                           | Description             |
| ------------------ | ------------------------------ | ----------------------- |
| `telegrams`        | `Telegram[]`                   | Filtered telegram array |
| `selectedTelegram` | `Telegram \| null`             | Currently selected item |
| `onSelectTelegram` | `(telegram: Telegram) => void` | Item click handler      |
