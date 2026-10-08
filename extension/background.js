/**
 * App Tower Background Service Worker (Manifest V3)
 * Manages frameless floating companion windows positioned adjacent to the docked sidebar.
 * Automatically saves and restores custom window size & location per app.
 * Configures real Mobile vs Desktop User-Agent and Client Hints via declarativeNetRequest
 * so websites automatically switch to their dedicated mobile or desktop layout.
 * Ensures companion app windows exclude the sidebar dock entirely.
 * Preserves custom window size and position when saving app settings.
 */

const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const DEFAULT_APPS = [];

// Set of in-memory active companion window IDs (so content script knows not to inject sidebar)
const companionWindowIds = new Set();

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['companion_windows', 'dock_apps', 'app_bounds', 'dock_collapsed']);
  if (!Array.isArray(data.dock_apps)) {
    await chrome.storage.local.set({ dock_apps: [] });
  }
  if (!data.companion_windows) {
    await chrome.storage.local.set({ companion_windows: {} });
  }
  if (!data.app_bounds) {
    await chrome.storage.local.set({ app_bounds: {} });
  }
  if (typeof data.dock_collapsed !== 'boolean') {
    await chrome.storage.local.set({ dock_collapsed: false });
  }
});

// Helper to get tracked companion windows
async function getStoredTracker() {
  const data = await chrome.storage.local.get(['companion_windows']);
  return data.companion_windows || {};
}

// Helper to save tracked companion windows
async function saveStoredTracker(tracker) {
  await chrome.storage.local.set({ companion_windows: tracker });
}

// Check if a window ID belongs to a companion app window
async function isCompanionWindow(winId) {
  if (!winId) return false;
  if (companionWindowIds.has(winId)) return true;
  const tracker = await getStoredTracker();
  for (const savedWinId of Object.values(tracker)) {
    if (savedWinId === winId) {
      companionWindowIds.add(winId);
      return true;
    }
  }
  return false;
}

// Helper to get saved bounds for an app
async function getSavedAppBounds(appId) {
  try {
    const data = await chrome.storage.local.get(['app_bounds']);
    const allBounds = (data && data.app_bounds) || {};
    return allBounds[appId] || null;
  } catch (e) {
    return null;
  }
}

// Helper to save bounds for an app
async function saveAppBounds(appId, bounds) {
  try {
    const data = await chrome.storage.local.get(['app_bounds']);
    const allBounds = (data && data.app_bounds) || {};
    allBounds[appId] = bounds;
    await chrome.storage.local.set({ app_bounds: allBounds });
  } catch (e) {
    console.error('Failed to save app bounds:', e);
  }
}

// Helper to reset bounds for an app
async function resetAppBounds(appId) {
  try {
    const data = await chrome.storage.local.get(['app_bounds']);
    const allBounds = (data && data.app_bounds) || {};
    delete allBounds[appId];
    await chrome.storage.local.set({ app_bounds: allBounds });
  } catch (e) {
    console.error('Failed to reset app bounds:', e);
  }
}

// Helper to get app configuration
async function getAppConfig(appId) {
  const data = await chrome.storage.local.get(['dock_apps']);
  const apps = data.dock_apps || DEFAULT_APPS;
  return apps.find(a => a.id === appId) || { id: appId, name: 'Web App', url: 'https://google.com', isMobile: false };
}

/**
 * Configure declarativeNetRequest session rules for a specific tab ID.
 * When isMobile is true:
 * - Overrides HTTP User-Agent to Pixel 8 Mobile Safari/Chrome
 * - Sets Sec-CH-UA-Mobile: ?1 and Sec-CH-UA-Platform: "Android"
 * When isMobile is false:
 * - Overrides HTTP User-Agent to Standard Desktop Windows x64 Chrome
 * - Sets Sec-CH-UA-Mobile: ?0 and Sec-CH-UA-Platform: "Windows"
 */
