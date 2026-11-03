/**
 * App Tower - New Tab Page Script
 * Manages:
 * 1. Search provider selection (Google, DuckDuckGo, Bing, Ecosia, Brave, Custom)
 * 2. Background wallpapers (Obsidian Glow, Bing Daily Rotation, Mountains, Cosmic, Custom URL) with optional frosted glass blur
 * 3. Draggable Live Clock Applet (IP/location-based time & timezone)
 * 4. Draggable Live Weather Applet (IP/location-based live weather via Open-Meteo)
 * 5. Extension settings (Sidebar width, Sidebar color, Applet positions)
 */

(function () {
  'use strict';

  // DOM Elements
  const bgOverlay = document.getElementById('bg-overlay');
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
  const clockLocBadge = document.getElementById('clock-loc-badge');
  const weatherLocBadge = document.getElementById('weather-loc-badge');

  // Search
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  // Settings Controls
  const toggleBlurWallpaper = document.getElementById('toggle-blur-wallpaper');
  const toggleClock = document.getElementById('toggle-clock-applet');
  const toggleWeather = document.getElementById('toggle-weather-applet');
  const inputCustomZip = document.getElementById('input-custom-zip');
  const btnSaveZip = document.getElementById('btn-save-zip');
  const btnResetZip = document.getElementById('btn-reset-zip');
  const zipStatusMsg = document.getElementById('zip-status-msg');
  const zipStatusText = document.getElementById('zip-status-text');
  const sectionZipCode = document.getElementById('section-zip-code');
  const providerRadios = document.querySelectorAll('input[name="search-provider"]');
  const customSearchContainer = document.getElementById('custom-search-container');
  const customSearchUrlInput = document.getElementById('custom-search-url');
  const bgRadios = document.querySelectorAll('input[name="bg-type"]');
  const customBgContainer = document.getElementById('custom-bg-container');
  const customBgUrlInput = document.getElementById('custom-bg-url');
  const inputSidebarWidth = document.getElementById('input-sidebar-width');
  const labelSidebarWidth = document.getElementById('label-sidebar-width');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  // Helper to read cached ZIP synchronously on page boot
  function getCachedZip() {
    try {
      return (localStorage.getItem('app_tower_custom_zip') || '').trim();
    } catch (e) {
      return '';
    }
  }

  // Helper to read cached widget position synchronously on page boot
  function getCachedPos(key, defaultPos) {
    try {
      const raw = localStorage.getItem('app_tower_' + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    return defaultPos;
  }

  const initialCachedZip = getCachedZip();
  const initialClockPos = getCachedPos('clock_pos', { x: 60, y: 90 });
  const initialWeatherPos = getCachedPos('weather_pos', { x: 60, y: 250 });

  // Immediately position applets before first paint so they never flicker or jump
  if (clockApplet) {
    clockApplet.style.left = `${initialClockPos.x}px`;
    clockApplet.style.top = `${initialClockPos.y}px`;
  }
  if (weatherApplet) {
    weatherApplet.style.left = `${initialWeatherPos.x}px`;
    weatherApplet.style.top = `${initialWeatherPos.y}px`;
  }

  // State
  let settings = {
    search_provider: 'google',
    custom_search_url: '',
    bg_type: 'gradient',
    custom_bg_url: '',
    blur_bg: false, // Crisp high-definition wallpaper by default!
    show_clock: true,
    show_weather: true,
    custom_zip: initialCachedZip, // Custom ZIP code for weather & time (empty for Auto IP)
    clock_pos: initialClockPos,
    weather_pos: initialWeatherPos,
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
      'search_provider',
      'custom_search_url',
      'bg_type',
      'custom_bg_url',
      'blur_bg',
      'show_clock',
      'show_weather',
      'custom_zip',
      'clock_pos',
      'weather_pos',
      'dock_width',
      'dock_color'
    ], (data) => {
      if (data.search_provider) settings.search_provider = data.search_provider;
      if (data.custom_search_url) settings.custom_search_url = data.custom_search_url;
      if (data.bg_type) settings.bg_type = data.bg_type;
      if (data.custom_bg_url) settings.custom_bg_url = data.custom_bg_url;
      if (typeof data.blur_bg === 'boolean') settings.blur_bg = data.blur_bg;
      if (typeof data.show_clock === 'boolean') settings.show_clock = data.show_clock;
      if (typeof data.show_weather === 'boolean') settings.show_weather = data.show_weather;
      if (typeof data.custom_zip === 'string') {
        settings.custom_zip = data.custom_zip.trim();
        try {
          if (settings.custom_zip) {
            localStorage.setItem('app_tower_custom_zip', settings.custom_zip);
          } else {
            localStorage.removeItem('app_tower_custom_zip');
          }
        } catch (e) {}
      }
      if (data.clock_pos && typeof data.clock_pos.x === 'number') {
        settings.clock_pos = data.clock_pos;
        try {
          localStorage.setItem('app_tower_clock_pos', JSON.stringify(data.clock_pos));
        } catch (e) {}
      }
      if (data.weather_pos && typeof data.weather_pos.x === 'number') {
        settings.weather_pos = data.weather_pos;
        try {
          localStorage.setItem('app_tower_weather_pos', JSON.stringify(data.weather_pos));
        } catch (e) {}
      }
      if (typeof data.dock_width === 'number') settings.dock_width = data.dock_width;
      if (data.dock_color) settings.dock_color = data.dock_color;

      applySettingsToUI();
      fetchLiveWeather();
    });
  }

  // 2. Apply Settings to UI
  function applySettingsToUI() {
    applyWallpaper(settings.bg_type, settings.custom_bg_url);

    // Toggle states
    if (toggleBlurWallpaper) toggleBlurWallpaper.checked = !!settings.blur_bg;
    if (toggleClock) toggleClock.checked = !!settings.show_clock;
    if (toggleWeather) toggleWeather.checked = !!settings.show_weather;

    // ZIP Code input
    if (inputCustomZip && document.activeElement !== inputCustomZip) {
      inputCustomZip.value = settings.custom_zip || '';
    }

    // Clock visibility & position
    if (clockApplet) {
      clockApplet.style.display = settings.show_clock ? 'block' : 'none';
      clockApplet.style.left = `${settings.clock_pos.x}px`;
      clockApplet.style.top = `${settings.clock_pos.y}px`;
    }

    // Weather visibility & position
    if (weatherApplet) {
      weatherApplet.style.display = settings.show_weather ? 'block' : 'none';
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

    // Background type radios
    bgRadios.forEach(r => {
      r.checked = r.value === settings.bg_type;
    });
    if (customBgContainer) {
      customBgContainer.style.display = settings.bg_type === 'custom' ? 'flex' : 'none';
    }
    if (customBgUrlInput) {
      customBgUrlInput.value = settings.custom_bg_url || '';
    }

    // Update search placeholder
    if (searchInput) {
      const currentProv = SEARCH_PROVIDERS[settings.search_provider];
      const provName = currentProv ? currentProv.name : 'Web';
      searchInput.placeholder = `Search with ${provName} or enter a URL...`;
    }

    // Sidebar settings
    if (inputSidebarWidth) {
      inputSidebarWidth.value = String(settings.dock_width);
    }
    if (labelSidebarWidth) {
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

    if (settings.blur_bg) {
      bgOverlay.classList.add('is-blurred');
    } else {
      bgOverlay.classList.remove('is-blurred');
    }

    if (bgType === 'gradient') {
      bgOverlay.style.backgroundImage = '';
      bgOverlay.classList.remove('has-wallpaper');
      bgOverlay.classList.remove('is-blurred');
    } else if (bgType === 'custom' && customUrl) {
      bgOverlay.style.backgroundImage = `url("${customUrl}")`;
      bgOverlay.classList.add('has-wallpaper');
    } else if (WALLPAPERS[bgType]) {
      bgOverlay.style.backgroundImage = `url("${WALLPAPERS[bgType]}")`;
      bgOverlay.classList.add('has-wallpaper');
    } else {
      bgOverlay.style.backgroundImage = '';
      bgOverlay.classList.remove('has-wallpaper');
      bgOverlay.classList.remove('is-blurred');
    }
  }

  // 4. Live Clock & Geolocation/IP Time
  let resolvedCity = '';
  let resolvedTimezone = '';

  // Synchronously restore cached location for this ZIP if available so UI doesn't flicker or show Auto IP
  try {
    const cachedLocRaw = localStorage.getItem('app_tower_cached_loc');
    if (cachedLocRaw) {
      const cached = JSON.parse(cachedLocRaw);
      if (cached && (initialCachedZip ? cached.zip === initialCachedZip : !cached.zip)) {
        if (cached.city) {
          resolvedCity = cached.city;
          if (clockLocText) clockLocText.textContent = resolvedCity;
          if (weatherCityBadge) weatherCityBadge.textContent = resolvedCity;
        }
        if (cached.tz) {
          resolvedTimezone = cached.tz;
        }
        if (cached.temp && weatherTempVal) {
          weatherTempVal.textContent = `${cached.temp}°F`;
        }
        if (cached.condition && weatherConditionText) {
          weatherConditionText.textContent = cached.condition;
        }
      }
    } else if (initialCachedZip) {
      if (clockLocText) clockLocText.textContent = `ZIP ${initialCachedZip}`;
      if (weatherCityBadge) weatherCityBadge.textContent = `ZIP ${initialCachedZip}`;
    }
  } catch (e) {}

  function updateClock() {
    const now = new Date();

    if (resolvedTimezone) {
      try {
        const timeParts = new Intl.DateTimeFormat('en-US', {
          timeZone: resolvedTimezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).formatToParts(now);

        const hourVal = timeParts.find(p => p.type === 'hour')?.value || '12';
        const minuteVal = timeParts.find(p => p.type === 'minute')?.value || '00';
        const dayPeriod = timeParts.find(p => p.type === 'dayPeriod')?.value?.toUpperCase() || 'AM';

        if (clockTimeEl) clockTimeEl.textContent = `${hourVal}:${minuteVal}`;
        if (clockAmpmEl) clockAmpmEl.textContent = dayPeriod;

        if (clockDateEl) {
          const dateOptions = { timeZone: resolvedTimezone, weekday: 'long', month: 'long', day: 'numeric' };
          clockDateEl.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        }
        return;
      } catch (e) {
        // Fallback to local time below
      }
    }

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

  let latestWeatherRequestId = 0;

  // Resilient multi-source Auto-IP locator (handles rate-limiting, CORS, and fallbacks)
  async function detectAutoIpLocation() {
    // 1. Try ipwho.is (CORS open, fast, accurate)
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const region = data.region_code || data.region || '';
          const city = data.city ? (region ? `${data.city}, ${region}` : data.city) : (data.country || 'Local');
          const tz = data.timezone && data.timezone.id ? data.timezone.id : '';
          return { lat: data.latitude, lon: data.longitude, city, tz };
        }
      }
    } catch (e) {}

    // 2. Try geojs.io (Free open-source GEO IP, CORS open, zero rate-limits)
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const region = data.region || '';
          const city = data.city ? (region ? `${data.city}, ${region}` : data.city) : (data.country || 'Local');
          const tz = data.timezone || '';
          return { lat, lon, city, tz };
        }
      }
    } catch (e) {}

    // 3. Try ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const region = data.region_code || data.region || '';
          const city = data.city ? (region ? `${data.city}, ${region}` : data.city) : 'Local';
          const tz = data.timezone || '';
          return { lat: data.latitude, lon: data.longitude, city, tz };
        }
      }
    } catch (e) {}

    // 4. Local browser Intl timezone fallback
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz) {
        const cityName = tz.split('/').pop().replace(/_/g, ' ');
        return { lat: 40.7128, lon: -74.0060, city: cityName, tz };
      }
    } catch (e) {}

    return { lat: 40.7128, lon: -74.0060, city: 'Local Area', tz: '' };
  }

  // 5. Live Weather with Open-Meteo & Geo-IP or Custom ZIP Code
  async function fetchLiveWeather() {
    const currentRequestId = ++latestWeatherRequestId;

    try {
      let lat = 40.7128;
      let lon = -74.0060;
      let city = 'New York';
      let tz = '';
      let isCustom = false;

      // Always read current custom ZIP from settings or fallback to cached synchronous storage
      const userZip = (typeof settings.custom_zip === 'string' ? settings.custom_zip : getCachedZip()).trim();

      if (userZip) {
        if (zipStatusMsg) zipStatusMsg.className = 'zip-status-msg is-loading';
        if (zipStatusText) zipStatusText.textContent = `Resolving location for "${userZip}"...`;

        let geoSuccess = false;

        // 1. Try US 5-digit ZIP via zippopotam.us (fastest, CORS-enabled, official US zip DB)
        if (/^\d{5}$/.test(userZip)) {
          try {
            const zipRes = await fetch(`https://api.zippopotam.us/us/${userZip}`);
            if (zipRes.ok) {
              const zipData = await zipRes.json();
              if (zipData && Array.isArray(zipData.places) && zipData.places.length > 0) {
                const place = zipData.places[0];
                lat = parseFloat(place.latitude);
                lon = parseFloat(place.longitude);
                city = `${place['place name']}, ${place['state abbreviation']}`;
                geoSuccess = true;
                isCustom = true;
              }
            }
          } catch (e) {
            // fallback to open-meteo search
          }
        }

        // 2. If not 5-digit US or if zippopotam failed, try Open-Meteo geocoding search
        if (!geoSuccess) {
          try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(userZip)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && Array.isArray(geoData.results) && geoData.results.length > 0) {
                const r = geoData.results[0];
                lat = r.latitude;
                lon = r.longitude;
                const stateOrCountry = r.admin1 || (r.country_code ? r.country_code.toUpperCase() : '');
                city = stateOrCountry ? `${r.name}, ${stateOrCountry}` : r.name;
                if (r.timezone) tz = r.timezone;
                geoSuccess = true;
                isCustom = true;
              }
            }
          } catch (e) {
            // failed
          }
        }

        if (!geoSuccess) {
          if (currentRequestId !== latestWeatherRequestId) return;
          if (zipStatusMsg) zipStatusMsg.className = 'zip-status-msg is-error';
          if (zipStatusText) zipStatusText.textContent = `ZIP "${userZip}" not found.`;
          // If a custom zip was entered by the user, do NOT wipe it out with Auto IP!
          if (!resolvedCity) {
            resolvedCity = `ZIP ${userZip}`;
            if (clockLocText) clockLocText.textContent = resolvedCity;
            if (weatherCityBadge) weatherCityBadge.textContent = resolvedCity;
          }
          return;
        }
      } else {
        // Auto IP mode
        if (zipStatusMsg) zipStatusMsg.className = 'zip-status-msg is-loading';
        if (zipStatusText) zipStatusText.textContent = 'Detecting location via IP...';

        const autoLoc = await detectAutoIpLocation();
        lat = autoLoc.lat;
        lon = autoLoc.lon;
        city = autoLoc.city;
        if (autoLoc.tz) tz = autoLoc.tz;
      }

      // Check request sequence before updating DOM
      if (currentRequestId !== latestWeatherRequestId) return;

      resolvedCity = city;
      if (clockLocText) {
        clockLocText.textContent = city;
      }
      if (weatherCityBadge) {
        weatherCityBadge.textContent = city;
      }

      // 3. Fetch live weather & exact timezone from open-meteo (zero API key needed)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();

      if (currentRequestId !== latestWeatherRequestId) return;

      let currentTemp = 72;
      let weatherInfo = null;

      if (data) {
        if (data.timezone) {
          resolvedTimezone = data.timezone;
        } else if (tz) {
          resolvedTimezone = tz;
        }

        // Refresh clock to match the detected timezone immediately
        updateClock();

        if (data.current_weather) {
          const current = data.current_weather;
          currentTemp = Math.round(current.temperature);
          const code = current.weathercode;
          const wind = Math.round(current.windspeed);

          if (weatherTempVal) weatherTempVal.textContent = `${currentTemp}°F`;
          if (weatherWindText) weatherWindText.textContent = `Wind: ${wind} mph`;

          weatherInfo = mapWeatherCode(code);
          if (weatherConditionText) weatherConditionText.textContent = weatherInfo.condition;
          if (weatherIconContainer) weatherIconContainer.innerHTML = weatherInfo.svg;

          if (data.hourly && data.hourly.relativehumidity_2m && weatherHumidityText) {
            const humidity = data.hourly.relativehumidity_2m[0] || 55;
            weatherHumidityText.textContent = `Humidity: ${humidity}%`;
          }
        }
      }

      // Cache resolved data to localStorage for instant flicker-free load on refresh/newtab
      try {
        localStorage.setItem('app_tower_cached_loc', JSON.stringify({
          zip: userZip,
          city,
          tz: resolvedTimezone,
          temp: currentTemp,
          condition: weatherInfo ? weatherInfo.condition : ''
        }));
      } catch (e) {}

      // Update status text in settings modal
      if (isCustom) {
        if (zipStatusMsg) zipStatusMsg.className = 'zip-status-msg is-custom';
        const tzLabel = resolvedTimezone ? ` (${resolvedTimezone})` : '';
        if (zipStatusText) zipStatusText.textContent = `Custom ZIP ${userZip}: ${city}${tzLabel}`;
      } else if (!userZip) {
        if (zipStatusMsg) zipStatusMsg.className = 'zip-status-msg';
        const tzLabel = resolvedTimezone ? ` (${resolvedTimezone})` : '';
        if (zipStatusText) zipStatusText.textContent = `Auto IP: ${city}${tzLabel}`;
      }
    } catch (err) {
      if (currentRequestId !== latestWeatherRequestId) return;
      if (!resolvedCity) {
        if (clockLocText) clockLocText.textContent = 'Current Time';
        if (weatherCityBadge) weatherCityBadge.textContent = 'Weather';
        if (weatherTempVal) weatherTempVal.textContent = '72°F';
        if (weatherConditionText) weatherConditionText.textContent = 'Fair';
      }
    }
  }

  function mapWeatherCode(code) {
    if (code === 0) {
      return {
        condition: 'Clear Sky',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      };
    } else if (code >= 1 && code <= 3) {
      return {
        condition: 'Partly Cloudy',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#93c5fd" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`
      };
    } else if (code >= 45 && code <= 48) {
      return {
        condition: 'Foggy',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="2"><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
      };
    } else if (code >= 51 && code <= 67) {
      return {
        condition: 'Rain Showers',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#60a5fa" stroke-width="2"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`
      };
    } else if (code >= 71 && code <= 77) {
      return {
        condition: 'Snow',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#e2e8f0" stroke-width="2"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>`
      };
    } else if (code >= 80 && code <= 99) {
      return {
        condition: 'Thunderstorm',
        svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polygon points="13 11 9 17 15 17 11 23"/></svg>`
      };
    }
    return {
      condition: 'Overcast',
      svg: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#93c5fd" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`
    };
  }

  // Refresh live weather periodically (initial fetch is safely called inside loadSettings)
  setInterval(fetchLiveWeather, 15 * 60 * 1000);

  // 6. Draggable Applets Behavior
  function makeAppletDraggable(appletEl, storageKey) {
    if (!appletEl) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    appletEl.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons, links, inputs, or clickable location badges
      if (e.target.closest('button, a, input, select, textarea, .clickable, #weather-city-badge, #clock-loc-badge, #weather-loc-badge')) {
        return;
      }

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

      const maxLeft = Math.max(10, window.innerWidth - appletEl.offsetWidth - 20);
      const maxTop = Math.max(10, window.innerHeight - appletEl.offsetHeight - 20);

      newLeft = Math.max(10, Math.min(maxLeft, newLeft));
      newTop = Math.max(10, Math.min(maxTop, newTop));

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

      // Persist to both localStorage (instant sync on boot) and chrome.storage.local
      try {
        localStorage.setItem('app_tower_' + storageKey, JSON.stringify(pos));
      } catch (e) {}

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
      searchInput.focus();
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

  // Blur Wallpaper Toggle
  if (toggleBlurWallpaper) {
    toggleBlurWallpaper.addEventListener('change', () => {
      settings.blur_bg = toggleBlurWallpaper.checked;
      chrome.storage.local.set({ blur_bg: settings.blur_bg });
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

  // Location & Weather ZIP Code Controls
  function applyCustomZip() {
    if (!inputCustomZip) return;
    const val = inputCustomZip.value.trim();
    settings.custom_zip = val;
    try {
      if (val) {
        localStorage.setItem('app_tower_custom_zip', val);
      } else {
        localStorage.removeItem('app_tower_custom_zip');
        localStorage.removeItem('app_tower_cached_loc');
      }
    } catch (e) {}
    chrome.storage.local.set({ custom_zip: val });
    fetchLiveWeather();
  }

  function focusZipSetting() {
    openSettingsModal();
    if (sectionZipCode) {
      sectionZipCode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (inputCustomZip) {
      setTimeout(() => {
        inputCustomZip.focus();
        inputCustomZip.select();
      }, 150);
    }
  }

  if (clockLocBadge) {
    clockLocBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      focusZipSetting();
    });
  }

  if (weatherLocBadge) {
    weatherLocBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      focusZipSetting();
    });
  }

  if (btnSaveZip) {
    btnSaveZip.addEventListener('click', () => {
      applyCustomZip();
    });
  }

  if (inputCustomZip) {
    inputCustomZip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCustomZip();
      }
    });
  }

  if (btnResetZip) {
    btnResetZip.addEventListener('click', () => {
      if (inputCustomZip) inputCustomZip.value = '';
      settings.custom_zip = '';
      try {
        localStorage.removeItem('app_tower_custom_zip');
        localStorage.removeItem('app_tower_cached_loc');
      } catch (e) {}
      chrome.storage.local.set({ custom_zip: '' });
      fetchLiveWeather();
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
      settings.clock_pos = { x: 60, y: 90 };
      settings.weather_pos = { x: 60, y: 250 };
      try {
        localStorage.setItem('app_tower_clock_pos', JSON.stringify(settings.clock_pos));
        localStorage.setItem('app_tower_weather_pos', JSON.stringify(settings.weather_pos));
      } catch (e) {}
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
      let shouldRefetchWeather = false;
      for (const [key, change] of Object.entries(changes)) {
        if (key in settings) {
          settings[key] = change.newValue;
          shouldReapply = true;
          if (key === 'clock_pos' || key === 'weather_pos') {
            try {
              if (change.newValue) {
                localStorage.setItem('app_tower_' + key, JSON.stringify(change.newValue));
              } else {
                localStorage.removeItem('app_tower_' + key);
              }
            } catch (e) {}
          }
          if (key === 'custom_zip') {
            try {
              if (change.newValue) {
                localStorage.setItem('app_tower_custom_zip', change.newValue);
              } else {
                localStorage.removeItem('app_tower_custom_zip');
                localStorage.removeItem('app_tower_cached_loc');
              }
            } catch (e) {}
            shouldRefetchWeather = true;
          }
        }
      }
      if (shouldReapply) {
        applySettingsToUI();
      }
      if (shouldRefetchWeather) {
        fetchLiveWeather();
      }
    }
  });

  // Initialize
  loadSettings();
})();
