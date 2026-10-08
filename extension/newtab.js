/**
 * App Tower - New Tab Controller
 * Handles live clock, draggable applet widgets, wallpaper themes, search providers, and settings persistence.
 */

(function () {
  'use strict';

  // Search provider URL patterns
  const SEARCH_PROVIDERS = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    kagi: 'https://kagi.com/search?q='
  };

  const WALLPAPERS = {
    gradient: '',
    bing: 'https://bing.biturl.top/?resolution=1920&format=image&index=0',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    cosmic: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80'
  };

  // State defaults
  let state = {
    searchProvider: 'google',
    wallpaper: 'gradient',
    showClock: true,
    showWeather: true,
    clockPos: { x: 60, y: 90 },
    weatherPos: { x: 60, y: 230 },
    newTabOverrideEnabled: false
  };

  // DOM Elements
  const bgOverlay = document.getElementById('bg-overlay');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const shortcutsGrid = document.getElementById('shortcuts-grid');

  const clockApplet = document.getElementById('draggable-clock-applet');
  const clockTimeVal = document.getElementById('clock-time-val');
  const clockAmPm = document.getElementById('clock-ampm');
  const clockDateVal = document.getElementById('clock-date-val');

  const weatherApplet = document.getElementById('draggable-weather-applet');
  const disabledBanner = document.getElementById('disabled-override-banner');
  const bannerBtnEnable = document.getElementById('banner-btn-enable');

  const btnConfigGear = document.getElementById('btn-config-gear');
  const modalBackdrop = document.getElementById('config-modal-backdrop');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const toggleClock = document.getElementById('toggle-clock-widget');
  const toggleWeather = document.getElementById('toggle-weather-widget');
  const btnResetWidgets = document.getElementById('btn-reset-widgets');

  // Load saved state from chrome.storage.local
  async function loadState() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const stored = await chrome.storage.local.get([
          'new_tab_state',
          'new_tab_override_enabled',
          'dock_apps'
        ]);

        if (stored.new_tab_state) {
          state = { ...state, ...stored.new_tab_state };
        }
        if (typeof stored.new_tab_override_enabled === 'boolean') {
          state.newTabOverrideEnabled = stored.new_tab_override_enabled;
        }

        renderShortcuts(stored.dock_apps || []);
      } catch (e) {
        console.warn('Storage read error:', e);
      }
    }

    applyState();
  }

  function saveState() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        new_tab_state: {
          searchProvider: state.searchProvider,
          wallpaper: state.wallpaper,
          showClock: state.showClock,
          showWeather: state.showWeather,
          clockPos: state.clockPos,
          weatherPos: state.weatherPos
        }
      });
    }
  }

  function applyState() {
    // 1. Wallpaper
    const bgUrl = WALLPAPERS[state.wallpaper] || '';
    if (bgUrl) {
      bgOverlay.style.backgroundImage = `url("${bgUrl}")`;
      bgOverlay.classList.add('with-backdrop');
    } else {
      bgOverlay.style.backgroundImage = 'none';
      bgOverlay.classList.remove('with-backdrop');
    }

    // 2. Search Provider action
    const providerBase = SEARCH_PROVIDERS[state.searchProvider] || SEARCH_PROVIDERS.google;
    searchForm.action = providerBase.split('?')[0];
    searchInput.placeholder = `Search with ${state.searchProvider.toUpperCase()} or enter URL...`;

    // 3. Widget visibility & positions
    clockApplet.style.display = state.showClock ? 'block' : 'none';
    clockApplet.style.left = `${state.clockPos.x}px`;
    clockApplet.style.top = `${state.clockPos.y}px`;

    weatherApplet.style.display = state.showWeather ? 'block' : 'none';
    weatherApplet.style.left = `${state.weatherPos.x}px`;
    weatherApplet.style.top = `${state.weatherPos.y}px`;

    // 4. Override warning banner
    if (disabledBanner) {
      disabledBanner.style.display = state.newTabOverrideEnabled ? 'none' : 'flex';
    }

    // 5. Sync Modal Controls
    if (toggleClock) toggleClock.checked = state.showClock;
    if (toggleWeather) toggleWeather.checked = state.showWeather;

    document.querySelectorAll('.provider-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.provider === state.searchProvider);
    });

    document.querySelectorAll('.wallpaper-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.bg === state.wallpaper);
    });
  }

  // Live Clock updater
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    if (clockTimeVal) clockTimeVal.textContent = `${hours}:${minutes}`;
    if (clockAmPm) clockAmPm.textContent = ampm;

    if (clockDateVal) {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      clockDateVal.textContent = now.toLocaleDateString(undefined, options);
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Search form submit handling
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    if (/^https?:\/\//i.test(query) || (query.includes('.') && !query.includes(' '))) {
      const url = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = url;
    } else {
      const base = SEARCH_PROVIDERS[state.searchProvider] || SEARCH_PROVIDERS.google;
      window.location.href = `${base}${encodeURIComponent(query)}`;
    }
  });

  // Render quick shortcut badges from configured dock apps
  function renderShortcuts(apps) {
    shortcutsGrid.innerHTML = '';
    const displayApps = Array.isArray(apps) && apps.length > 0 ? apps : [];

    displayApps.slice(0, 6).forEach((app) => {
      const a = document.createElement('a');
      a.className = 'shortcut-item';
      a.href = app.url || '#';
      a.innerHTML = `
        <div class="shortcut-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="4"></rect>
            <path d="M9 9h6v6H9z"></path>
          </svg>
        </div>
        <span class="shortcut-label">${app.name || 'App'}</span>
      `;
      shortcutsGrid.appendChild(a);
    });
  }

  // Draggable logic for widgets
  function makeDraggable(element, posKey) {
    const handle = element.querySelector('.applet-drag-header');
    if (!handle) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      element.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = element.offsetLeft;
      initialTop = element.offsetTop;

      function onMouseMove(ev) {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const maxLeft = window.innerWidth - element.offsetWidth - 20;
        const maxTop = window.innerHeight - element.offsetHeight - 20;

        const newLeft = Math.max(20, Math.min(maxLeft, initialLeft + dx));
        const newTop = Math.max(60, Math.min(maxTop, initialTop + dy));

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
      }

      function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging');

        state[posKey] = {
          x: element.offsetLeft,
          y: element.offsetTop
        };
        saveState();

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  makeDraggable(clockApplet, 'clockPos');
  makeDraggable(weatherApplet, 'weatherPos');

  // Modal event bindings
  btnConfigGear.addEventListener('click', () => {
    modalBackdrop.classList.add('open');
  });

  btnCloseModal.addEventListener('click', () => {
    modalBackdrop.classList.remove('open');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('open');
    }
  });

  if (bannerBtnEnable) {
    bannerBtnEnable.addEventListener('click', () => {
      state.newTabOverrideEnabled = true;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ new_tab_override_enabled: true });
      }
      applyState();
    });
  }

  // Modal settings bindings
  document.querySelectorAll('.provider-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.searchProvider = btn.dataset.provider;
      applyState();
      saveState();
    });
  });

  document.querySelectorAll('.wallpaper-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.wallpaper = btn.dataset.bg;
      applyState();
      saveState();
    });
  });

  if (toggleClock) {
    toggleClock.addEventListener('change', () => {
      state.showClock = toggleClock.checked;
      applyState();
      saveState();
    });
  }

  if (toggleWeather) {
    toggleWeather.addEventListener('change', () => {
      state.showWeather = toggleWeather.checked;
      applyState();
      saveState();
    });
  }

  if (btnResetWidgets) {
    btnResetWidgets.addEventListener('click', () => {
      state.clockPos = { x: 60, y: 90 };
      state.weatherPos = { x: 60, y: 230 };
      applyState();
      saveState();
    });
  }

  // Initial load
  loadState();
})();
