---
implements: src/components/Toolbar.tsx
status: implemented
---

# Toolbar

Horizontal action bar below the header. Contains all primary actions and search.

## Layout

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [📂 Open File] [💾 Save File] [🔌 Select Interface] [↻ Refresh] [🗑 Clear]  │  [Search telegrams…  ×]  │
│ ◄─────────── left section ───────────────────────────────────────────────────►  ◄── right section ──► │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Flexbox, `justify-content: space-between`
- Background: `#fafafa`, bottom border `#e0e0e0`, subtle shadow
- Padding: 12px vertical, 20px horizontal

## Buttons

All buttons follow the same pattern: icon (16px) + label, 1px colored border, white fill.

| Button           | Border color | Connected state                       |
| ---------------- | ------------ | ------------------------------------- |
| Open File        | `#4caf50`    | Always visible                        |
| Save File        | `#9c27b0`    | Disabled when no telegrams            |
| Select Interface | `#ff9800`    | Replaced by Disconnect when connected |
| Disconnect       | `#f44336`    | Only shown when connected             |
| Refresh          | `#2196f3`    | Always visible                        |
| Clear            | `#ff5722`    | Always visible                        |

### Connecting state

When connecting, the Select Interface button shows:

```
[⟳ Connecting...]    (spinner icon + text, orange border)
```

## Search Bar

```
┌────────────────────────────────┐
│ Search telegrams…            × │
└────────────────────────────────┘
```

- Width: 200px
- Clear button (×): appears only when search has text
- Focus ring: blue (`#2196f3`) with 2px spread
- Searches across: service, connectionName, rawData, timestamp, payloadType, sourceAddress, destinationAddress, payload

## Props

| Prop                | Type                      | Description                         |
| ------------------- | ------------------------- | ----------------------------------- |
| `isConnected`       | `boolean`                 | Show Disconnect vs Select Interface |
| `isConnecting`      | `boolean`                 | Show spinner on interface button    |
| `onOpenFile`        | `() => void`              | Open file dialog                    |
| `onSaveFile`        | `() => void`              | Save telegrams to XML               |
| `onSelectInterface` | `() => void`              | Open interface selector modal       |
| `onDisconnect`      | `() => void`              | Disconnect from KNX interface       |
| `onRefresh`         | `() => void`              | Reload file or prompt for file      |
| `onClear`           | `() => void`              | Reset all application state         |
| `searchFilter`      | `string`                  | Current search value                |
| `onSearchChange`    | `(value: string) => void` | Search input change handler         |
| `hasTelegrams`      | `boolean`                 | Controls Save File enabled state    |
