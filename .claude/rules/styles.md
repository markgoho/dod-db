---
paths: "hugo/**/*.scss"
---

## MANDATORY: Use Design Tokens Only

**NEVER use hard-coded values. ALWAYS use design tokens.**

### Colors

❌ FORBIDDEN: `#fff`, `white`, `black`, `rgb()`, `rgba()`, hex codes
✅ REQUIRED: `--tan-000`, `--tan-900`, `--brown-*`, `--olive-*`, `--teal-*`, `color-mix(in srgb, var(--tan-000) X%, transparent)`

### Spacing (padding, margin, gap)

❌ FORBIDDEN: `0.5rem`, `1rem`, `16px`, any hard-coded length
✅ REQUIRED: `--space-4xs`, `--space-3xs`, `--space-2xs`, `--space-xs`, `--space-s`, `--space-m`, `--space-l`, `--space-xl`, `--space-2xl`, `--space-3xl`

### Borders

❌ FORBIDDEN: `1px`, `2px`, `5px`, `0.25rem`, any hard-coded width/radius
✅ REQUIRED: `--border-width-sm`, `--border-width-md`, `--border-radius-sm`, `--border-radius-md`

### Typography (font-size)

❌ FORBIDDEN: `1rem`, `1.5rem`, `clamp()`, any hard-coded size
✅ REQUIRED: `--step--2`, `--step--1`, `--step-0`, `--step-1`, `--step-2`, `--step-3`, `--step-4`, `--step-5`, `--step-6`, `--font-decorative-md`, `--font-decorative-lg`

**If a needed token doesn't exist, ASK before adding it. Never hard-code.**
