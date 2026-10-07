/**
 * App Tower Native Side Panel Logic
 */

(function () {
  const tabKeep = document.getElementById('tab-keep');
  const tabMessages = document.getElementById('tab-messages');
  const frameKeep = document.getElementById('frame-keep');
  const frameMessages = document.getElementById('frame-messages');
  const btnReload = document.getElementById('btn-reload');
  const btnExternal = document.getElementById('btn-external');

  let activeApp = 'keep';

  function switchTab(app) {
    activeApp = app;
    tabKeep.classList.toggle('active', app === 'keep');
    tabMessages.classList.toggle('active', app === 'messages');
    frameKeep.classList.toggle('active', app === 'keep');
    frameMessages.classList.toggle('active', app === 'messages');
  }

  tabKeep.addEventListener('click', () => switchTab('keep'));
  tabMessages.addEventListener('click', () => switchTab('messages'));

  btnReload.addEventListener('click', () => {
    const activeFrame = activeApp === 'keep' ? frameKeep : frameMessages;
    const url = activeApp === 'keep' ? 'https://keep.google.com/' : 'https://messages.google.com/web';
    activeFrame.src = url;
  });

  btnExternal.addEventListener('click', () => {
    const url = activeApp === 'keep' ? 'https://keep.google.com/' : 'https://messages.google.com/web';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