async function applyTabUserAgent(tabId, isMobile) {
  if (!tabId || !chrome.declarativeNetRequest) return;

  const ruleId = 100000 + tabId;
  const userAgentString = isMobile ? MOBILE_USER_AGENT : DESKTOP_USER_AGENT;
  const chMobile = isMobile ? '?1' : '?0';
  const chPlatform = isMobile ? '"Android"' : '"Windows"';

  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId],
      addRules: [
        {
          id: ruleId,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'User-Agent',
                operation: 'set',
                value: userAgentString
              },
              {
                header: 'sec-ch-ua-mobile',
                operation: 'set',
                value: chMobile
              },
              {
                header: 'sec-ch-ua-platform',
                operation: 'set',
                value: chPlatform
              }
            ]
          },
          condition: {
            tabIds: [tabId],
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'stylesheet',
              'script',
              'image',
              'font',
              'object',
              'xmlhttprequest',
              'ping',
              'other'
            ]
          }
        }
      ]
    });
  } catch (err) {
    console.warn('Failed to update declarativeNetRequest rules for tab', tabId, err);
  }

  // Also inject client-side navigator override to ensure navigator.userAgent matches
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN',
      func: (ua, mobile) => {
        try {
          Object.defineProperty(navigator, 'userAgent', {
            get: () => ua,
            configurable: true
          });
          Object.defineProperty(navigator, 'appVersion', {
            get: () => ua.replace(/^Mozilla\//, ''),
            configurable: true
          });
          Object.defineProperty(navigator, 'platform', {
            get: () => (mobile ? 'Linux armv8l' : 'Win32'),
            configurable: true
          });
          Object.defineProperty(navigator, 'maxTouchPoints', {
            get: () => (mobile ? 5 : 0),
            configurable: true
          });
          if (navigator.userAgentData) {
            Object.defineProperty(navigator.userAgentData, 'mobile', {
              get: () => mobile,
              configurable: true
            });
            Object.defineProperty(navigator.userAgentData, 'platform', {
              get: () => (mobile ? 'Android' : 'Windows'),
              configurable: true
            });
          }
        } catch (e) {}
      },
      args: [userAgentString, isMobile]
    });
  } catch (scriptErr) {
    // Some chrome:// or restricted URLs cannot be scripted, which is normal
  }
}

async function removeTabUserAgentRule(tabId) {
  if (!tabId || !chrome.declarativeNetRequest) return;
  const ruleId = 100000 + tabId;
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId]
    });
  } catch (e) {}
}

// Clean up rules when tabs close
chrome.tabs.onRemoved.addListener((tabId) => {
  removeTabUserAgentRule(tabId);
});

