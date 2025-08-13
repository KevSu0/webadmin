# Style Guide

This project uses a small set of design tokens to keep the interface consistent and mobile friendly.

## Colors

| Token | Value |
|-------|-------|
| primary | `#6366F1` |
| secondary | `#EC4899` |
| accent | `#F59E0B` |
| success | `#10B981` |
| error | `#EF4444` |
| warning | `#FBBF24` |
| info | `#3B82F6` |

## Fonts

- **sans**: Inter, system-ui, sans-serif
- **heading**: Poppins, system-ui, sans-serif

## Border Radius

- `xl` – 1rem
- `2xl` – 1.5rem

These tokens live in `src/lib/design-tokens.ts` and are mirrored in `tailwind.config.js` for Tailwind utility classes.

## Components

### Button

Use the shared `Button` component for actions. It supports `primary`, `secondary`, `accent`, and `ghost` variants and applies the appropriate design tokens for color and focus styles.

### Badge

`Badge` displays small status indicators like points or levels. Variants include `info`, `success`, `warning`, and `error`.
