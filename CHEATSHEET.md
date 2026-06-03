# Design System Cheatsheet

Quick reference for the most commonly used design tokens.

> **Prefer components.** Import `Button`, `Card`, `Input`, `StatusBadge`, `IconBox`, `KpiCard`,
> `CopyChip`, `PageHeader`, `EmptyState`, etc. from `@/design-system`. The raw token snippets below
> are for building something custom. Browse all of them live at the `/design-system` route.

## 🎨 Colors

### Semantic (Theme-Aware)

```css
/* Backgrounds */
var(--ds-bg)           /* Default background */
var(--ds-bg-subtle)    /* Subtle background */
var(--ds-bg-muted)     /* Muted background */
var(--ds-bg-hover)     /* Hover state */

/* Text */
var(--ds-fg)           /* Default text */
var(--ds-fg-muted)     /* Muted text */
var(--ds-fg-subtle)    /* Subtle text */

/* Borders */
var(--ds-border)       /* Default border */
var(--ds-border-muted) /* Subtle border */

/* Primary */
var(--ds-primary)      /* Primary color */
var(--ds-primary-hover)/* Primary hover */
var(--ds-primary-fg)   /* Text on primary */

/* Status Colors */
var(--ds-success)      /* Success */
var(--ds-warning)      /* Warning */
var(--ds-danger)       /* Danger */
var(--ds-info)         /* Info */
```

## 📏 Spacing

```css
var(--ds-space-0)      /* 0 */
var(--ds-space-1)      /* 4px */
var(--ds-space-2)      /* 8px */
var(--ds-space-3)      /* 12px */
var(--ds-space-4)      /* 16px */
var(--ds-space-6)      /* 24px */
var(--ds-space-8)      /* 32px */
var(--ds-space-12)     /* 48px */
var(--ds-space-16)     /* 64px */
```

## 📝 Typography

### Font Sizes
```css
var(--ds-font-size-xs)    /* 12px */
var(--ds-font-size-sm)    /* 14px */
var(--ds-font-size-base)  /* 16px */
var(--ds-font-size-lg)    /* 18px */
var(--ds-font-size-xl)    /* 20px */
var(--ds-font-size-2xl)   /* 24px */
var(--ds-font-size-3xl)   /* 30px */
```

### Display sizes (product type scale)
```css
var(--ds-font-size-2xs)         /* 11px — eyebrows, dense labels (text-2xs) */
var(--ds-font-size-md)          /* 15px (text-md) */
var(--ds-font-size-display-sm)  /* 22px — compact page titles (text-display-sm) */
var(--ds-font-size-display)     /* 26px — page titles (text-display) */
var(--ds-font-size-display-lg)  /* 28px (text-display-lg) */
```

### Font Weights
```css
var(--ds-font-weight-normal)    /* 400 */
var(--ds-font-weight-medium)    /* 500 */
var(--ds-font-weight-semibold)  /* 600 */
var(--ds-font-weight-bold)      /* 700 */
```

### Tracking & composite text classes
```css
var(--ds-tracking-tight)  /* -0.025em */   var(--ds-tracking-wide)  /* 0.025em */

/* Composite typography — ready-made classes (font + size + weight + leading) */
.ds-text-heading-xs … .ds-text-heading-2xl
.ds-text-body-xs … .ds-text-body-lg
.ds-text-label-sm … .ds-text-label-lg
.ds-text-code-sm / .ds-text-code-md
```

## 🔲 Border Radius

```css
var(--ds-radius-sm)    /* 4px */
var(--ds-radius-md)    /* 8px */
var(--ds-radius-lg)    /* 10px */
var(--ds-radius-xl)    /* 12px */
var(--ds-radius-2xl)   /* 16px */
var(--ds-radius-full)  /* 9999px */
```

## 💫 Shadows

```css
var(--ds-shadow-xs)    /* Extra small */
var(--ds-shadow-sm)    /* Small */
var(--ds-shadow-md)    /* Medium */
var(--ds-shadow-lg)    /* Large */
var(--ds-shadow-xl)    /* Extra large */
var(--ds-shadow-2xl)   /* 2X large */

/* Product card shadows */
var(--ds-shadow-card)               /* soft card */
var(--ds-shadow-card-hover)         /* lift on hover */
var(--ds-shadow-card-hover-accent)  /* brand-tinted lift */
```

## 🧱 Z-index

```css
var(--ds-z-base)     /* 0 */      var(--ds-z-overlay)  /* 1200 */
var(--ds-z-dropdown) /* 1000 */   var(--ds-z-modal)    /* 1300 */
var(--ds-z-sticky)   /* 1100 */   var(--ds-z-popover)  /* 1400 */
var(--ds-z-toast)    /* 1500 */   var(--ds-z-tooltip)  /* 1600 */
```

## 🎞️ Motion

