/**
 * App Tower New Tab Page Script
 * Manages real-time clock, smart Google Search, and fast keyboard navigation.
 */

(function () {
  'use strict';

  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('live-date');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  // 1. Live Clock & Date
  function updateTime() {
    const now = new Date();
    
    // Time formatted as 12-hour or standard
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const isAm = hours < 12;
    hours = hours % 12;
    if (hours === 0) hours = 12;

    if (clockEl) {
      clockEl.textContent = `${hours}:${minutes}`;
    }

    // Full Date: "Wednesday, October 7"
    if (dateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString(undefined, options);
    }
  }

  updateTime();
  setInterval(updateTime, 1000);

  // 2. Smart Search & Direct URL Navigation
  if (searchForm && searchInput) {
    // Autofocus input so user can immediately type
    searchInput.focus();

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = searchInput.value.trim();
      if (!raw) return;

      // Check if user entered a direct web URL
      const isHttp = /^https?:\/\//i.test(raw);
      const isDomain = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(raw);

      if (isHttp) {
        window.location.href = raw;
      } else if (isDomain) {
        window.location.href = `https://${raw}`;
      } else {
        // Standard Google Search
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
      }
    });

    // Re-focus on window focus (e.g. switching back to tab)
    window.addEventListener('focus', () => {
      searchInput.focus();
    });
  }
})();
