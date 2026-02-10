# UI Design System

> Design specifications for the KNX Telegram Viewer application.
> These specs are the source of truth for UI implementation.

## Principles

1. **Information density** - KNX traffic analysis requires seeing many telegrams at once; maximize data visibility
2. **Minimal chrome** - UI controls stay out of the way; the data is the focus
3. **Instant feedback** - All state changes (connecting, loading, filtering) are immediately visible
4. **Consistent interaction** - Same patterns everywhere: click to select, colored borders for state, badges for status

## Color Palette

| Token             | Hex       | Usage                                  |
|--------------------|-----------|----------------------------------------|
| `primary`          | `#007acc` | Selected items, focus rings            |
| `open-file`        | `#4caf50` | Open File button                       |
| `save-file`        | `#9c27b0` | Save File button                       |
| `connect`          | `#ff9800` | Select Interface button                |
| `disconnect`       | `#f44336` | Disconnect button, errors              |
| `refresh`          | `#2196f3` | Refresh button, search focus ring      |
| `clear`            | `#ff5722` | Clear button                           |
| `error`            | `#c62828` | Error banners, parse error sections    |
| `success`          | `#28a745` | Connected badge                        |
| `text`             | `#333`    | Primary text                           |
| `text-secondary`   | `#666`    | Secondary text, labels                 |
| `text-disabled`    | `#999`    | Disabled button text                   |
| `border`           | `#e0e0e0` | Default borders, separators            |
| `border-hover`     | `#bbb`    | Hovered borders                        |
| `bg-surface`       | `#ffffff` | Cards, dialogs, inputs                 |
| `bg-toolbar`       | `#fafafa` | Toolbar background                     |
| `bg-config`        | `#f8f9fa` | Configuration sections                 |
| `bg-selected`      | `#e3f2fd` | Selected item background               |

## Typography

- **Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
- **Base size**: 13px (toolbar, list items)
- **Headings**: 1.25rem bold (dialog titles), 1rem (section headings)
- **Detail labels**: 0.85rem regular
- **Monospace data**: system monospace (raw data, hex, addresses, timestamps)

## Spacing

| Token    | Value | Usage                              |
|----------|-------|------------------------------------|
| `xs`     | 4px   | Icon-to-label gap                  |
| `sm`     | 8px   | Button gap, inline spacing         |
| `md`     | 12px  | Toolbar padding (vertical), input padding |
| `lg`     | 20px  | Toolbar padding (horizontal), section margins, dialog padding |
| `xl`     | 24px  | Major section separation           |

## Interaction Patterns

- **Buttons**: 1px colored border, white fill. On hover: fill with border color, text goes white, slight lift (`translateY(-1px)`)
- **Selection**: Blue border + light blue background (`#e3f2fd`)
- **Focus**: Blue outline ring (`box-shadow: 0 0 0 2px rgba(33,150,243,0.2)`)
- **Disabled**: `opacity: 0.6`, `cursor: not-allowed`, no hover effect
- **Transitions**: 200ms ease for colors/borders, 150ms for transforms

## Component Specs

| Component           | Spec file                                      | Implementation                                              |
|---------------------|-------------------------------------------------|-------------------------------------------------------------|
| Main layout         | [main-layout.md](main-layout.md)               | [TelegramViewer.tsx](../../src/components/TelegramViewer.tsx)|
| Toolbar             | [toolbar.md](toolbar.md)                        | [Toolbar.tsx](../../src/components/Toolbar.tsx)              |
| Telegram list       | [telegram-list.md](telegram-list.md)            | [VirtualizedTelegramList.tsx](../../src/components/VirtualizedTelegramList.tsx) |
| Telegram detail     | [telegram-detail.md](telegram-detail.md)        | [TelegramDetail.tsx](../../src/components/TelegramDetail.tsx)|
| Interface selector  | [InterfaceSelector.md](InterfaceSelector.md)    | [InterfaceSelector.tsx](../../src/components/InterfaceSelector.tsx) |
| Interface wireframe | [InterfaceSelector-Wireframe.md](InterfaceSelector-Wireframe.md) | (see above) |
