/**
 * App Tower Panel Script (Manifest V3 Compliant)
 */

(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const app = urlParams.get('app') || 'keep';
  const iframe = document.getElementById('app-frame');
  const loader = document.getElementById('loader');
  const loadingText = document.getElementById('loading-text');

  const URLS = {
    keep: 'https://keep.google.com/',
    messages: 'https://messages.google.com/web',
    calendar: 'https://calendar.google.com/',
    tasks: 'https://tasks.google.com/'
  };

  const targetUrl = URLS[app] || (app.startsWith('http') ? app : URLS.keep);

  if (loadingText) {
    loadingText.textContent = app === 'keep' ? 'Loading Google Keep...' : 'Loading Google Messages...';
  }

  function hideLoader() {
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }

  if (iframe) {
    iframe.addEventListener('load', hideLoader);
    iframe.src = targetUrl;
  }

  // Safety timer in case long-polling deferred window load
  setTimeout(hideLoader, 1000);
})();
