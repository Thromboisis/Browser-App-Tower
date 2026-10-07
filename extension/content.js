/**
 * App Tower - Chrome Extension Content Script (Manifest V3)
 * Injects a firmly docked (non-floating) vertical sidebar rail on the right edge.
 * Pushes and reserves 44px page margin so the sidebar NEVER floats over webpage content.
 * Launches frameless companion windows adjacent to the docked rail with per-app size/location memory.
 * Excludes the sidebar from companion app windows created by App Tower.
 * Features a movable floating Add/Edit App modal positioned to the left of the sidebar (no page blur).
 * Supports Mobile vs Desktop User-Agent layout switching with tab refresh and red warning text.
 * Ensures the "Save App" button is only active when genuine changes are made compared to saved settings.
 */

(function () {
  'use strict';

  // Prevent multiple injections in same frame
  if (document.getElementById('app-tower-root')) {
    return;
  }

  // Check if current window is a companion app window created by App Tower
  // App windows created from clicking a sidebar icon should NOT have a sidebar inside them!
  chrome.runtime.sendMessage({ action: 'check_is_companion_window' }, (response) => {
    if (chrome.runtime.lastError) {
      // In case of error or disconnected context, proceed
      initAppTowerDock();
      return;
    }
    if (response && response.isCompanion) {
      // Companion window detected: skip sidebar insertion!
      console.log('[App Tower] Companion app window detected - sidebar rail is excluded.');
      return;
    }
    initAppTowerDock();
  });

  function initAppTowerDock() {
    if (document.getElementById('app-tower-root')) {
      return;
    }

    // 1. Reserve 44px on right edge of page content (Strictly Non-Floating)
    const DOCK_WIDTH = 44;
    const originalMarginRight = document.documentElement.style.marginRight || '';

    function reserveDockMargin() {
      document.documentElement.style.setProperty('margin-right', `${DOCK_WIDTH}px`, 'important');
      document.documentElement.style.setProperty('box-sizing', 'border-box', 'important');
    }

    function restoreDockMargin() {
      if (originalMarginRight) {
        document.documentElement.style.marginRight = originalMarginRight;
      } else {
        document.documentElement.style.removeProperty('margin-right');
      }
    }

    // 2. Create Host Container with Isolated Shadow DOM
    const host = document.createElement('div');
    host.id = 'app-tower-root';
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw';
    host.style.height = '100vh';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '2147483645';
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // 3. Inject CSS Styles Directly into Shadow DOM
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      :host {
        --dock-width: 44px;
        --bg-primary: #12141a;
        --bg-hover: #1e222d;
        --bg-active: #252b3b;
        --accent-blue: #3b82f6;
        --border-subtle: rgba(255, 255, 255, 0.08);
        --text-primary: #f8fafc;
        --text-muted: #94a3b8;
        all: initial;
      }

      .app-tower-dock {
        pointer-events: auto !important;
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: var(--dock-width) !important;
        height: 100vh !important;
        background: var(--bg-primary) !important;
        border-left: 1px solid var(--border-subtle) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 12px 0 16px 0 !important;
        z-index: 2147483645 !important;
        box-sizing: border-box !important;
        user-select: none !important;
        box-shadow: -2px 0 12px rgba(0, 0, 0, 0.4) !important;
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease !important;
      }

      .app-tower-dock.collapsed {
        transform: translateX(100%) !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .dock-section {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 100% !important;
        gap: 8px !important;
      }

      .dock-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
        position: relative;
        padding: 0;
        outline: none;
        flex-shrink: 0;
      }

      .dock-btn svg {
        width: 18px;
        height: 18px;
        transition: transform 0.15s ease;
      }

      .dock-btn:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      .dock-btn.active {
        background: var(--bg-active);
        color: var(--accent-blue);
      }

      .dock-btn.active::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background: var(--accent-blue);
        border-radius: 2px 0 0 2px;
      }

      .dock-btn[draggable="true"] {
        cursor: grab;
      }

      .dock-btn.dragging {
        opacity: 0.35 !important;
        transform: scale(0.92) !important;
        cursor: grabbing !important;
      }

      /* Placeholder dotted square indicating drop target destination */
      .dock-drop-placeholder {
        width: 36px;
        height: 36px;
        margin: 3px 0;
        border-radius: 8px;
        border: 2px dotted #60a5fa;
        background: rgba(59, 130, 246, 0.16);
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.35);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: dock-placeholder-pulse 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }

      .dock-drop-placeholder::after {
        content: '';
        width: 14px;
        height: 14px;
        border: 1.5px dotted rgba(147, 197, 253, 0.75);
        border-radius: 4px;
        box-sizing: border-box;
      }

      @keyframes dock-placeholder-pulse {
        0%, 100% { opacity: 0.95; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.96); }
      }

      .dock-divider {
        width: 22px;
        height: 1px;
        background: var(--border-subtle);
        margin: 6px 0;
      }

      /* Clean pure white plus symbol button with no background */
      .dock-btn-add {
        background: transparent !important;
        border: none !important;
        color: #ffffff !important;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        outline: none;
        transition: transform 0.15s ease, opacity 0.15s ease;
      }

      .dock-btn-add:hover {
        opacity: 0.85;
        transform: scale(1.12);
      }

      .dock-btn-add svg {
        width: 20px;
        height: 20px;
        stroke: #ffffff;
        stroke-width: 2.2;
      }

      /* Hover Tooltips */
      .dock-btn::before {
        content: attr(data-tooltip);
        position: absolute;
        right: 48px;
        top: 50%;
        transform: translateY(-50%) translateX(4px);
        background: #1e222d;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease, transform 0.15s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 2147483647;
      }

      .dock-btn:hover::before {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }

      /* Custom Context Menu */
      .dock-context-menu {
        pointer-events: auto !important;
        position: fixed !important;
        right: 48px !important;
        width: 190px !important;
        background: #181b24 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 10px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
        padding: 6px !important;
        z-index: 2147483646 !important;
        display: none !important;
        flex-direction: column !important;
        gap: 2px !important;
        user-select: none !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }

      .dock-context-menu.open {
        display: flex !important;
      }

      .context-menu-header {
        padding: 6px 8px 4px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        margin-bottom: 4px;
      }

      .context-menu-title {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .context-menu-badge {
        font-size: 9.5px;
        font-weight: 600;
        padding: 2px 5px;
        border-radius: 4px;
      }

      .context-menu-item {
        background: transparent;
        border: none;
        color: #e2e8f0;
        padding: 7px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.12s ease, color 0.12s ease;
      }

      .context-menu-item:hover {
        background: #252b3b;
        color: #ffffff;
      }

      .context-menu-item.danger:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .context-menu-item svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      /* Non-blurring Transparent Backdrop for Modal */
      .app-modal-backdrop {
        pointer-events: auto !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        z-index: 2147483646 !important;
        display: none !important;
      }

      .app-modal-backdrop.open {
        display: block !important;
      }

      /* Floating Movable Modal positioned beside sidebar dock */
      .app-modal-card {
        pointer-events: auto !important;
        position: fixed !important;
        right: 56px !important;
        top: 70px !important;
        width: 375px !important;
        max-width: calc(100vw - 70px) !important;
        background: #161922 !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 14px !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
        padding: 16px !important;
        z-index: 2147483647 !important;
        display: none !important;
        flex-direction: column !important;
        gap: 14px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        color: #f8fafc !important;
        box-sizing: border-box !important;
        animation: modalSlideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .app-modal-card.open {
        display: flex !important;
      }

      .app-modal-card.dragging {
        user-select: none !important;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.5) !important;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateX(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      .modal-drag-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 10px;
        cursor: move;
        user-select: none;
      }

      .modal-title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .modal-drag-handle {
        color: #64748b;
        display: flex;
        align-items: center;
      }

      .modal-title {
        font-size: 13.5px;
        font-weight: 600;
        color: #f8fafc;
        margin: 0;
      }

      .modal-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease;
      }

      .modal-close-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
      }

      .modal-form {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .input-label {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .text-input {
        background: #0f1117;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12.5px;
        color: #f8fafc;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        width: 100%;
        box-sizing: border-box;
      }

      .text-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }

      /* View Mode Slider / Segmented Switch */
      .view-mode-container {
        display: flex;
        flex-direction: column;
        gap: 7px;
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 10px 12px;
        border-radius: 10px;
      }

      .view-mode-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .view-mode-label {
        font-size: 11.5px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .view-mode-badge {
        font-size: 10.5px;
        font-weight: 600;
        color: #60a5fa;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(59, 130, 246, 0.15);
      }

      .slider-switch-track {
        display: flex;
        background: #0d0f14;
        border-radius: 8px;
        padding: 3px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        gap: 4px;
      }

      .slider-switch-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 10px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #94a3b8;
        font-size: 11.5px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      }

      .slider-switch-btn svg {
        width: 14px;
        height: 14px;
      }

      .slider-switch-btn.active {
        background: #252b3b;
        color: #ffffff;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }

      .slider-switch-btn.active.mobile {
        background: #10b981;
        color: #ffffff;
      }

      .view-mode-desc {
        font-size: 10.5px;
        color: #94a3b8;
        line-height: 1.4;
        margin: 0;
      }

      /* Red warning text underneath the slider when mode is toggled */
      .view-mode-warning {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 500;
        color: #f87171;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.25);
        padding: 6px 8px;
        border-radius: 6px;
        line-height: 1.35;
        margin-top: 2px;
      }

      .view-mode-warning svg {
        flex-shrink: 0;
      }

      .modal-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.12s ease;
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
      }

      .btn-primary {
        background: #3b82f6;
        border: none;
        color: #ffffff;
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.12s ease, opacity 0.12s ease;
      }

      .btn-primary:hover:not(:disabled):not(.disabled) {
        background: #2563eb;
      }

      .btn-primary:disabled,
      .btn-primary.disabled {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #64748b !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        box-shadow: none !important;
      }

      /* Floating Toast Alert */
      .dock-toast {
        pointer-events: none !important;
        position: fixed !important;
        right: 56px !important;
        background: #1e222d !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #f8fafc !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        padding: 6px 12px !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
        z-index: 2147483647 !important;
        opacity: 0 !important;
        transform: translateY(4px) !important;
        transition: opacity 0.18s ease, transform 0.18s ease !important;
      }

      .dock-toast.show {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    shadow.appendChild(styleTag);

    // 4. Default Applications
    let currentApps = [
      { id: 'keep', name: 'Google Keep', url: 'https://keep.google.com/', isMobile: false },
      { id: 'messages', name: 'Google Messages', url: 'https://messages.google.com/web', isMobile: false }
    ];

    let activeAppWindows = {};

    // 5. Build Sidebar Dock Element
    const dock = document.createElement('div');
    dock.className = 'app-tower-dock';
    dock.id = 'app-tower-dock';

    dock.innerHTML = `
      <div class="dock-section" id="app-list-container">
        <!-- App buttons dynamically injected here -->
      </div>
      <div class="dock-divider"></div>
      <div class="dock-section">
        <!-- Clean pure white plus symbol button with no background -->
        <button class="dock-btn-add" id="btn-add-app" data-tooltip="Add App to Sidebar" title="Add App to Sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    const appListContainer = dock.querySelector('#app-list-container');
    const btnAddApp = dock.querySelector('#btn-add-app');

    // Context Menu Element
    const contextMenu = document.createElement('div');
    contextMenu.className = 'dock-context-menu';
    contextMenu.id = 'dock-context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-header">
        <span class="context-menu-title" id="menu-app-title">App</span>
        <span class="context-menu-badge" id="menu-app-mode-badge">Desktop</span>
      </div>
      <button class="context-menu-item" id="menu-btn-edit-app">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit App
      </button>
      <button class="context-menu-item" id="menu-btn-reset-bounds">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        Reset Size & Location
      </button>
      <button class="context-menu-item danger" id="menu-btn-remove-app">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Remove App
      </button>
    `;

    // Toast Element
    const menuToast = document.createElement('div');
    menuToast.className = 'dock-toast';
    menuToast.id = 'dock-toast';

    // Movable Modal Backdrop (Transparent, Zero Page Blur)
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'app-modal-backdrop';
    modalBackdrop.id = 'app-modal-backdrop';

    // Movable Modal Dialog Card (Floating beside sidebar dock)
    const modalCard = document.createElement('div');
    modalCard.className = 'app-modal-card';
    modalCard.id = 'app-modal-card';
    modalCard.innerHTML = `
      <div class="modal-drag-header" id="modal-drag-header" title="Drag to reposition">
        <div class="modal-title-group">
          <span class="modal-drag-handle">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="6" r="1.5"></circle>
              <circle cx="15" cy="6" r="1.5"></circle>
              <circle cx="9" cy="12" r="1.5"></circle>
              <circle cx="15" cy="12" r="1.5"></circle>
              <circle cx="9" cy="18" r="1.5"></circle>
              <circle cx="15" cy="18" r="1.5"></circle>
            </svg>
          </span>
          <h3 class="modal-title" id="modal-title-text">Add App to Sidebar</h3>
        </div>
        <button class="modal-close-btn" id="modal-btn-close" title="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-form">
        <div class="input-group">
          <label class="input-label" for="input-app-name">App Name</label>
          <input class="text-input" type="text" id="input-app-name" placeholder="e.g. YouTube, Spotify, Keep" />
        </div>

        <div class="input-group">
          <label class="input-label" for="input-app-url">Destination URL</label>
          <input class="text-input" type="url" id="input-app-url" placeholder="https://example.com" />
        </div>

        <!-- View Mode Slider: Mobile vs Desktop (Sends User-Agent) -->
        <div class="view-mode-container">
          <div class="view-mode-header">
            <span class="view-mode-label">Browser View Mode</span>
            <span class="view-mode-badge" id="view-mode-badge-label">Desktop Layout (User-Agent)</span>
          </div>

          <div class="slider-switch-track">
            <button type="button" class="slider-switch-btn active" id="btn-mode-desktop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Desktop
            </button>
            <button type="button" class="slider-switch-btn" id="btn-mode-mobile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12" y2="18"></line>
              </svg>
              Mobile
            </button>
          </div>

          <p class="view-mode-desc" id="view-mode-desc-text">
            Sends standard Desktop User-Agent. The website serves its standard desktop client and layout.
          </p>

          <!-- Red Warning Text Underneath the Slider -->
          <div class="view-mode-warning" id="view-mode-warning">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f87171" stroke-width="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Changing this setting will reload open windows so the website switches between its Desktop and Mobile layouts.</span>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="modal-btn-cancel">Cancel</button>
          <button type="button" class="btn-primary" id="modal-btn-save">Save App</button>
        </div>
      </div>
    `;

    shadow.appendChild(dock);
    shadow.appendChild(contextMenu);
    shadow.appendChild(menuToast);
    shadow.appendChild(modalBackdrop);
    shadow.appendChild(modalCard);

    // Toast feedback helper (Strictly says "Updated" or "Added")
    let toastTimer = null;
    function showToast(text, yPos) {
      if (toastTimer) clearTimeout(toastTimer);
      menuToast.textContent = text;
      if (typeof yPos === 'number') {
        menuToast.style.top = `${Math.max(20, Math.min(window.innerHeight - 60, yPos))}px`;
      }
      menuToast.classList.add('show');
      toastTimer = setTimeout(() => {
        menuToast.classList.remove('show');
      }, 2200);
    }

    // 6. Icon Rendering Helper (Clean SVGs)
    function getAppIconSvg(app) {
      if (app.id === 'keep') {
        return `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21h6v-1.5H9V21zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="#FBBF24"/>
          </svg>
        `;
      }
      if (app.id === 'messages') {
        return `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="#3B82F6"/>
            <circle cx="8" cy="10" r="1.5" fill="#3B82F6"/>
            <circle cx="12" cy="10" r="1.5" fill="#3B82F6"/>
            <circle cx="16" cy="10" r="1.5" fill="#3B82F6"/>
          </svg>
        `;
      }

      try {
        const urlObj = new URL(app.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        return `<img src="${faviconUrl}" alt="${app.name}" style="width: 18px; height: 18px; border-radius: 4px; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><svg style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      } catch (e) {
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        `;
      }
    }

    // 7. Render Dynamic App Buttons (Vertical Stack with Drag-and-Drop Reordering)
    let draggedAppId = null;
    let targetHoverAppId = null;

    // Shared placeholder dotted square element
    const dropPlaceholder = document.createElement('div');
    dropPlaceholder.className = 'dock-drop-placeholder';
    dropPlaceholder.title = 'Drop here';

    dropPlaceholder.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    dropPlaceholder.addEventListener('drop', (e) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain') || draggedAppId;
      if (sourceId && targetHoverAppId && sourceId !== targetHoverAppId) {
        executeReorder(sourceId, targetHoverAppId);
      }
      cleanupDragState();
    });

    function cleanupDragState() {
      if (dropPlaceholder.parentNode) {
        dropPlaceholder.remove();
      }
      shadow.querySelectorAll('.dock-btn').forEach(b => {
        b.classList.remove('dragging');
        b.classList.remove('drag-over');
      });
      draggedAppId = null;
      targetHoverAppId = null;
    }

    function executeReorder(sourceId, targetAppId) {
      if (!sourceId || !targetAppId || sourceId === targetAppId) return;
      const fromIndex = currentApps.findIndex(a => a.id === sourceId);
      const toIndex = currentApps.findIndex(a => a.id === targetAppId);
      if (fromIndex !== -1 && toIndex !== -1) {
        const [moved] = currentApps.splice(fromIndex, 1);
        currentApps.splice(toIndex, 0, moved);
        chrome.storage.local.set({ dock_apps: currentApps }, () => {
          renderAppButtons();
          showToast('Reordered');
        });
      }
    }

    // Clear placeholder when drag leaves the dock list container
    appListContainer.addEventListener('dragleave', (e) => {
      const related = e.relatedTarget;
      if (!related || !appListContainer.contains(related)) {
        if (dropPlaceholder.parentNode) {
          dropPlaceholder.remove();
        }
      }
    });

    function renderAppButtons() {
      appListContainer.innerHTML = '';
      currentApps.forEach((app, index) => {
        const btn = document.createElement('button');
        btn.className = 'dock-btn';
        btn.id = `btn-app-${app.id}`;
        btn.setAttribute('data-app', app.id);
        btn.setAttribute('draggable', 'true');
        const modeText = app.isMobile ? 'Mobile' : 'Desktop';
        btn.setAttribute('data-tooltip', `${app.name} (${modeText} • Drag to re-order)`);
        btn.innerHTML = getAppIconSvg(app);

        if (activeAppWindows[app.id]) {
          btn.classList.add('active');
        }

        // Drag and drop events for re-arranging icons
        btn.addEventListener('dragstart', (e) => {
          draggedAppId = app.id;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', app.id);
          btn.classList.add('dragging');
          closeContextMenu();
        });

        btn.addEventListener('dragend', () => {
          cleanupDragState();
        });

        btn.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (draggedAppId && draggedAppId !== app.id) {
            targetHoverAppId = app.id;
            const fromIndex = currentApps.findIndex(a => a.id === draggedAppId);
            const toIndex = currentApps.findIndex(a => a.id === app.id);
            if (fromIndex !== -1 && toIndex !== -1) {
              if (fromIndex < toIndex) {
                // Dragging downwards: display placeholder dotted square right after this button
                if (btn.nextSibling !== dropPlaceholder) {
                  btn.after(dropPlaceholder);
                }
              } else {
                // Dragging upwards: display placeholder dotted square right before this button
                if (btn.previousSibling !== dropPlaceholder) {
                  btn.before(dropPlaceholder);
                }
              }
            }
          }
        });

        btn.addEventListener('drop', (e) => {
          e.preventDefault();
          const sourceId = e.dataTransfer.getData('text/plain') || draggedAppId;
          if (sourceId && sourceId !== app.id) {
            executeReorder(sourceId, app.id);
          }
          cleanupDragState();
        });

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          launchCompanionWindow(app);
        });

        btn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu(app, e);
        });

        appListContainer.appendChild(btn);
      });
    }

    // 8. Launch Floating Companion Window Positioned Adjacent to Dock
    function launchCompanionWindow(app) {
      closeContextMenu();
      const screenWidth = window.screen.availWidth || 1920;
      const screenHeight = window.screen.availHeight || 1080;

      chrome.runtime.sendMessage({
        action: 'toggle_companion_window',
        app: app.id,
        url: app.url,
        isMobile: !!app.isMobile,
        metrics: {
          screenWidth: screenWidth,
          height: screenHeight,
          top: 0
        }
      });
    }

    // 9. Context Menu Management
    let activeMenuApp = null;
    const menuAppTitle = shadow.getElementById('menu-app-title');
    const menuAppModeBadge = shadow.getElementById('menu-app-mode-badge');
    const menuBtnEditApp = shadow.getElementById('menu-btn-edit-app');
    const menuBtnResetBounds = shadow.getElementById('menu-btn-reset-bounds');
    const menuBtnRemoveApp = shadow.getElementById('menu-btn-remove-app');

    function openContextMenu(app, mouseEvent) {
      activeMenuApp = app;
      menuAppTitle.textContent = app.name;
      menuAppModeBadge.textContent = app.isMobile ? 'Mobile' : 'Desktop';
      menuAppModeBadge.style.color = app.isMobile ? '#a7f3d0' : '#93c5fd';
      menuAppModeBadge.style.background = app.isMobile ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)';

      const targetY = mouseEvent.clientY || 100;
      const menuHeight = 160;
      const safeTop = Math.max(12, Math.min(window.innerHeight - menuHeight - 12, targetY - 20));
      contextMenu.style.top = `${safeTop}px`;
      contextMenu.classList.add('open');
    }

    function closeContextMenu() {
      contextMenu.classList.remove('open');
      activeMenuApp = null;
    }

    menuBtnEditApp.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeMenuApp) return;
      const appToEdit = activeMenuApp;
      const clickY = parseInt(contextMenu.style.top, 10) || 100;
      closeContextMenu();
      openAppModal(appToEdit, clickY);
    });

    menuBtnResetBounds.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeMenuApp) return;
      const appToReset = activeMenuApp;
      const clientY = parseInt(contextMenu.style.top, 10) || 100;

      chrome.runtime.sendMessage({
        action: 'reset_app_bounds',
        app: appToReset.id
      }, () => {
        showToast(`Reset size & location for ${appToReset.name}`, clientY);
      });

      closeContextMenu();
    });

    menuBtnRemoveApp.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activeMenuApp) return;
      const appToRemove = activeMenuApp;
      closeContextMenu();

      currentApps = currentApps.filter(a => a.id !== appToRemove.id);
      chrome.storage.local.set({ dock_apps: currentApps }, () => {
        renderAppButtons();
        showToast(`Removed "${appToRemove.name}" from dock`);
      });
    });

    // 10. Floating Movable Modal Management (Shows to the Left of Sidebar)
    let editingAppId = null;
    let modalIsMobile = false;
    let originalAppConfig = null;

    const modalDragHeader = shadow.getElementById('modal-drag-header');
    const modalTitleText = shadow.getElementById('modal-title-text');
    const inputAppName = shadow.getElementById('input-app-name');
    const inputAppUrl = shadow.getElementById('input-app-url');
    const btnModeDesktop = shadow.getElementById('btn-mode-desktop');
    const btnModeMobile = shadow.getElementById('btn-mode-mobile');
    const viewModeBadgeLabel = shadow.getElementById('view-mode-badge-label');
    const viewModeDescText = shadow.getElementById('view-mode-desc-text');
    const modalBtnClose = shadow.getElementById('modal-btn-close');
    const modalBtnCancel = shadow.getElementById('modal-btn-cancel');
    const modalBtnSave = shadow.getElementById('modal-btn-save');

    // Movable / Dragging support for Modal Dialog
    let isDraggingModal = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialModalLeft = 0;
    let initialModalTop = 0;

    modalDragHeader.addEventListener('mousedown', (e) => {
      if (e.target.closest('#modal-btn-close')) return;
      isDraggingModal = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = modalCard.getBoundingClientRect();
      initialModalLeft = rect.left;
      initialModalTop = rect.top;

      modalCard.style.right = 'auto';
      modalCard.style.left = `${initialModalLeft}px`;
      modalCard.style.top = `${initialModalTop}px`;
      modalCard.classList.add('dragging');

      window.addEventListener('mousemove', handleModalMouseMove);
      window.addEventListener('mouseup', handleModalMouseUp);
      e.preventDefault();
    });

    function handleModalMouseMove(e) {
      if (!isDraggingModal) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      const modalWidth = modalCard.offsetWidth || 375;
      const modalHeight = modalCard.offsetHeight || 380;

      const newLeft = Math.max(10, Math.min(window.innerWidth - modalWidth - 10, initialModalLeft + deltaX));
      const newTop = Math.max(10, Math.min(window.innerHeight - modalHeight - 10, initialModalTop + deltaY));

      modalCard.style.left = `${newLeft}px`;
      modalCard.style.top = `${newTop}px`;
    }

    function handleModalMouseUp() {
      if (isDraggingModal) {
        isDraggingModal = false;
        modalCard.classList.remove('dragging');
        window.removeEventListener('mousemove', handleModalMouseMove);
        window.removeEventListener('mouseup', handleModalMouseUp);
      }
    }

    /**
     * Check if genuine changes were made compared to saved settings:
     * - Only active if changes were made and not toggled back
     * - If editing: compares name, url, and isMobile with originalAppConfig
     * - If new app: requires valid destination URL
     */
    function checkModalCanSave() {
      const currentName = inputAppName.value.trim();
      const currentUrl = inputAppUrl.value.trim();
      const isValidUrl = currentUrl.length > 0 && currentUrl !== 'https://' && currentUrl !== 'http://';

      if (!isValidUrl) {
        modalBtnSave.disabled = true;
        modalBtnSave.classList.add('disabled');
        modalBtnSave.title = 'Enter a valid URL to save';
        return false;
      }

      if (editingAppId && originalAppConfig) {
        const isNameChanged = currentName !== originalAppConfig.name;
        const isUrlChanged = currentUrl !== originalAppConfig.url;
        const isModeChanged = Boolean(modalIsMobile) !== Boolean(originalAppConfig.isMobile);
        const hasChanges = isNameChanged || isUrlChanged || isModeChanged;

        modalBtnSave.disabled = !hasChanges;
        if (hasChanges) {
          modalBtnSave.classList.remove('disabled');
          modalBtnSave.removeAttribute('title');
        } else {
          modalBtnSave.classList.add('disabled');
          modalBtnSave.title = 'No changes made';
        }
        return hasChanges;
      } else {
        // Adding new app: active when valid URL entered
        modalBtnSave.disabled = false;
        modalBtnSave.classList.remove('disabled');
        modalBtnSave.removeAttribute('title');
        return true;
      }
    }

    inputAppName.addEventListener('input', checkModalCanSave);
    inputAppUrl.addEventListener('input', checkModalCanSave);

    function updateModalModeUI(isMobile) {
      modalIsMobile = isMobile;
      if (isMobile) {
        btnModeMobile.classList.add('active', 'mobile');
        btnModeDesktop.classList.remove('active');
        viewModeBadgeLabel.textContent = 'Mobile Layout (User-Agent)';
        viewModeBadgeLabel.style.color = '#34d399';
        viewModeBadgeLabel.style.background = 'rgba(16, 185, 129, 0.15)';
        viewModeDescText.textContent = 'Sends Mobile User-Agent and Sec-CH-UA-Mobile: ?1 so the website automatically serves its mobile layout and navigation.';
      } else {
        btnModeDesktop.classList.add('active');
        btnModeMobile.classList.remove('active', 'mobile');
        viewModeBadgeLabel.textContent = 'Desktop Layout (User-Agent)';
        viewModeBadgeLabel.style.color = '#60a5fa';
        viewModeBadgeLabel.style.background = 'rgba(59, 130, 246, 0.15)';
        viewModeDescText.textContent = 'Sends standard Desktop User-Agent. The website serves its standard desktop client and layout.';
      }
      checkModalCanSave();
    }

    btnModeDesktop.addEventListener('click', () => updateModalModeUI(false));
    btnModeMobile.addEventListener('click', () => updateModalModeUI(true));

    function openAppModal(appToEdit = null, clickY = null) {
      // Position to the left of the sidebar
      modalCard.style.left = 'auto';
      modalCard.style.right = '56px';

      const modalHeight = 420;
      const defaultTop = typeof clickY === 'number'
        ? Math.max(20, Math.min(window.innerHeight - modalHeight - 20, clickY - 40))
        : 80;
      modalCard.style.top = `${defaultTop}px`;

      if (appToEdit) {
        editingAppId = appToEdit.id;
        originalAppConfig = {
          name: (appToEdit.name || '').trim(),
          url: (appToEdit.url || '').trim(),
          isMobile: Boolean(appToEdit.isMobile)
        };
        modalTitleText.textContent = `Edit ${appToEdit.name}`;
        modalBtnSave.textContent = 'Save App';
        inputAppName.value = appToEdit.name;
        inputAppUrl.value = appToEdit.url;
        updateModalModeUI(Boolean(appToEdit.isMobile));
      } else {
        editingAppId = null;
        originalAppConfig = null;
        modalTitleText.textContent = 'Add App to Sidebar';
        modalBtnSave.textContent = 'Add App';
        inputAppName.value = '';
        inputAppUrl.value = 'https://';
        updateModalModeUI(false);
      }

      checkModalCanSave();

      modalBackdrop.classList.add('open');
      modalCard.classList.add('open');

      setTimeout(() => {
        if (inputAppName.value) {
          inputAppUrl.focus();
        } else {
          inputAppName.focus();
        }
      }, 60);
    }

    function closeAppModal() {
      modalBackdrop.classList.remove('open');
      modalCard.classList.remove('open');
      editingAppId = null;
      originalAppConfig = null;
    }

    modalBtnClose.addEventListener('click', closeAppModal);
    modalBtnCancel.addEventListener('click', closeAppModal);
    modalBackdrop.addEventListener('click', closeAppModal);

    modalBtnSave.addEventListener('click', () => {
      if (!checkModalCanSave()) return;

      let name = inputAppName.value.trim();
      let url = inputAppUrl.value.trim();

      if (!url) {
        inputAppUrl.focus();
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      if (!name) {
        try {
          const u = new URL(url);
          name = u.hostname.replace('www.', '').split('.')[0];
          name = name.charAt(0).toUpperCase() + name.slice(1);
        } catch (e) {
          name = 'Web App';
        }
      }

      const isEditing = !!editingAppId;
      let savedApp = null;

      if (isEditing) {
        const index = currentApps.findIndex(a => a.id === editingAppId);
        if (index !== -1) {
          currentApps[index] = {
            ...currentApps[index],
            name: name,
            url: url,
            isMobile: modalIsMobile
          };
          savedApp = currentApps[index];
        }
      } else {
        const newId = 'app_' + Date.now();
        savedApp = {
          id: newId,
          name: name,
          url: url,
          isMobile: modalIsMobile
        };
        currentApps.push(savedApp);
      }

      // Save configuration and notify background script to refresh open window without changing size/position
      chrome.storage.local.set({ dock_apps: currentApps }, () => {
        renderAppButtons();
        
        if (savedApp) {
          chrome.runtime.sendMessage({
            action: 'app_config_updated',
            appId: savedApp.id,
            app: savedApp
          });
        }

        closeAppModal();

        // Popup text says strictly "Updated" if updating an existing one, or "Added" if adding a new one
        showToast(isEditing ? 'Updated' : 'Added');
      });
    });

    btnAddApp.addEventListener('click', (e) => {
      e.stopPropagation();
      closeContextMenu();
      const btnRect = btnAddApp.getBoundingClientRect();
      openAppModal(null, btnRect.top);
    });

    // 11. Dock Visibility & Toolbar Toggle
    let isDockVisible = true;

    function setDockCollapsed(collapsed) {
      isDockVisible = !collapsed;
      if (collapsed) {
        dock.classList.add('collapsed');
        closeContextMenu();
        closeAppModal();
        restoreDockMargin();
      } else {
        dock.classList.remove('collapsed');
        reserveDockMargin();
      }
    }

    // 12. Chrome Message Listeners
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggle_dock') {
        const nextCollapsed = typeof message.collapsed === 'boolean' ? message.collapsed : isDockVisible;
        setDockCollapsed(nextCollapsed);
        chrome.storage.local.set({ dock_collapsed: nextCollapsed });
        sendResponse({ visible: isDockVisible });
        return true;
      }

      if (message.action === 'companion_state_changed') {
        activeAppWindows[message.app] = message.isOpen;
        const btn = shadow.getElementById(`btn-app-${message.app}`);
        if (btn) {
          if (message.isOpen) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
        return true;
      }
    });

    // Global dismiss context menu on click outside
    window.addEventListener('click', () => {
      closeContextMenu();
    });

    // 13. Initialize on Load
    chrome.storage.local.get(['dock_apps', 'dock_collapsed'], (data) => {
      if (data.dock_apps && Array.isArray(data.dock_apps) && data.dock_apps.length > 0) {
        currentApps = data.dock_apps;
      }
      renderAppButtons();

      if (data.dock_collapsed) {
        setDockCollapsed(true);
      } else {
        reserveDockMargin();
      }

      chrome.runtime.sendMessage({ action: 'get_companion_states' }, (states) => {
        if (states && typeof states === 'object') {
          activeAppWindows = states;
          for (const [appId, isOpen] of Object.entries(states)) {
            const btn = shadow.getElementById(`btn-app-${appId}`);
            if (btn && isOpen) {
              btn.classList.add('active');
            }
          }
        }
      });
    });
  }

})();
