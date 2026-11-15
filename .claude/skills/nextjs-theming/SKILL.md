---
name: nextjs-theming
description: 'How we do scalable, themeable styling in Next.js + Tailwind projects. Use when writing or reviewing any CSS/styling, colors, dark mode, light mode, theme switching, design tokens, or when tempted to hardcode a color. Enforces CSS custom properties in globals.css, never hardcoded hex/rgb/inline colors, multiple color themes via theme classes, theme persistence via cookie, and Tailwind @theme inline mapping.'
user-invocable: false
---

# Theming & Scalable Styling

## When to Use
- Writing or reviewing any component styling in a Next.js + Tailwind project.
- Adding/adjusting colors, dark/light themes, or a new theme.
- Anytime you are about to write a color literal or inline `style` — stop and use a token instead.

## Core rules (non-negotiable)
- **Never hardcode colors** (`#fff`, `rgb(...)`, `text-red-500`) in components. Use a CSS variable: `bg-[var(--background)]`, `text-[var(--text-color)]`, `border-[var(--border-color)]`.
- **Never use inline `style={{ color: ... }}`** for themeable values. Inline style is only for truly dynamic runtime values (e.g. `width: ${percent}%`).
- **Define every design token once** in `app/globals.css`, per theme. Components only *consume* tokens.
- **One accent change re-skins the app.** If changing a brand color needs edits outside the theme block, tokens are missing.
- Use **semantic token names** (`--accent-color`, `--success-color`), not literal ones (`--purple`). Themes redefine the same semantic name.

## Where tokens live: `app/globals.css`
Fonts on `:root`; colors **per theme class**. Applying a theme = putting its class on `<html>`/`<body>`, which swaps the whole palette.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {                      /* fonts shared across themes */
  --main-font: 'Inter', sans-serif;
  --heading-font: 'Rajdhani', sans-serif;
}

.classic {                   /* each theme = one class, same token names */
  --background: #F5ECE0;
  --darker-background: #f7e2c6;
  --foreground: #693382;
  --text-color: #1d1d1d;
  --accent-color: #5F99AE;
  --accent-text: #ffffff;
  --border-color: #acacac;
  --success-color: #22c55e;
  --warning-color: #f97316;
  --info-color: #60a5fa;
  --alert-color: #ff0000;
  --success-bg: #22c55e26;
  --alert-bg: #ff000019;
  --overlay-dark: #00000099;
  --shadow-color: #0000004d;
  --logo-invert: 1;          /* asset filter that flips per theme */
}

.dark  { /* same token names, different values, --logo-invert: 0 */ }
.light { /* same set again */ }
```

### Every theme must define the SAME complete token set
Missing a token in one theme breaks that theme. Categories:
- **Surfaces**: `--background`, `--darker-background`, `--overlay-bg`, `--overlay-dark`
- **Brand**: `--foreground`, `--lighter-foreground`, `--accent-color`, `--accent-text`
- **Text**: `--text-color`, `--text-color-2`, `--disabled-text`, `--muted-color`
- **Status**: `--success-color`, `--warning-color`, `--info-color`, `--alert-color` (+ `-bg`/`-border` variants)
- **Structure**: `--border-color`, `--shadow-color`, `--glare-color`
- **Asset filters**: `--logo-invert`, `--home-logo-filter` (for PNG/SVG that must adapt per theme)

## Tailwind v4 integration (`@theme inline`)
Expose CSS variables as Tailwind color tokens so `bg-background` / `text-foreground` work:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent-color);
  --font-sans: var(--main-font);
}
```
Both `bg-[var(--background)]` (no mapping needed) and `bg-background` (needs mapping) are used in our projects — pick one per project and stay consistent with existing code.

## Smooth theme switching
```css
body {
  background-color: var(--background);
  color: var(--text-color);
  transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
```
- **Apply**: toggle the theme class on `document.documentElement.classList` (client toggle).
- **Persist**: store the choice in a `theme` cookie so SSR renders the right theme with no flash.
- **Server read**: middleware reads the `theme` cookie and forwards it (e.g. `x-theme` header) so the root layout sets the initial class server-side.
- **Assets**: images/icons that don't theme naturally use a filter token, e.g. `filter: invert(var(--logo-invert));` or `.dark .social-icon { filter: ... }`.

## Tokenize other scalable values too
- **Fonts**: `--main-font`, `--heading-font` (+ utilities like `.heading-font { font-family: var(--heading-font); }`).
- **Shadows**: `--shadow`, `--shadow-hover`, reused via `.shadow-custom`.
- **Animations**: define `@keyframes` + a utility class (`.animate-slide-up`), don't repeat inline.
- **Prose**: override `@tailwindcss/typography` colors to CSS variables so rich text respects the theme.

## Review checklist
- [ ] No hardcoded hex/rgb/`text-*-500` literals in components.
- [ ] No inline `style` for themeable values.
- [ ] Any new token added to **every** theme block.
- [ ] Token names are semantic, not literal colors.
- [ ] Theme switch animates and persists (cookie + class).
- [ ] Themeable assets use a filter/variable, not a fixed asset.
