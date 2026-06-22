# Project: Arana Portfolio

This is a static portfolio website with vanilla HTML, CSS, and JavaScript. No build tools or frameworks.

## Structure
- `index.html` — Main HTML document
- `styles.css` — All styles (dark/light theme via `data-theme` attribute)
- `script.js` — All client-side JavaScript (IIFE pattern, no modules)

## Conventions
- Use `"use strict"` — already applied via IIFE
- CSS custom properties for theming under `:root` / `[data-theme="dark"]` / `[data-theme="light"]`
- Semantic HTML with ARIA attributes
- BEM-like class naming (e.g., `hero__title`, `btn--primary`)
- No external dependencies or CDN links
- Keep `prefers-reduced-motion` support in mind
