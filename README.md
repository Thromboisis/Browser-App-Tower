# App Tower Sidebar 🚀

> A Microsoft Edge–style "App Tower" docked sidebar extension (Manifest V3) for **Google Chrome**, **Microsoft Edge**, **Brave**, and **Mozilla Firefox**. Featuring 1-click borderless companion windows for Google Keep, Google Messages, and any custom web app — **100% immune to Google 403 Forbidden errors and iframe blocking**.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Browsers](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Firefox-success.svg)](#supported-browsers)
[![Architecture](https://img.shields.io/badge/Architecture-Native%20Companion%20Windows%20(No--Iframe)-emerald.svg)](#why-the-no-iframe-architecture-works)
[![License](https://img.shields.io/badge/License-Apache--2.0-orange.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Why the No-Iframe Architecture Works](#why-the-no-iframe-architecture-works)
- [Key Features](#key-features)
  - [1. Strictly Non-Floating Docked Rail](#1-strictly-non-floating-docked-rail)
  - [2. Independent Per-Tab Collapse State](#2-independent-per-tab-collapse-state)
  - [3. Full-Viewport SPA & Universal Overlay Guard](#3-full-viewport-spa--universal-overlay-guard)
  - [4. Seamless Slide Transitions & Background Blending](#4-seamless-slide-transitions--background-blending)
  - [5. Fully Configurable App Launcher & Drag-and-Drop](#5-fully-configurable-app-launcher--drag-and-drop)
  - [6. Mobile vs. Desktop User-Agent Switching](#6-mobile-vs-desktop-user-agent-switching)
  - [7. Per-App Window Geometry Memory](#7-per-app-window-geometry-memory)
  - [8. Toolbar Action Toggle](#8-toolbar-action-toggle)
  - [9. Crisp CSP-Immune Favicons](#9-crisp-csp-immune-favicons)
- [Interactive Web Simulator & Developer Workbench](#interactive-web-simulator--developer-workbench)
- [Supported Browsers](#supported-browsers)
- [Installation Guide](#installation-guide)
  - [Google Chrome / Microsoft Edge / Brave](#google-chrome--microsoft-edge--brave)
  - [Mozilla Firefox](#mozilla-firefox)
- [Note on Browser-Restricted Pages](#note-on-browser-restricted-pages)
- [Project Structure](#project-structure)
- [Development & Build Commands](#development--build-commands)
- [Manifest & Permissions Breakdown](#manifest--permissions-breakdown)
- [License](#license)

---

## Overview

Microsoft Edge includes a native sidebar rail ("App Tower") allowing users to dock quick-access productivity utilities (notes, messengers, tools) alongside their active browsing session without switching tabs or losing screen context.

Traditional Chrome extensions attempt to replicate this using `<iframe>` elements embedded into host web pages. However, modern web security protocols cause this approach to fail:
- Google services (**Google Keep**, **Google Messages**, **Calendar**, **Gmail**) enforce `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'`.
- Attempting to load them inside an `<iframe>` results in immediate **`403 Forbidden`** errors, infinite authentication loops, or blank grey screens.

**App Tower Sidebar** solves this permanently. By pairing an unobtrusive, docked HTML/CSS rail with top-level native companion popup windows (`chrome.windows.create({ type: 'popup' })`), you get the full Edge sidebar experience with zero iframes, authentic browser cookies, and zero 403 errors.

---

## Why the No-Iframe Architecture Works

| Feature | Standard `<iframe>` Sidebars | **App Tower Sidebar (Native Windows)** |
| :--- | :--- | :--- |
| **Google Keep & Messages** | ❌ Blocked (`403 Forbidden` / CSP) | ✅ **100% Functional** (Native window origin) |
| **Authentication & SSO** | ❌ Broken auth loops, third-party cookie blocks | ✅ **Native Cookies & Credentials shared** |
| **Display Scaling** | ❌ Cramped within page styling | ✅ **Freely resizable & position-aware** |
| **Mobile / Desktop Switch** | ❌ Rarely supported | ✅ **Real User-Agent & Client Hints override** |
| **Host Page Interaction** | ❌ Overlays or pushes content inconsistently | ✅ **Strict margin reservation on `html` & SPAs** |

Because companion apps open as frameless native browser popup windows docked flush beside your screen or sidebar:
1. They run in their own top-level browsing context with complete access to first-party cookies and Google account sign-in sessions.
2. They are completely exempt from `X-Frame-Options` and `frame-ancestors` iframe restrictions.
3. Once positioned, they remember their exact coordinates and dimensions per app.

---

## Key Features

### 1. Strictly Non-Floating Docked Rail
- The 44px sidebar rail is anchored flush against the right monitor edge.
- Pushes and reserves page layout by setting `margin-right: 44px !important` on `html.app-tower-docked` so webpage content never hides behind the sidebar.
- Preserves responsive design across all standard websites.

### 2. Independent Per-Tab Collapse State
- Unlike extensions that force a global toggle across all browser windows, the collapse state is **tab-isolated** using `sessionStorage`.
- You can collapse the dock on wide spreadsheets or code editors while leaving it open on documentation or communication tabs.
- Clicking the extension icon in your browser toolbar toggles visibility only for the active tab.

### 3. Full-Viewport SPA & Universal Overlay Guard
- **Outlook Web & Full-Bleed SPAs**: Outlook Web App uses fixed full-viewport containers (`#owa-root` and `body` with `right: 0`). App Tower includes dedicated layout guards that clamp these containers from `left: 0` to `right: 44px`, preventing the sidebar from hovering over email reading panes or ribbon bars.
- **Universal Overlay Protection**: An intelligent DOM mutation observer detects floating drawers and sidebars (such as Outlook's *"My Day"* pane, Jira issue drawers, or GitHub sidebars) and automatically adjusts their `right` offset so they dock flush against the sidebar rather than sliding underneath it.

### 4. Seamless Slide Transitions & Background Blending
- Both the webpage content margin and the sidebar rail slide in and out using synchronized `0.35s cubic-bezier(0.16, 1, 0.3, 1)` transitions.
- The `html` margin placeholder dynamically matches the sidebar's dark background color (`#12141a`), eliminating visual seams or white flashes during expand and collapse animations.

### 5. Fully Configurable App Launcher & Drag-and-Drop
- **Preconfigured Apps**: Comes out of the box with quick links for Google Keep and Google Messages.
- **Add Any Web App (`+`)**: Click the plus icon at the bottom of the rail to add any URL (Notion, Slack, Spotify, ChatGPT, GitHub, etc.).
- **Drag-and-Drop Reordering**: Click and drag any icon up or down to rearrange your dock; the custom order is saved automatically.
- **Right-Click Context Menu**:
  - ✏️ **Edit App & URL...**: Modify name, URL, or mobile/desktop viewport mode.
  - ↺ **Reset size & location**: Reverts the companion window to its default dock-adjacent geometry.
  - 🗑️ **Remove from dock**: Deletes custom apps from the rail.
- **Smart Change Detection**: The "Save App" modal button activates only when settings have actually changed.

### 6. Mobile vs. Desktop User-Agent Switching
- In the Add/Edit app modal, a slider allows you to choose between:
  - 🖥️ **Desktop Mode**: Standard desktop User-Agent string.
  - 📱 **Mobile Mode**: Spoofs a real mobile device (`Linux; Android 14; Pixel 8 ... Mobile Safari`) with `Sec-CH-UA-Mobile: ?1` and `Sec-CH-UA-Platform: "Android"` via `declarativeNetRequest` session rules and client-side `navigator` injection.
- When toggled, the companion window automatically reloads so the target service immediately serves its clean, vertical smartphone interface.

### 7. Per-App Window Geometry Memory
- Every companion window continuously tracks its `left`, `top`, `width`, and `height` coordinates via `chrome.windows.onBoundsChanged` and `chrome.windows.onFocusChanged`.
- Custom window sizes and placements are saved independently in `chrome.storage.local`.
- Features multi-stage positioning workarounds to overcome Chromium OS window manager cascading quirks on initial launch.

### 8. Toolbar Action Toggle
- Keep your page header tidy: the sidebar collapse/expand control is wired directly to the Chrome/Firefox extension toolbar action icon (`chrome.action.onClicked`).

### 9. Crisp CSP-Immune Favicons
- Automatically resolves authoritative high-resolution favicons for any added website using:
  1. Chrome's internal `_favicon` API.
  2. Google S2 64px service fallback.
  3. Direct origin `favicon.ico`.
- Fetches and stores icons as base64 Data URIs, guaranteeing immunity to host-page Content Security Policy (CSP) image-blocking rules.

---

## Interactive Web Simulator & Developer Workbench

This repository includes a full React 19 + Tailwind CSS developer workbench:
- **Live Simulator**: Test the sidebar against realistic simulated website environments, including:
  - Technical Documentation reader
  - Company Intranet Portal
  - Analytics Dashboard with charts
  - Full **Outlook Web App** simulation featuring the *"My Day"* slide-out pane and flush docking
  - Custom New Tab view
- **Code Viewer**: Inspect any extension file with syntax highlighting, line numbers, and live file statistics.
- **Rule Visualizer**: Interactive inspector for `declarativeNetRequest` session rules and CSP modifications.
- **1-Click Multi-Browser ZIP Exporter**: Client-side JSZip engine to package and download production-ready builds for Chrome or Firefox.

---

## Supported Browsers

| Browser | Manifest Version | Status | Notes |
| :--- | :---: | :---: | :--- |
| **Google Chrome** | MV3 | ✅ Full Support | Tested on Chrome 120+ |
| **Microsoft Edge** | MV3 | ✅ Full Support | Fully compatible with Chromium Edge |
| **Brave Browser** | MV3 | ✅ Full Support | Shields do not interfere with native popup companion windows |
| **Opera / Vivaldi** | MV3 | ✅ Full Support | Standard Chromium extension loading |
| **Mozilla Firefox** | MV3 | ✅ Full Support | Built using automatic manifest transformation script (`scripts/build-extensions.js`) |

---

## Installation Guide

### Google Chrome / Microsoft Edge / Brave

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/app-tower-sidebar.git
   cd app-tower-sidebar
   ```
2. In Chrome, open a new tab and go to:
   ```text
   chrome://extensions/
   ```
   *(For Edge, visit `edge://extensions/`; for Brave, visit `brave://extensions/`)*
3. In the top-right corner, switch on **Developer mode**.
4. Click the **Load unpacked** button.
5. In the file picker, select the `extension/` directory of this project.
6. Click the extension puzzle icon in your browser toolbar and click the **Pin** icon next to **App Tower Sidebar**.
7. Navigate to any standard website (e.g., [Wikipedia](https://en.wikipedia.org) or [GitHub](https://github.com)):
   - The App Tower sidebar will appear docked firmly to the right side of the page.
   - Click the toolbar icon to collapse or expand the dock for that tab.
   - Click Keep or Messages to launch native companion windows.
   - Click `+` to add your favorite websites!

---

### Mozilla Firefox

1. Generate the Firefox distribution:
   ```bash
   npm install
   npm run build:extensions
   ```
   This generates a Firefox-compliant package in `dist/firefox/` and `dist/app-tower-firefox.zip`.
2. Open Firefox and navigate to:
   ```text
   about:debugging#/runtime/this-firefox
   ```
3. Click **Load Temporary Add-on...**.
4. Navigate into the `dist/firefox/` directory and select `manifest.json` (or select `dist/app-tower-firefox.zip`).
5. The extension is now loaded and active in Firefox.

---

## Note on Browser-Restricted Pages

All major modern browsers (Chromium and Mozilla) enforce a strict security policy: **extensions are forbidden from injecting content scripts into browser-internal and store pages**.

The sidebar will deliberately not inject on:
- `chrome://*` (e.g., `chrome://extensions`, `chrome://settings`)
- `https://chromewebstore.google.com/`
- `about:*` (in Firefox)

This is a browser-level security sandbox rule designed to prevent extensions from tampering with user settings or silently installing extensions. The sidebar works seamlessly on all standard internet pages and web applications.

---

## Project Structure

```text
├── extension/                     # Ready-to-load browser extension (Manifest V3)
│   ├── manifest.json              # Extension metadata, permissions & content script definitions
│   ├── background.js              # Service worker managing popup windows, User-Agent & geometry
│   ├── content.js                 # Dock DOM injection, margin reservation & SPA layout guards
│   ├── styles.css                 # Sidebar rail styles, dark theme, and animation rules
│   ├── rules.json                 # DeclarativeNetRequest ruleset configuration
│   ├── newtab.html / .js / .css   # Optional clean new-tab page
│   └── icons/                     # Extension icons (16px, 48px, 128px)
├── src/                           # Companion web app & live simulator (React + Vite)
│   ├── components/
│   │   ├── LiveSimulator.tsx      # Multi-tab simulated browser environment with Outlook & SPAs
│   │   ├── CodeViewer.tsx         # In-browser extension source code explorer
│   │   ├── RuleVisualizer.tsx     # DeclarativeNetRequest session rule inspector
│   │   └── InstallGuide.tsx       # Interactive step-by-step installation instructions
│   ├── data/
│   │   └── extensionFiles.ts      # Synced extension source code used in the web viewer
│   ├── utils/
│   │   └── downloadExtension.ts   # Client-side dynamic zip generator
│   ├── App.tsx                    # Workbench main container & navigation
│   └── main.tsx                   # React root entry point
├── scripts/
│   └── build-extensions.js        # Multi-browser build & zip packaging script (Chrome & Firefox)
├── dist/                          # Generated production builds & extension ZIP archives
├── package.json                   # Project dependencies and script runner
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration with Tailwind CSS v4
└── README.md                      # Project documentation (this file)
```

---

## Development & Build Commands

To run the companion developer simulator and build extension bundles locally:

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server (port 3000)
npm run dev

# 3. Build the React companion web app
npm run build

# 4. Package extension ZIP files for Chrome & Firefox
npm run build:extensions

# 5. Type-check TypeScript files
npm run lint
```

---

## Manifest & Permissions Breakdown

| Permission | Purpose in App Tower Sidebar |
| :--- | :--- |
| `storage` | Persists user dock apps, custom ordering, per-app window geometry, and cached favicons in `chrome.storage.local`. |
| `activeTab` / `tabs` | Allows querying companion window IDs and delivering reload / layout switch signals. |
| `scripting` | Overrides client-side `navigator.userAgentData` for seamless mobile viewport emulation. |
| `declarativeNetRequest` | High-performance, declarative HTTP header modification for mobile/desktop User-Agent switching without network interception overhead. |
| `favicon` | Native permission for Chrome's high-fidelity `_favicon` service. |
| `<all_urls>` | Required so the docked companion rail can be displayed on any website you browse. |

---

## Contributing

Contributions, bug reports, and suggestions are welcome!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.
