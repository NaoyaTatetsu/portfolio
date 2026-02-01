# Portfolio Website

A personal portfolio website built with Next.js, featuring multilingual support (Japanese/English) and dark mode.

> 📖 [日本語版のREADMEはこちら](docs/README_jp.md)

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.1.5 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19.2.1
- **Styling**: Tailwind CSS 4
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) 4.7.0
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) 0.4.6
- **Icons**: [react-icons](https://react-icons.github.io/react-icons/) 5.5.0
- **Linting/Formatting**: [Biome](https://biomejs.dev/) 2.3.8
- **React Compiler**: babel-plugin-react-compiler 1.0.0

## Features

- 🌐 Multilingual support (Japanese/English)
- 🌓 Dark mode support
- 📱 Responsive design
- 📝 Blog functionality
- 📰 News/Announcements
- 👤 Profile page
- 🏢 Experience/Resume page
- 📧 Contact page

## Setup

### Requirements

- Node.js 24.7.0 (can be automatically installed using [mise](https://mise.jdx.dev/))
- pnpm 10.14.0 (recommended)

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

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

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
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Multilingual routing
│   │   │   ├── blog/          # Blog page
│   │   │   ├── contact/       # Contact page
│   │   │   ├── experience/    # Experience/Resume page
│   │   │   ├── news/          # News page
│   │   │   ├── profile/       # Profile page
│   │   │   └── page.tsx       # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Header component
│   │   ├── Footer.tsx         # Footer component
│   │   ├── ThemeProvider.tsx  # Theme provider
│   │   └── TypingText.tsx     # Typing animation component
│   ├── i18n/                  # Internationalization setup
│   │   ├── request.ts        # i18n request configuration
│   │   └── routing.ts        # Routing configuration
│   └── proxy.ts               # Next.js proxy (formerly middleware)
├── messages/                  # Translation files
│   ├── en.json               # English translations
│   └── ja.json               # Japanese translations
├── public/                    # Static files
├── next.config.ts            # Next.js configuration
├── biome.json                # Biome configuration
├── mise.toml                 # mise configuration (Node.js version management)
└── package.json              # Dependencies and scripts
```

## Internationalization

This project uses `next-intl` for internationalization.

- Supported languages: Japanese (`ja`), English (`en`)
- Translation files: `messages/ja.json`, `messages/en.json`
- URL structure: `/{locale}/...` (e.g., `/ja/profile`, `/en/profile`)

When adding new translation keys, please add them to both `messages/ja.json` and `messages/en.json`.
