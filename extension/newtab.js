/**
 * App Tower - New Tab Page Script
 * Manages:
 * 1. Search provider selection (Google, DuckDuckGo, Bing, Ecosia, Brave, Custom)
 * 2. Background wallpapers including daily rotation from Bing
 * 3. Draggable Live Clock Applet (IP/location-based time & timezone)
 * 4. Draggable Live Weather Applet (IP/location-based live weather via Open-Meteo)
 * 5. Extension settings (New Tab Override toggle disabled by default, Sidebar width, Sidebar color)
 */

(function () {
  'use strict';

  // DOM Elements
  const bgOverlay = document.getElementById('bg-overlay');
  const banner = document.getElementById('disabled-override-banner');
  const bannerBtnEnable = document.getElementById('banner-btn-enable');
  const gearBtn = document.getElementById('btn-config-gear');
  const modalCard = document.getElementById('config-modal-card');
  const modalDragHeader = document.getElementById('config-modal-drag-header');
  const modalCloseBtn = document.getElementById('modal-btn-close-config');
  const modalDoneBtn = document.getElementById('modal-btn-done');
  const modalResetPosBtn = document.getElementById('modal-btn-reset-pos');

  // Applets
  const clockApplet = document.getElementById('draggable-clock-applet');
  const weatherApplet = document.getElementById('draggable-weather-applet');
  const clockTimeEl = document.getElementById('live-clock-time');
  const clockAmpmEl = document.getElementById('live-clock-ampm');
  const clockDateEl = document.getElementById('live-clock-date');
  const clockLocText = document.getElementById('clock-loc-text');

  const weatherCityBadge = document.getElementById('weather-city-badge');
  const weatherTempVal = document.getElementById('weather-temp-val');
  const weatherConditionText = document.getElementById('weather-condition-text');
  const weatherIconContainer = document.getElementById('weather-icon-container');
  const weatherWindText = document.getElementById('weather-wind-text');
  const weatherHumidityText = document.getElementById('weather-humidity-text');

  // Search
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const defaultSearchForm = document.getElementById('default-search-form');
  const defaultSearchInput = document.getElementById('default-search-input');
  const btnDefaultLucky = document.getElementById('btn-default-lucky');

  // Settings Controls
  const toggleOverride = document.getElementById('toggle-newtab-override');
  const toggleClock = document.getElementById('toggle-clock-applet');
  const toggleWeather = document.getElementById('toggle-weather-applet');
  const providerRadios = document.querySelectorAll('input[name="search-provider"]');
  const customSearchContainer = document.getElementById('custom-search-container');
  const customSearchUrlInput = document.getElementById('custom-search-url');
  const bgRadios = document.querySelectorAll('input[name="bg-type"]');
  const customBgContainer = document.getElementById('custom-bg-container');
  const customBgUrlInput = document.getElementById('custom-bg-url');
  const inputSidebarWidth = document.getElementById('input-sidebar-width');
  const labelSidebarWidth = document.getElementById('label-sidebar-width');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const inputCustomColor = document.getElementById('input-custom-color');

  // State
  let settings = {
    new_tab_override_enabled: false, // Disabled by default!
    search_provider: 'google',
    custom_search_url: '',
    bg_type: 'gradient',
    custom_bg_url: '',
    show_clock: true,
    show_weather: true,
    clock_pos: { x: 60, y: 80 },
    weather_pos: { x: 60, y: 250 },
    dock_width: 44,
    dock_color: '#12141a'
  };

  const SEARCH_PROVIDERS = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
    ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=' },
    custom: { name: 'Custom', url: '' }
  };

  const WALLPAPERS = {
    gradient: '',
    bing: 'https://bing.biturl.top/?resolution=1920&format=image&index=0',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    cosmic: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80'
  };

  // 1. Load Settings from chrome.storage.local
  function loadSettings() {
    chrome.storage.local.get([
      'new_tab_override_enabled',
      'search_provider',
      'custom_search_url',
      'bg_type',
      'custom_bg_url',
      'show_clock',
      'show_weather',
      'clock_pos',
      'weather_pos',
      'dock_width',
      'dock_color'
    ], (data) => {
      if (typeof data.new_tab_override_enabled === 'boolean') {
        settings.new_tab_override_enabled = data.new_tab_override_enabled;
      }
      if (data.search_provider) settings.search_provider = data.search_provider;
      if (data.custom_search_url) settings.custom_search_url = data.custom_search_url;
      if (data.bg_type) settings.bg_type = data.bg_type;
      if (data.custom_bg_url) settings.custom_bg_url = data.custom_bg_url;
      if (typeof data.show_clock === 'boolean') settings.show_clock = data.show_clock;
      if (typeof data.show_weather === 'boolean') settings.show_weather = data.show_weather;
      if (data.clock_pos && typeof data.clock_pos.x === 'number') settings.clock_pos = data.clock_pos;
      if (data.weather_pos && typeof data.weather_pos.x === 'number') settings.weather_pos = data.weather_pos;
      if (typeof data.dock_width === 'number') settings.dock_width = data.dock_width;
      if (data.dock_color) settings.dock_color = data.dock_color;

      applySettingsToUI();
    });
  }

  // 2. Apply Settings to UI
  function applySettingsToUI() {
    // Switch between Override Disabled (Default Google Search page) and Override Enabled (App Tower custom dashboard)
    if (!settings.new_tab_override_enabled) {
      document.body.classList.remove('override-enabled');
      document.body.classList.add('override-disabled');
      banner.style.display = 'flex';
      if (bgOverlay) {
        bgOverlay.style.backgroundImage = '';
        bgOverlay.classList.remove('has-wallpaper');
      }
    } else {
      document.body.classList.remove('override-disabled');
      document.body.classList.add('override-enabled');
      banner.style.display = 'none';
      applyWallpaper(settings.bg_type, settings.custom_bg_url);
    }

    // Toggle states
    if (toggleOverride) toggleOverride.checked = !!settings.new_tab_override_enabled;
    if (toggleClock) toggleClock.checked = !!settings.show_clock;
    if (toggleWeather) toggleWeather.checked = !!settings.show_weather;

    // Clock visibility & position
    if (clockApplet) {
      clockApplet.style.display = (settings.new_tab_override_enabled && settings.show_clock) ? 'block' : 'none';
      clockApplet.style.left = `${settings.clock_pos.x}px`;
      clockApplet.style.top = `${settings.clock_pos.y}px`;
    }

    // Weather visibility & position
    if (weatherApplet) {
      weatherApplet.style.display = (settings.new_tab_override_enabled && settings.show_weather) ? 'block' : 'none';
      weatherApplet.style.left = `${settings.weather_pos.x}px`;
      weatherApplet.style.top = `${settings.weather_pos.y}px`;
    }

    // Search provider radio & placeholder
    providerRadios.forEach(r => {
      r.checked = r.value === settings.search_provider;
    });
    if (customSearchContainer) {
      customSearchContainer.style.display = settings.search_provider === 'custom' ? 'flex' : 'none';
    }
    if (customSearchUrlInput) {
      customSearchUrlInput.value = settings.custom_search_url || '';
    }

    const providerObj = SEARCH_PROVIDERS[settings.search_provider] || SEARCH_PROVIDERS.google;
    if (searchInput) {
      searchInput.placeholder = `Search with ${providerObj.name} or type a URL...`;
    }

    // Background Wallpaper
    bgRadios.forEach(r => {
      r.checked = r.value === settings.bg_type;
    });
    if (customBgContainer) {
      customBgContainer.style.display = settings.bg_type === 'custom' ? 'flex' : 'none';
    }
    if (customBgUrlInput) {
      customBgUrlInput.value = settings.custom_bg_url || '';
    }

    // Sidebar Width & Color
    if (inputSidebarWidth && labelSidebarWidth) {
      inputSidebarWidth.value = String(settings.dock_width);
      labelSidebarWidth.textContent = `${settings.dock_width}px`;
    }

    colorSwatches.forEach(s => {
      if (s.getAttribute('data-color') === settings.dock_color) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
    if (inputCustomColor) {
      inputCustomColor.value = settings.dock_color;
    }
  }

  // 3. Wallpaper Helper
  function applyWallpaper(bgType, customUrl) {
    if (!bgOverlay) return;

    if (bgType === 'gradient') {
      bgOverlay.style.backgroundImage = '';
      bgOverlay.classList.remove('has-wallpaper');
    } else if (bgType === 'custom' && customUrl) {
      bgOverlay.style.backgroundImage = `url("${customUrl}")`;
      bgOverlay.classList.add('has-wallpaper');
    } else if (WALLPAPERS[bgType]) {
      bgOverlay.style.backgroundImage = `url("${WALLPAPERS[bgType]}")`;
      bgOverlay.classList.add('has-wallpaper');
    } else {
      bgOverlay.style.backgroundImage = '';
      bgOverlay.classList.remove('has-wallpaper');
    }
  }

  // 4. Live Clock & Geolocation/IP Time
  let resolvedCity = '';

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const isAm = hours < 12;
    hours = hours % 12;
    if (hours === 0) hours = 12;

    if (clockTimeEl) {
      clockTimeEl.textContent = `${hours}:${minutes}`;
    }
    if (clockAmpmEl) {
      clockAmpmEl.textContent = isAm ? 'AM' : 'PM';
    }
    if (clockDateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      clockDateEl.textContent = now.toLocaleDateString(undefined, options);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // 5. Geolocation / IP Lookup for Clock & Weather
  async function fetchLocationAndWeather() {
    let lat = 37.7749;
    let lon = -122.4194;
    let locationName = 'Local';

    try {
      // First attempt IP-based location lookup
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          lat = data.latitude;
          lon = data.longitude;
          locationName = `${data.city || 'Local'}${data.region_code ? ', ' + data.region_code : ''}`;
        }
      }
    } catch (e) {
      // Fallback to browser timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const parts = tz.split('/');
        locationName = parts[parts.length - 1].replace(/_/g, ' ') || 'Local';
      } catch (err) {}
    }

    resolvedCity = locationName;
    if (clockLocText) {
      clockLocText.textContent = locationName;
    }
    if (weatherCityBadge) {
      weatherCityBadge.textContent = locationName;
    }

    // Now fetch live weather from Open-Meteo
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph`;
      const wRes = await fetch(weatherUrl);
      if (wRes.ok) {
        const wData = await wRes.json();
        const cur = wData.current_weather;
        if (cur) {
          const temp = Math.round(cur.temperature);
          if (weatherTempVal) weatherTempVal.textContent = `${temp}°F`;
          if (weatherWindText) weatherWindText.textContent = `Wind: ${Math.round(cur.windspeed)} mph`;

          // Estimate humidity
          let humidity = 55;
          if (wData.hourly && wData.hourly.relativehumidity_2m && wData.hourly.relativehumidity_2m.length > 0) {
            humidity = wData.hourly.relativehumidity_2m[0];
          }
          if (weatherHumidityText) weatherHumidityText.textContent = `Humidity: ${humidity}%`;

          // Interpret WMO weather code
          const cond = interpretWeatherCode(cur.weathercode);
          if (weatherConditionText) weatherConditionText.textContent = cond.label;
          if (weatherIconContainer) weatherIconContainer.innerHTML = cond.svg;
        }
      }
    } catch (wErr) {
      if (weatherConditionText) weatherConditionText.textContent = 'Clear Skies';
      if (weatherTempVal) weatherTempVal.textContent = '68°F';
    }
  }

  function interpretWeatherCode(code) {
    if (code === 0) {
      return {
        label: 'Clear Sky',
        svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      };
    }
    if (code >= 1 && code <= 3) {
      return {
        label: code === 1 ? 'Mainly Clear' : (code === 2 ? 'Partly Cloudy' : 'Overcast'),
        svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#93c5fd" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`
      };
    }
    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
      return {
        label: 'Rain Showers',
        svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line></svg>`
      };
    }
    if (code >= 71 && code <= 77 || code >= 85 && code <= 86) {
      return {
        label: 'Snow',
        svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#e0f2fe" stroke-width="2"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>`
      };
    }
    if (code >= 95) {
      return {
        label: 'Thunderstorm',
        svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#facc15" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>`
      };
    }
    return {
      label: 'Partly Cloudy',
      svg: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#93c5fd" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`
    };
  }

  fetchLocationAndWeather();

  // 6. Generic Applet Drag & Drop Handler
  function makeAppletDraggable(appletEl, storageKey) {
    if (!appletEl) return;
    const header = appletEl.querySelector('.applet-drag-header');
    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      isDragging = true;
      appletEl.classList.add('is-dragging');

      startX = e.clientX;
      startY = e.clientY;

      const rect = appletEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Viewport bounds clamp
      const maxLeft = Math.max(10, window.innerWidth - appletEl.offsetWidth - 56);
      const maxTop = Math.max(10, window.innerHeight - appletEl.offsetHeight - 20);

      newLeft = Math.max(10, Math.min(maxLeft, newLeft));
      newTop = Math.max(56, Math.min(maxTop, newTop));

      appletEl.style.left = `${newLeft}px`;
      appletEl.style.top = `${newTop}px`;
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      appletEl.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const rect = appletEl.getBoundingClientRect();
      const pos = { x: Math.round(rect.left), y: Math.round(rect.top) };
      settings[storageKey] = pos;

      const saveObj = {};
      saveObj[storageKey] = pos;
      chrome.storage.local.set(saveObj);
    }
  }

  makeAppletDraggable(clockApplet, 'clock_pos');
  makeAppletDraggable(weatherApplet, 'weather_pos');

  // 7. Search Form Submission
  if (searchForm && searchInput) {
    searchInput.focus();

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = searchInput.value.trim();
      if (!raw) return;

      // Direct URL check
      const isHttp = /^https?:\/\//i.test(raw);
      const isDomain = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(raw);

      if (isHttp) {
        window.location.href = raw;
      } else if (isDomain) {
        window.location.href = `https://${raw}`;
      } else {
        const query = encodeURIComponent(raw);
        if (settings.search_provider === 'custom' && settings.custom_search_url) {
          const finalUrl = settings.custom_search_url.includes('{q}')
            ? settings.custom_search_url.replace('{q}', query)
            : `${settings.custom_search_url}${query}`;
          window.location.href = finalUrl;
        } else {
          const provider = SEARCH_PROVIDERS[settings.search_provider] || SEARCH_PROVIDERS.google;
          window.location.href = `${provider.url}${query}`;
        }
      }
    });

    window.addEventListener('focus', () => {
      if (settings.new_tab_override_enabled) {
        searchInput.focus();
      } else if (defaultSearchInput) {
        defaultSearchInput.focus();
      }
    });
  }

  // Default Google Search Form
  if (defaultSearchForm && defaultSearchInput) {
    defaultSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = defaultSearchInput.value.trim();
      if (!raw) return;

      const isHttp = /^https?:\/\//i.test(raw);
      const isDomain = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(raw);

      if (isHttp) {
        window.location.href = raw;
      } else if (isDomain) {
        window.location.href = `https://${raw}`;
      } else {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
      }
    });
  }

  if (btnDefaultLucky) {
    btnDefaultLucky.addEventListener('click', () => {
      const raw = (defaultSearchInput && defaultSearchInput.value.trim()) || '';
      if (raw) {
        window.location.href = `https://www.google.com/search?btnI=1&q=${encodeURIComponent(raw)}`;
      } else {
        window.location.href = 'https://www.google.com/doodles';
      }
    });
  }

  // 8. Settings Modal Open/Close, Positioning underneath Gear, & Draggable Interactions
  let isModalMovableInitialized = false;

  function positionModalUnderneathGear() {
    if (!modalCard || !gearBtn) return;
    const gearRect = gearBtn.getBoundingClientRect();
    const modalWidth = modalCard.offsetWidth || 480;
    
    // Position right-aligned underneath the gear icon
    let leftPos = gearRect.right - modalWidth;
    let topPos = gearRect.bottom + 12;

    // Viewport clamps
    leftPos = Math.max(16, Math.min(window.innerWidth - modalWidth - 16, leftPos));
    topPos = Math.max(16, Math.min(window.innerHeight - 300, topPos));

    modalCard.style.left = `${Math.round(leftPos)}px`;
    modalCard.style.top = `${Math.round(topPos)}px`;
    modalCard.style.right = 'auto';
    modalCard.style.bottom = 'auto';
  }

  function openSettingsModal() {
    if (!modalCard) return;
    const isAlreadyOpen = modalCard.classList.contains('open');
    if (isAlreadyOpen) {
      closeSettingsModal();
      return;
    }

    modalCard.classList.add('open');
    positionModalUnderneathGear();

    if (!isModalMovableInitialized) {
      initModalDragging();
      isModalMovableInitialized = true;
    }
  }

  function closeSettingsModal() {
    if (!modalCard) return;
    modalCard.classList.remove('open');
  }

  function initModalDragging() {
    if (!modalCard || !modalDragHeader) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    modalDragHeader.addEventListener('mousedown', (e) => {
      // Don't drag if clicking close button
      if (e.target.closest('#modal-btn-close-config')) return;

      isDragging = true;
      modalCard.classList.add('is-dragging');

      startX = e.clientX;
      startY = e.clientY;

      const rect = modalCard.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxLeft = Math.max(10, window.innerWidth - modalCard.offsetWidth - 16);
      const maxTop = Math.max(10, window.innerHeight - 100);

      newLeft = Math.max(10, Math.min(maxLeft, newLeft));
      newTop = Math.max(10, Math.min(maxTop, newTop));

      modalCard.style.left = `${Math.round(newLeft)}px`;
      modalCard.style.top = `${Math.round(newTop)}px`;
      modalCard.style.right = 'auto';
      modalCard.style.bottom = 'auto';
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      modalCard.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  if (gearBtn) gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openSettingsModal();
  });
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSettingsModal();
  });
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSettingsModal();
  });

  // Clicking outside the modal card closes it
  document.addEventListener('click', (e) => {
    if (!modalCard || !modalCard.classList.contains('open')) return;
    if (gearBtn && gearBtn.contains(e.target)) return;
    if (!modalCard.contains(e.target)) {
      closeSettingsModal();
    }
  });

  if (bannerBtnEnable) {
    bannerBtnEnable.addEventListener('click', () => {
      settings.new_tab_override_enabled = true;
      chrome.storage.local.set({ new_tab_override_enabled: true });
      applySettingsToUI();
    });
  }

  // Override Toggle
  if (toggleOverride) {
    toggleOverride.addEventListener('change', () => {
      settings.new_tab_override_enabled = toggleOverride.checked;
      chrome.storage.local.set({ new_tab_override_enabled: settings.new_tab_override_enabled });
      applySettingsToUI();
    });
  }

  // Clock Applet Toggle
  if (toggleClock) {
    toggleClock.addEventListener('change', () => {
      settings.show_clock = toggleClock.checked;
      chrome.storage.local.set({ show_clock: settings.show_clock });
      applySettingsToUI();
    });
  }

  // Weather Applet Toggle
  if (toggleWeather) {
    toggleWeather.addEventListener('change', () => {
      settings.show_weather = toggleWeather.checked;
      chrome.storage.local.set({ show_weather: settings.show_weather });
      applySettingsToUI();
    });
  }

  // Search Provider Change
  providerRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      settings.search_provider = radio.value;
      chrome.storage.local.set({ search_provider: settings.search_provider });
      applySettingsToUI();
    });
  });

  if (customSearchUrlInput) {
    customSearchUrlInput.addEventListener('input', () => {
      settings.custom_search_url = customSearchUrlInput.value.trim();
      chrome.storage.local.set({ custom_search_url: settings.custom_search_url });
    });
  }

  // Background Change
  bgRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      settings.bg_type = radio.value;
      chrome.storage.local.set({ bg_type: settings.bg_type });
      applySettingsToUI();
    });
  });

  if (customBgUrlInput) {
    customBgUrlInput.addEventListener('input', () => {
      settings.custom_bg_url = customBgUrlInput.value.trim();
      chrome.storage.local.set({ custom_bg_url: settings.custom_bg_url });
      applySettingsToUI();
    });
  }

  // Sidebar Width Slider
  if (inputSidebarWidth) {
    inputSidebarWidth.addEventListener('input', () => {
      const val = parseInt(inputSidebarWidth.value, 10);
      settings.dock_width = val;
      if (labelSidebarWidth) labelSidebarWidth.textContent = `${val}px`;
      chrome.storage.local.set({ dock_width: val });
    });
  }

  // Sidebar Color Swatches
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      if (color) {
        settings.dock_color = color;
        chrome.storage.local.set({ dock_color: color });
        applySettingsToUI();
      }
    });
  });

  if (inputCustomColor) {
    inputCustomColor.addEventListener('input', () => {
      const color = inputCustomColor.value;
      settings.dock_color = color;
      chrome.storage.local.set({ dock_color: color });
      applySettingsToUI();
    });
  }

  // Reset Positions Button
  if (modalResetPosBtn) {
    modalResetPosBtn.addEventListener('click', () => {
      settings.clock_pos = { x: 60, y: 80 };
      settings.weather_pos = { x: 60, y: 250 };
      chrome.storage.local.set({
        clock_pos: settings.clock_pos,
        weather_pos: settings.weather_pos
      });
      applySettingsToUI();
    });
  }

  // Listen for storage changes across tabs
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      let shouldReapply = false;
      for (const [key, change] of Object.entries(changes)) {
        if (key in settings) {
          settings[key] = change.newValue;
          shouldReapply = true;
        }
      }
      if (shouldReapply) {
        applySettingsToUI();
      }
    }
  });

  // Initialize
  loadSettings();
})();