// Helper to find existing companion window for an app
async function findExistingAppWindow(appId, appUrl) {
  const tracker = await getStoredTracker();
  const trackedId = tracker[appId];

  // 1. Check if tracked window ID is still valid
  if (trackedId) {
    try {
      const win = await chrome.windows.get(trackedId, { populate: true });
      if (win) {
        companionWindowIds.add(win.id);
        const tabId = win.tabs && win.tabs[0] ? win.tabs[0].id : null;
        return { window: win, tabId };
      }
    } catch (e) {
      tracker[appId] = null;
      companionWindowIds.delete(trackedId);
      await saveStoredTracker(tracker);
    }
  }

  // 2. Fallback: Search open tabs for this app's URL if available
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      const pattern = `*://${parsed.hostname}/*`;
      const matchingTabs = await chrome.tabs.query({ url: pattern });
      for (const tab of matchingTabs) {
        if (tab.windowId) {
          try {
            const win = await chrome.windows.get(tab.windowId, { populate: true });
            if (win && win.type === 'popup') {
              tracker[appId] = win.id;
              companionWindowIds.add(win.id);
              await saveStoredTracker(tracker);
              return { window: win, tabId: tab.id };
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  return null;
}

// Listen for messages from content script dock and check companion window status
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if current sender tab belongs to an App Tower companion window
  if (message.action === 'check_is_companion_window') {
    const senderWinId = sender && sender.tab ? sender.tab.windowId : null;
    isCompanionWindow(senderWinId).then((isCompanion) => {
      sendResponse({ isCompanion: isCompanion });
    });
    return true;
  }

  if (message.action === 'toggle_companion_window') {
    handleToggleWindow(message.app, message.url, message.isMobile, message.metrics, sender);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'get_companion_states') {
    checkAllCompanionStates().then((states) => {
      sendResponse(states);
    });
    return true;
  }

  if (message.action === 'reset_app_bounds') {
    handleResetAppBounds(message.app, sender).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'app_config_updated') {
    handleAppConfigUpdated(message.appId, message.app, sender).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function checkAllCompanionStates() {
  const tracker = await getStoredTracker();
  const states = {};
  for (const [appId, winId] of Object.entries(tracker)) {
    if (winId) {
      try {
        const win = await chrome.windows.get(winId);
        states[appId] = !!win;
        if (win) companionWindowIds.add(winId);
      } catch (e) {
        states[appId] = false;
      }
    } else {
      states[appId] = false;
    }
  }
  return states;
}

/**
 * When an app's configuration is edited (URL or Mobile/Desktop mode changed):
 * Keeps the user's custom window size and location intact (does NOT revert bounds).
 * Updates User-Agent rules and reloads the open window so the website switches layouts smoothly!
 */
async function handleAppConfigUpdated(appId, appConfig, sender) {
  if (!appConfig) return;
  const isMobile = !!appConfig.isMobile;

  // Check if saved bounds already exist; keep them untouched so windows maintain custom size/location
  const existingBounds = await getSavedAppBounds(appId);
  if (!existingBounds) {
    let hostWin = null;
    if (sender && sender.tab && sender.tab.windowId) {
      try { hostWin = await chrome.windows.get(sender.tab.windowId); } catch (e) {}
    }
    if (!hostWin) {
      try { hostWin = await chrome.windows.getLastFocused(); } catch (e) {}
    }

    const dockWidth = 44;
    const defaultWidth = isMobile ? 390 : 480;
    let defaultHeight = isMobile ? Math.min(hostWin ? hostWin.height : 760, 760) : (hostWin ? hostWin.height : 920);
    if (!defaultHeight || defaultHeight < 400) defaultHeight = isMobile ? 720 : 880;

    let defaultLeft = 1920 - dockWidth - defaultWidth;
    let defaultTop = 0;
    if (hostWin && typeof hostWin.left === 'number' && typeof hostWin.width === 'number') {
      defaultLeft = Math.max(0, hostWin.left + hostWin.width - dockWidth - defaultWidth);
      defaultTop = hostWin.top || 0;
    }

    await saveAppBounds(appId, {
      left: Math.round(defaultLeft),
      top: Math.round(defaultTop),
      width: defaultWidth,
      height: Math.round(defaultHeight)
    });
  }

  // If the window is currently open, DO NOT force resize or reposition it!
  // Only apply the new User-Agent and reload the tab so the website switches layouts.
  const existing = await findExistingAppWindow(appId, appConfig.url);
  if (existing && existing.window) {
    try {
      if (existing.tabId) {
        // Apply the Mobile vs Desktop User-Agent rule to the tab
        await applyTabUserAgent(existing.tabId, isMobile);
        // Reload/refresh the tab so the website receives the new User-Agent and switches layouts!
        await chrome.tabs.reload(existing.tabId);
      }
    } catch (e) {
      console.warn('Could not refresh existing companion window:', e);
    }
  }
}

async function handleResetAppBounds(appId, sender) {
  await resetAppBounds(appId);
  const appConfig = await getAppConfig(appId);

  const existing = await findExistingAppWindow(appId, appConfig.url);
  if (existing && existing.window) {
    let hostWin = null;
    if (sender && sender.tab && sender.tab.windowId) {
      try {
        hostWin = await chrome.windows.get(sender.tab.windowId);
      } catch (e) {}
    }
    if (!hostWin) {
      try {
        hostWin = await chrome.windows.getLastFocused();
      } catch (e) {}
    }

    const dockWidth = 44;
    const isMobile = !!appConfig.isMobile;
    const defaultWidth = isMobile ? 390 : 480;
    const defaultHeight = isMobile ? Math.min(hostWin ? hostWin.height : 760, 760) : (hostWin ? (hostWin.height || 920) : 920);
    const defaultTop = hostWin ? (hostWin.top || 0) : 0;
    const defaultLeft = hostWin && typeof hostWin.left === 'number' && typeof hostWin.width === 'number'
      ? Math.max(0, hostWin.left + hostWin.width - dockWidth - defaultWidth)
      : (1920 - dockWidth - defaultWidth);

    try {
      await chrome.windows.update(existing.window.id, {
        left: Math.round(defaultLeft),
        top: Math.round(defaultTop),
        width: defaultWidth,
        height: Math.round(defaultHeight),
        state: 'normal',
        focused: true
      });
    } catch (e) {
      console.warn('Failed to update window bounds on reset:', e);
    }
  }
}

async function handleToggleWindow(appId, appUrlOverride, isMobileOverride, clientMetrics, sender) {
  const appConfig = await getAppConfig(appId);
  const targetUrl = appUrlOverride || appConfig.url || 'https://google.com';
  const isMobile = typeof isMobileOverride === 'boolean' ? isMobileOverride : !!appConfig.isMobile;

  let hostWin = null;
  if (sender && sender.tab && sender.tab.windowId) {
    try {
      hostWin = await chrome.windows.get(sender.tab.windowId);
    } catch (e) {}
  }
  if (!hostWin) {
    try {
      hostWin = await chrome.windows.getLastFocused();
    } catch (e) {}
  }

  const dockWidth = 44;
  const defaultWidth = isMobile ? 390 : 480;
  let defaultHeight = isMobile ? Math.min(hostWin ? hostWin.height : 760, 760) : (hostWin ? hostWin.height : 920);
  if (!defaultHeight || defaultHeight < 400) defaultHeight = isMobile ? 720 : 880;

  let defaultLeft, defaultTop;
  if (hostWin && typeof hostWin.left === 'number' && typeof hostWin.width === 'number') {
    defaultLeft = Math.max(0, hostWin.left + hostWin.width - dockWidth - defaultWidth);
    defaultTop = hostWin.top || 0;
  } else if (clientMetrics) {
    defaultLeft = Math.max(0, (clientMetrics.screenWidth || 1920) - dockWidth - defaultWidth);
    defaultTop = clientMetrics.top || 0;
  } else {
    defaultLeft = 1920 - dockWidth - defaultWidth;
    defaultTop = 0;
  }

  const savedBounds = await getSavedAppBounds(appId);
  let targetLeft = (savedBounds && typeof savedBounds.left === 'number') ? savedBounds.left : defaultLeft;
  let targetTop = (savedBounds && typeof savedBounds.top === 'number') ? savedBounds.top : defaultTop;
  let targetWidth = (savedBounds && typeof savedBounds.width === 'number') ? savedBounds.width : defaultWidth;
  let targetHeight = (savedBounds && typeof savedBounds.height === 'number') ? savedBounds.height : defaultHeight;

  // 1. Search for existing window
  const existing = await findExistingAppWindow(appId, targetUrl);

  if (existing && existing.window) {
    const win = existing.window;

    try {
      const updateInfo = {
        focused: true,
        drawAttention: true
      };

      if (win.state === 'minimized') {
        updateInfo.state = 'normal';
      }

      // DO NOT force or revert coordinates onto an already open window; preserve where user placed it!
      await chrome.windows.update(win.id, updateInfo);

      if (existing.tabId) {
        await applyTabUserAgent(existing.tabId, isMobile);
        await chrome.tabs.update(existing.tabId, { active: true }).catch(() => {});
      }

      notifyDockState(appId, true);
      return;
    } catch (e) {
      console.warn('Error focusing existing window:', e);
    }
  }

  // 2. Create new companion window
  try {
    const newWin = await chrome.windows.create({
      url: targetUrl,
      type: 'popup', // Frameless floating companion window
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
      left: Math.round(targetLeft),
      top: Math.round(targetTop),
      focused: true
    });

    companionWindowIds.add(newWin.id);

    const tracker = await getStoredTracker();
    tracker[appId] = newWin.id;
    await saveStoredTracker(tracker);

    // Save initial bounds immediately
    if (typeof newWin.left === 'number' && typeof newWin.top === 'number') {
      await saveAppBounds(appId, {
        left: newWin.left,
        top: newWin.top,
        width: newWin.width || Math.round(targetWidth),
        height: newWin.height || Math.round(targetHeight)
      });
    }

    if (newWin.tabs && newWin.tabs[0]) {
      const tabId = newWin.tabs[0].id;
      // Configure Mobile vs Desktop User-Agent for this tab
      await applyTabUserAgent(tabId, isMobile);
      if (isMobile) {
        // Reload once so the initial server request delivers the Mobile site
        setTimeout(() => {
          chrome.tabs.reload(tabId).catch(() => {});
        }, 150);
      }
    }

    notifyDockState(appId, true);
  } catch (error) {
    console.error('Failed to create companion window:', error);
  }
}

// Window bounds changed listener: continuously saves custom size & location per app
chrome.windows.onBoundsChanged.addListener(async (win) => {
  if (!win || !win.id) return;
  if (win.state && win.state !== 'normal') return;

  const tracker = await getStoredTracker();
  for (const [appId, trackedWinId] of Object.entries(tracker)) {
    if (trackedWinId === win.id) {
      if (
        typeof win.left === 'number' &&
        typeof win.top === 'number' &&
        typeof win.width === 'number' &&
        typeof win.height === 'number'
      ) {
        await saveAppBounds(appId, {
          left: win.left,
          top: win.top,
          width: win.width,
          height: win.height
        });
      }
      break;
    }
  }
});

// Window removed listener: clean up rules and tracking
chrome.windows.onRemoved.addListener(async (removedWinId) => {
  companionWindowIds.delete(removedWinId);

  const tracker = await getStoredTracker();
  let changed = false;

  for (const [app, winId] of Object.entries(tracker)) {
    if (winId === removedWinId) {
      tracker[app] = null;
      changed = true;
      notifyDockState(app, false);
    }
  }

  if (changed) {
    await saveStoredTracker(tracker);
  }
});

// Broadcast dock state change to all tabs
async function notifyDockState(appId, isOpen) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'companion_state_changed',
          app: appId,
          isOpen: isOpen
        }).catch(() => {});
      }
    }
  } catch (e) {}
}

// Toggle dock collapsed state when clicking extension action button in toolbar
chrome.action.onClicked.addListener(async (tab) => {
  const data = await chrome.storage.local.get(['dock_collapsed']);
  const newState = !data.dock_collapsed;
  await chrome.storage.local.set({ dock_collapsed: newState });

  // If invoked on an active tab, message it immediately
  if (tab && tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggle_dock',
        collapsed: newState
      });
      return;
    } catch (e) {
      // Tab might be on a page where content scripts are restricted (e.g. Chrome Web Store or chrome://)
    }
  }

  // Broadcast to all valid tabs
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (t.id && t.url && !t.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(t.id, {
        action: 'toggle_dock',
        collapsed: newState
      }).catch(() => {});
    }
  }
});