```css
var(--ds-duration-fast)  /* 150ms */   var(--ds-ease-standard)    /* cubic-bezier(.2,0,0,1) */
var(--ds-duration-base)  /* 200ms */   var(--ds-ease-accelerate)
var(--ds-duration-slow)  /* 300ms */   var(--ds-ease-decelerate)
```

## 📐 Breakpoints

```css
var(--ds-bp-sm)  /* 640px */    var(--ds-bp-lg)  /* 1024px */   var(--ds-bp-2xl) /* 1536px */
var(--ds-bp-md)  /* 768px */    var(--ds-bp-xl)  /* 1280px */
```
(Informational — Tailwind owns the real responsive breakpoints via `sm:` / `md:` / `lg:` …)

## 🔧 Common Patterns

### Button
```tsx
<button style={{
  backgroundColor: 'var(--ds-primary)',
  color: 'var(--ds-primary-fg)',
  padding: 'var(--ds-space-2) var(--ds-space-4)',
  borderRadius: 'var(--ds-radius-md)',
  fontSize: 'var(--ds-font-size-sm)',
  fontWeight: 'var(--ds-font-weight-medium)',
}}>
  Button
</button>
```

### Card
```tsx
<div style={{
  backgroundColor: 'var(--ds-bg)',
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--ds-radius-lg)',
  padding: 'var(--ds-space-6)',
  boxShadow: 'var(--ds-shadow-sm)',
}}>
  Content
</div>
```

### Input
```tsx
<input style={{
  backgroundColor: 'var(--ds-bg-muted)',
  color: 'var(--ds-fg)',
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--ds-radius-md)',
  padding: 'var(--ds-space-2) var(--ds-space-3)',
  fontSize: 'var(--ds-font-size-sm)',
}} />
```

### Alert
```tsx
<div style={{
  backgroundColor: 'var(--ds-success-subtle)',
  color: 'var(--ds-success-fg)',
  border: '1px solid var(--ds-success)',
  borderRadius: 'var(--ds-radius-md)',
  padding: 'var(--ds-space-4)',
}}>
  Success message
</div>
```

## 🌓 Dark Mode

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check if dark mode is active
const isDark = document.documentElement.classList.contains('dark');
```

## 📦 TypeScript Import

```tsx
import { tokens } from '@/design-system';

// Use tokens
tokens.semantic.bg.default
tokens.space[4]
tokens.radius.lg
tokens.font.size.sm
```

## 🎯 Tailwind Classes

Named, theme-aware utilities (bridged to `--ds-*` in `theme.css` — preferred):

```tsx
// Surfaces
className="bg-background"      // page
className="bg-card"            // card surface
className="bg-bg-subtle"       // bg-bg-muted / bg-bg-hover / bg-bg-elevated

// Text
className="text-foreground"    // text-muted-foreground / text-fg-muted / text-fg-subtle

// Borders
className="border-border"      // border-border-muted / border-border-strong

// Brand + status (each: bg-*, text-*-fg, bg-*-subtle, border-*/20)
className="bg-primary text-primary-foreground"   // brand
className="bg-success/10 text-success"           // text-success-fg, bg-warning, bg-danger, bg-info, …

// Type scale (custom sizes registered in utils/cx.ts)
className="text-2xs"   // text-md / text-display-sm / text-display / text-display-lg
```

Arbitrary values still work when no named utility exists:
`className="p-[var(--ds-space-4)]"`, `className="shadow-[var(--ds-shadow-card)]"`.

## ⚡ Quick Reference Tables

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Tight gaps |
| 2 | 8px | Small padding |
| 3 | 12px | Default gaps |
| 4 | 16px | Standard padding |
| 6 | 24px | Section spacing |
| 8 | 32px | Large spacing |
| 12 | 48px | Extra large |

### Font Sizes
| Token | Value | Usage |
|-------|-------|-------|
| xs | 12px | Captions, labels |
| sm | 14px | Body text, buttons |
| base | 16px | Default body |
| lg | 18px | Subheadings |
| xl | 20px | Small headings |
| 2xl | 24px | Medium headings |
| 3xl | 30px | Large headings |

### Status Colors
| Status | Use For |
|--------|---------|
| success | Confirmations, completed states |
| warning | Cautions, pending actions |
| danger | Errors, destructive actions |
| info | Informational messages |

## 💡 Pro Tips

1. **Always use semantic tokens** for colors (not raw color values)
2. **Stick to spacing scale** (don't use arbitrary values)
3. **Test in dark mode** after implementing
4. **Use TypeScript imports** for autocomplete
5. **Keep components token-based** (no hardcoded values)

## 🔗 Quick Links

- Full docs: [README.md](./README.md)
- Quick start: [QUICK_START.md](./QUICK_START.md)
- Runnable example: [examples/react-integration.tsx](./examples/react-integration.tsx)
- Live catalog: the `/design-system` route (all tokens + components, light & dark)

---

**Print this page for quick reference! 📋**
