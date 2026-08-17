# Portfolio Website

A personal portfolio website built with Astro, featuring multilingual support (Japanese/English) and dark mode. Ships **zero JavaScript bundles** — only a few KB of inline script for the theme toggle and animations.

> 📖 [日本語版のREADMEはこちら](docs/README_jp.md)

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 7 (static output)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Internationalization**: `src/pages/[locale]/` dynamic routes + `getStaticPaths()`
- **Content**: Astro Content Collections (`glob` loader)
- **Icons**: [astro-icon](https://www.astroicon.dev/) + Iconify (`heroicons`, `fa6-brands`), inlined at build time
- **Fonts**: [Fontsource](https://fontsource.org/) Geist / Geist Mono (self-hosted)
- **Linting/Formatting**: [Biome](https://biomejs.dev/) 2.4.16
- **Hosting**: Vercel (static)

## Features

- 🌐 Multilingual support (Japanese/English)
- 🌓 Dark mode support (no flash on load)
- 📱 Responsive design
- 📝 Blog functionality
- 👤 Profile page
- 🏢 Experience/Resume page
- ⚡ Zero client-side JavaScript bundles

## Setup

### Requirements

- Node.js 24.7.0 (can be automatically installed using [mise](https://mise.jdx.dev/))
- pnpm 10.14.0 (required — npm/yarn are blocked via `engines`)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to view the site.

## Development Commands

```bash
# Start development server
pnpm dev

# Type-check and build for production (outputs to dist/)
pnpm build

# Serve the built output locally
pnpm preview

# Run linting
pnpm lint

# Run linting with auto-fix
pnpm lint:fix

# Format code
pnpm format
```

## Project Structure

```
portfolio/
├── src/
│   ├── pages/
│   │   ├── [locale]/           # Multilingual routes (getStaticPaths)
│   │   │   ├── blog/
│   │   │   │   ├── index.astro # Blog list
│   │   │   │   └── [slug].astro# Blog detail
│   │   │   ├── experience.astro
│   │   │   ├── profile.astro
│   │   │   └── index.astro     # Home page
│   │   └── 404.astro
│   ├── layouts/
│   │   └── Base.astro          # html/head/body, theme script, Header, Footer
│   ├── components/
│   │   ├── Header.astro        # Nav, theme toggle, language switcher
│   │   ├── Footer.astro
│   │   ├── Tilt.astro          # 3D hover effect
│   │   ├── TypingText.astro    # Typing animation
│   │   └── AboutCard.astro
│   ├── i18n/
│   │   └── ui.ts               # Locales, typed messages, helpers
│   ├── styles/
│   │   └── global.css          # Tailwind entry + custom CSS
│   └── content.config.ts       # Blog content collection
├── content/blog/{locale}/{year}/{slug}.md
├── messages/                   # Translation files
│   ├── en.json
│   └── ja.json
├── public/                     # Static assets
├── astro.config.mjs
├── vercel.json                 # Root redirect + security headers
├── biome.json
├── mise.toml
└── package.json
```

## Internationalization

- Supported languages: Japanese (`ja`), English (`en`)
- Translation files: `messages/ja.json`, `messages/en.json`
- URL structure: `/{locale}/...` (e.g., `/ja/profile`, `/en/profile`)
- `/` redirects to `/en` via `vercel.json`

When adding new translation keys, add them to both `messages/ja.json` and `messages/en.json`, and update the `Messages` interface in `src/i18n/ui.ts`.
