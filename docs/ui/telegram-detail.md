---
implements: src/components/TelegramDetail.tsx
status: implemented
---

# Telegram Detail

Right-side panel showing full details of the selected telegram.

## Empty State

```
┌─────────────────────────────────────┐
│                                     │
│         No telegram selected        │
│  Select a telegram from the list    │
│  to view its details.               │
│                                     │
└─────────────────────────────────────┘
```

## Data View

```
┌─────────────────────────────────────┐
│ Telegram Details                    │
├─────────────────────────────────────┤
│                                     │
│ Timestamp                           │
│   Date:   2024-01-15                │
│   Time:   12:00:01                  │
│   ISO:    2024-01-15T12:00:01.000Z  │  ← monospace
│                                     │
│ Connection Information              │
│   Connection Name:  conn1           │
│   Service:          L_Data.ind      │  ← badge style
│   Frame Format:     CommonEmi       │
│                                     │
│ KNX CommonEmi Data                  │  ← only if CommonEmi + no parse error
│   Source Address:      1.1.1        │  ← monospace, .knx-address
│   Destination Address: 2/0/1        │
│   Payload Type:        GroupValueWrite │
│   Payload:             00           │  ← monospace
│   Format:              Standard CommonEmi │
│   Control Byte 1:      B0           │  ← monospace
│   Control Byte 2:      E1           │
│   Transport Layer:     00           │
│   APCI:                0080         │  ← monospace
│                                     │
│ Raw Data                            │
│   Length: 11 bytes                  │
│   ┌─────────────────────────────┐   │
│   │ 29 00 B0 E1 11 01 08 01     │   │  ← formatted hex pairs, monospace
│   │ 00 00 80                    │   │
│   ├─────────────────────────────┤   │
│   │ Original: 2900B0E1…         │   │  ← unformatted
│   └─────────────────────────────┘   │
│                                     │
│ Identification                      │
│   ID: abc-123-def                   │  ← monospace
│                                     │
└─────────────────────────────────────┘
```

## Sections

All sections follow a consistent pattern: `<h3>` heading, then key-value pairs as `<label>:<span>`.

| Section                | Condition                                        | Fields shown                                                                |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Timestamp              | Always                                           | Date, Time, ISO                                                             |
| Connection Information | Always                                           | Name, Service, Frame                                                        |
| KNX CommonEmi Data     | `frameFormat === 'CommonEmi'` and no parse error | Source, Dest, Payload Type, Payload, Format, Control bytes, Transport, APCI |
| Parse Error            | `telegram.parseError` exists                     | Error message (red)                                                         |
| Raw Data               | Always                                           | Length, hex pairs, original                                                 |
| Identification         | Always                                           | ID                                                                          |

### Conditional fields in CommonEmi section

Each field only renders if its value is truthy (e.g., `sourceAddress`, `payload`, `controlByte1` may be absent).

## Props

| Prop       | Type               | Description       |
| ---------- | ------------------ | ----------------- |
| `telegram` | `Telegram \| null` | Selected telegram |
