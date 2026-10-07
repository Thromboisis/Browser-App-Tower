# App Tower - Chrome Extension (Manifest V3)

A Chrome extension replicating the Microsoft Edge "App Tower" docked sidebar with 1-click borderless Google Keep and Google Messages companion windows (zero iframes, zero 403 errors), customizable URLs, and Mobile vs. Desktop viewport options.

## Key Features

1. **Manifest V3 Architecture**:
   - Modern service worker (`background.js`) managing companion windows via `chrome.windows.create({ type: 'popup' })`.
   - Bypasses all `X-Frame-Options` and `Content-Security-Policy: frame-ancestors` restrictions by opening real native browser windows rather than blocked iframes.

2. **Firmly Docked (Non-Floating) Sidebar**:
   - The 44px sidebar rail is anchored firmly flush against the right edge.
   - Pushes page layout by reserving a `44px` margin (`html.app-tower-docked { margin-right: 44px }`) so webpage content never hides behind the sidebar.

3. **Toolbar Toggle Button**:
   - The collapse option is placed in the Chrome extension toolbar action button (`chrome.action.onClicked`).
   - Clicking the toolbar extension icon toggles the dock expanded or collapsed.

4. **Configurable Apps (+ Button to Add, Right-Click to Edit, Drag to Re-Order)**:
   - **Drag & Drop Re-Ordering**: Click and drag any icon in the sidebar rail up or down to instantly re-arrange your apps; the order is saved automatically.
   - Starts directly with your apps (top logo removed).
   - Bottom `+` (Plus) button lets you add any web app or bookmark with a custom URL.
   - Google Keep and Google Messages are part of this unified configurable system.
   - Right-click context menu on any app icon provides:
     - **Edit App & URL...**: Opens the configuration modal prefilled with current Name, URL, and Viewport mode.
     - **Reset size & location**: Reverts the companion window to default geometry.
     - **Remove from dock**: Deletes custom apps from your sidebar rail.

5. **Mobile vs. Desktop User-Agent Switching**:
   - In both the Add and Edit pop-up modals, a slider switch lets you choose between:
     - 🖥️ **Desktop Layout**: Standard desktop User-Agent string. The website serves its desktop web application.
     - 📱 **Mobile Layout**: Emulates a real smartphone User-Agent (`Linux; Android 14; Pixel 8 ... Mobile Safari`) and `Sec-CH-UA-Mobile: ?1` via Chrome's `declarativeNetRequest`.
     - When toggled, the open companion window immediately reloads so the website detects the phone User-Agent and switches to its mobile interface!

6. **Per-App Window Sizing & Location Persistence**:
   - Drag or resize any app window; its exact coordinates (`left`, `top`, `width`, `height`) are saved per-app to `chrome.storage.local`.
   - Clicking "Save App" in the Edit modal reloads the app window to switch layouts while strictly preserving its custom size and location.
   - Right-click "Reset size & location" returns that app's window back to default geometry next to the dock.

7. **Sidebar Excluded from Companion Windows**:
   - App windows opened from sidebar icons do not inject the dock rail into themselves, keeping companion windows completely clean and distraction-free.

8. **Smart "Save App" Change Detection**:
   - The "Save App" button only activates if genuine modifications were made compared to the currently saved settings (e.g. toggling mobile and toggling back resets to inactive).

## Note on Restricted Chrome Pages

Google Chrome has a built-in security policy that **strictly prevents all extensions from injecting content scripts into certain internal and Google pages**:
- `https://chromewebstore.google.com/` (Chrome Web Store)
- `chrome://*` (e.g., `chrome://extensions`, `chrome://settings`, `chrome://newtab`)

This is a native browser security restriction enforced by Google so extensions cannot tamper with the Web Store or install software without user interaction. The sidebar dock works on all standard web pages (e.g., Wikipedia, Google, GitHub, YouTube, Reddit, News, etc.).

## Installation in Chrome

1. Download the ZIP file using the button in the web app or grab the `/extension` directory.
2. In Google Chrome, navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in top-right corner).
4. Click **Load unpacked** and select the `extension` directory.
5. Click the extension puzzle icon in Chrome and pin **App Tower Sidebar** to your toolbar.
6. Open any webpage (e.g. `https://en.wikipedia.org`):
   - Click the toolbar extension icon to toggle the dock open/closed.
   - Click Keep or Messages to launch a floating companion window.
   - Click the `+` button at the bottom of the dock to add your own apps.
   - Right-click any icon to Edit its URL/mode or Reset its window geometry!
