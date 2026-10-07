import React, { useState, useEffect, useRef } from 'react';
import { 
  Pin, 
  ExternalLink, 
  RotateCw, 
  RotateCcw,
  X, 
  Plus, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Send, 
  Trash2, 
  Lock,
  Move,
  Maximize2,
  Sliders,
  Smartphone,
  Monitor,
  Edit3,
  Wifi,
  Battery,
  Clock,
  Layers,
  PanelRight,
  Phone,
  Video,
  ArrowLeft,
  CheckSquare,
  Mic,
  Image as ImageIcon,
  Menu,
  Search,
  Settings,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  MapPin,
  GripVertical
} from 'lucide-react';

interface MockNote {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  time: string;
}

interface MockMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface ConfigApp {
  id: string;
  name: string;
  url: string;
  isMobile: boolean;
  iconType: 'keep' | 'messages' | 'custom';
}

interface WindowBounds {
  right: number;
  top: number;
  width: number;
  height: number;
}

const DEFAULT_APPS: ConfigApp[] = [
  {
    id: 'keep',
    name: 'Google Keep',
    url: 'https://keep.google.com/',
    isMobile: false,
    iconType: 'keep'
  },
  {
    id: 'messages',
    name: 'Google Messages',
    url: 'https://messages.google.com/web',
    isMobile: false,
    iconType: 'messages'
  }
];

export const LiveSimulator: React.FC = () => {
  const [apps, setApps] = useState<ConfigApp[]>(() => {
    try {
      const saved = localStorage.getItem('app_tower_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_APPS;
  });
  const [activeAppId, setActiveAppId] = useState<string | null>('keep');
  const [isPinned, setIsPinned] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [useLiveIframe, setUseLiveIframe] = useState(false);
  const [activeWebsite, setActiveWebsite] = useState<'doc' | 'portal' | 'dashboard' | 'newtab'>('doc');

  // Per-App saved window geometry (size & location)
  const [savedBounds, setSavedBounds] = useState<Record<string, WindowBounds>>(() => {
    try {
      const saved = localStorage.getItem('app_tower_bounds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {
      keep: { right: 44, top: 12, width: 460, height: 580 },
      messages: { right: 44, top: 12, width: 460, height: 580 }
    };
  });

  // Extension Settings State
  const [newTabOverrideEnabled, setNewTabOverrideEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('app_tower_override_enabled');
      return saved === 'true'; // disabled by default!
    } catch (e) {
      return false;
    }
  });

  const [dockWidth, setDockWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('app_tower_dock_width');
      return saved ? parseInt(saved, 10) || 44 : 44;
    } catch (e) {
      return 44;
    }
  });

  const [dockColor, setDockColor] = useState<string>(() => {
    try {
      return localStorage.getItem('app_tower_dock_color') || '#12141a';
    } catch (e) {
      return '#12141a';
    }
  });

  const [searchProvider, setSearchProvider] = useState<'google' | 'duckduckgo' | 'bing' | 'ecosia' | 'brave' | 'custom'>(() => {
    try {
      return (localStorage.getItem('app_tower_search_provider') as any) || 'google';
    } catch (e) {
      return 'google';
    }
  });

  const [customSearchUrl, setCustomSearchUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('app_tower_custom_search_url') || '';
    } catch (e) {
      return '';
    }
  });

  const [bgType, setBgType] = useState<'gradient' | 'bing' | 'mountain' | 'cosmic' | 'custom'>(() => {
    try {
      return (localStorage.getItem('app_tower_bg_type') as any) || 'gradient';
    } catch (e) {
      return 'gradient';
    }
  });

  const [customBgUrl, setCustomBgUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('app_tower_custom_bg_url') || '';
    } catch (e) {
      return '';
    }
  });

  const [showClockApplet, setShowClockApplet] = useState<boolean>(true);
  const [showWeatherApplet, setShowWeatherApplet] = useState<boolean>(true);
  const [clockPos, setClockPos] = useState<{ x: number; y: number }>({ x: 24, y: 28 });
  const [weatherPos, setWeatherPos] = useState<{ x: number; y: number }>({ x: 24, y: 175 });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalPos, setConfigModalPos] = useState<{ right: number; top: number }>({ right: 20, top: 48 });
  const [isDraggingConfigModal, setIsDraggingConfigModal] = useState(false);
  const configModalDragStart = useRef<{ startX: number; startY: number; initRight: number; initTop: number }>({
    startX: 0, startY: 0, initRight: 20, initTop: 48
  });
  const [bypassDisabledNotice, setBypassDisabledNotice] = useState(false);

  // Time & Location state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState('San Francisco, CA');
  const [userWeather, setUserWeather] = useState({ temp: 68, condition: 'Partly Cloudy', wind: 8, humidity: 55 });

  // Draggable state for Clock & Weather applets inside Simulator
  const [draggingApplet, setDraggingApplet] = useState<'clock' | 'weather' | null>(null);
  const appletDragStart = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0, startY: 0, initX: 0, initY: 0
  });

  const handleStartAppletDrag = (e: React.MouseEvent, type: 'clock' | 'weather') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingApplet(type);
    const init = type === 'clock' ? clockPos : weatherPos;
    appletDragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: init.x,
      initY: init.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingApplet) return;
      const dx = e.clientX - appletDragStart.current.startX;
      const dy = e.clientY - appletDragStart.current.startY;
      const newX = Math.max(8, Math.min(420, appletDragStart.current.initX + dx));
      const newY = Math.max(8, Math.min(380, appletDragStart.current.initY + dy));
      if (draggingApplet === 'clock') {
        setClockPos({ x: newX, y: newY });
      } else {
        setWeatherPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (draggingApplet) setDraggingApplet(null);
    };

    if (draggingApplet) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingApplet]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingConfigModal) return;
      const dx = e.clientX - configModalDragStart.current.startX;
      const dy = e.clientY - configModalDragStart.current.startY;
      const newRight = Math.max(12, Math.min(650, configModalDragStart.current.initRight - dx));
      const newTop = Math.max(12, Math.min(350, configModalDragStart.current.initTop + dy));
      setConfigModalPos({ right: newRight, top: newTop });
    };

    const handleMouseUp = () => {
      if (isDraggingConfigModal) setIsDraggingConfigModal(false);
    };

    if (isDraggingConfigModal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingConfigModal]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Attempt location & weather fetch
    const fetchLoc = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.city) {
            setUserLocation(`${ipData.city}${ipData.region_code ? ', ' + ipData.region_code : ''}`);
          }
          if (ipData.latitude && ipData.longitude) {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`);
            if (wRes.ok) {
              const wData = await wRes.json();
              if (wData.current_weather) {
                setUserWeather({
                  temp: Math.round(wData.current_weather.temperature),
                  condition: wData.current_weather.weathercode === 0 ? 'Clear Sky' : 'Partly Cloudy',
                  wind: Math.round(wData.current_weather.windspeed),
                  humidity: 55
                });
              }
            }
          }
        }
      } catch (e) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) {
            const city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Local';
            setUserLocation(city);
          }
        } catch (err) {}
      }
    };
    fetchLoc();
  }, []);

  // Persist settings changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_tower_dock_width', String(dockWidth));
    } catch (e) {}
  }, [dockWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('app_tower_dock_color', dockColor);
    } catch (e) {}
  }, [dockColor]);

  useEffect(() => {
    try {
      localStorage.setItem('app_tower_override_enabled', String(newTabOverrideEnabled));
    } catch (e) {}
  }, [newTabOverrideEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('app_tower_search_provider', searchProvider);
      localStorage.setItem('app_tower_custom_search_url', customSearchUrl);
      localStorage.setItem('app_tower_bg_type', bgType);
      localStorage.setItem('app_tower_custom_bg_url', customBgUrl);
    } catch (e) {}
  }, [searchProvider, customSearchUrl, bgType, customBgUrl]);

  // Persist apps and window bounds changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_tower_bounds', JSON.stringify(savedBounds));
    } catch (e) {}
  }, [savedBounds]);

  useEffect(() => {
    try {
      localStorage.setItem('app_tower_apps', JSON.stringify(apps));
    } catch (e) {}
  }, [apps]);

  // Modal State for Add & Edit App (Shows to the left of the dock, movable, no page blur)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ConfigApp | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalIsMobile, setModalIsMobile] = useState(false);
  const [modalPos, setModalPos] = useState<{ left?: number; right?: number; top: number }>({ right: 56, top: 70 });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const modalDragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number }>({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 70
  });

  // Refresh indicator when mode changes while window is open
  const [isWindowRefreshing, setIsWindowRefreshing] = useState(false);

  // Dragging and resizing state for companion window
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<null | 'left' | 'corner'>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialRight: number; initialTop: number; initialWidth: number; initialHeight: number }>({
    startX: 0,
    startY: 0,
    initialRight: 44,
    initialTop: 12,
    initialWidth: 460,
    initialHeight: 580
  });

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    app: ConfigApp;
    topPos: number;
  } | null>(null);

  // Mock Keep data
  const [notes, setNotes] = useState<MockNote[]>([
    {
      id: '1',
      title: 'Sprint Planning',
      content: '1. User-Agent switching configured via declarativeNetRequest\n2. Mobile view sends Pixel Mobile UA & Sec-CH-UA-Mobile: ?1\n3. Desktop view sends standard desktop UA\n4. Window auto-reloads so website switches its layout',
      color: 'bg-amber-950/60 border-amber-600/40 text-amber-100',
      pinned: true,
      time: '10:42 AM'
    },
    {
      id: '2',
      title: 'Architecture Rules',
      content: '• Pushes 44px page margin (non-floating rail)\n• Frameless companion windows (zero iframes, zero 403 errors)\n• Independent bounds saved per app\n• Toast says "Updated" on edit, "Added" on new app',
      color: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-100',
      pinned: false,
      time: 'Yesterday'
    }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Mock Messages data
  const [selectedConversation, setSelectedConversation] = useState('alex');
  const [messages, setMessages] = useState<MockMessage[]>([
    { id: '1', sender: 'Alex', text: 'Does toggling the Mobile slider send a Mobile User-Agent to the website?', time: '09:15 AM', isMe: false },
    { id: '2', sender: 'Me', text: 'Yes! The extension sends a mobile User-Agent header so the website serves its actual mobile layout.', time: '09:16 AM', isMe: true },
    { id: '3', sender: 'Alex', text: 'And for desktop mode it sends standard desktop User-Agent?', time: '09:18 AM', isMe: false },
    { id: '4', sender: 'Me', text: 'Exactly. It switches between desktop and mobile layouts on the fly!', time: '09:19 AM', isMe: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  const notificationTimeoutRef = useRef<number | null>(null);

  const showNotification = (msg: string) => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    setStatusNotification(msg);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setStatusNotification(null);
    }, 2400);
  };

  // Keyboard navigation & dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }
        if (contextMenu) {
          setContextMenu(null);
          return;
        }
        if (activeAppId && !isPinned) {
          setActiveAppId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAppId, isPinned, contextMenu, isModalOpen]);

  // Global mouse listeners for Dragging Modal, Dragging Window, and Resizing Window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Modal dragging
      if (isDraggingModal) {
        const deltaX = e.clientX - modalDragRef.current.startX;
        const deltaY = e.clientY - modalDragRef.current.startY;
        const newLeft = Math.max(10, Math.min(800, modalDragRef.current.initialLeft + deltaX));
        const newTop = Math.max(10, Math.min(460, modalDragRef.current.initialTop + deltaY));
        setModalPos({ left: newLeft, top: newTop });
        return;
      }

      if (!activeAppId) return;

      if (isDragging) {
        const deltaX = dragStartRef.current.startX - e.clientX;
        const deltaY = e.clientY - dragStartRef.current.startY;

        const newRight = Math.max(44, Math.min(800, dragStartRef.current.initialRight + deltaX));
        const newTop = Math.max(0, Math.min(400, dragStartRef.current.initialTop + deltaY));

        setSavedBounds(prev => {
          const base = prev[activeAppId] || getBoundsForApp(activeAppId);
          return {
            ...prev,
            [activeAppId]: {
              ...base,
              right: newRight,
              top: newTop
            }
          };
        });
      } else if (isResizing) {
        if (isResizing === 'left') {
          const deltaX = dragStartRef.current.startX - e.clientX;
          const newWidth = Math.max(340, Math.min(760, dragStartRef.current.initialWidth + deltaX));
          setSavedBounds(prev => {
            const base = prev[activeAppId] || getBoundsForApp(activeAppId);
            return {
              ...prev,
              [activeAppId]: {
                ...base,
                width: newWidth
              }
            };
          });
        } else if (isResizing === 'corner') {
          const deltaX = dragStartRef.current.startX - e.clientX;
          const deltaY = e.clientY - dragStartRef.current.startY;
          const newWidth = Math.max(340, Math.min(760, dragStartRef.current.initialWidth + deltaX));
          const newHeight = Math.max(380, Math.min(800, dragStartRef.current.initialHeight + deltaY));
          setSavedBounds(prev => {
            const base = prev[activeAppId] || getBoundsForApp(activeAppId);
            return {
              ...prev,
              [activeAppId]: {
                ...base,
                width: newWidth,
                height: newHeight
              }
            };
          });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingModal) {
        setIsDraggingModal(false);
      }
      if (isDragging) {
        setIsDragging(false);
      }
      if (isResizing) {
        setIsResizing(null);
      }
    };

    if (isDragging || isResizing || isDraggingModal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isDraggingModal, activeAppId, apps]);

  const activeApp = apps.find(a => a.id === activeAppId) || null;

  const getDefaultBoundsForApp = (app: ConfigApp): WindowBounds => {
    if (app.isMobile) {
      return { right: 44, top: 12, width: 380, height: 620 };
    }
    return { right: 44, top: 12, width: 480, height: 580 };
  };

  const getBoundsForApp = (appId: string): WindowBounds => {
    const existing = savedBounds[appId];
    if (
      existing &&
      typeof existing.right === 'number' &&
      typeof existing.top === 'number' &&
      typeof existing.width === 'number' &&
      typeof existing.height === 'number'
    ) {
      return existing;
    }
    const app = apps.find(a => a.id === appId);
    return app ? getDefaultBoundsForApp(app) : { right: 44, top: 12, width: 460, height: 580 };
  };

  const currentBounds = activeApp ? getBoundsForApp(activeApp.id) : { right: 44, top: 12, width: 460, height: 580 };

  const handleStartDrag = (e: React.MouseEvent) => {
    if (!activeApp) return;
    const current = getBoundsForApp(activeApp.id);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialRight: current.right,
      initialTop: current.top,
      initialWidth: current.width,
      initialHeight: current.height
    };
    setIsDragging(true);
  };

  const handleStartResize = (e: React.MouseEvent, type: 'left' | 'corner') => {
    e.stopPropagation();
    if (!activeApp) return;
    const current = getBoundsForApp(activeApp.id);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialRight: current.right,
      initialTop: current.top,
      initialWidth: current.width,
      initialHeight: current.height
    };
    setIsResizing(type);
  };

  const handleStartModalDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const modalEl = document.getElementById('simulator-modal-card');
    if (!modalEl) return;
    const rect = modalEl.getBoundingClientRect();
    const parent = modalEl.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
    const curLeft = rect.left - parentRect.left;
    const curTop = rect.top - parentRect.top;

    modalDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: curLeft,
      initialTop: curTop
    };
    setIsDraggingModal(true);
  };

  const resetBoundsForApp = (app: ConfigApp) => {
    const defaults = getDefaultBoundsForApp(app);
    setSavedBounds(prev => ({
      ...prev,
      [app.id]: { ...defaults }
    }));
    setContextMenu(null);
    showNotification(`Reset size & location for ${app.name}`);
  };

  const openAddAppModal = () => {
    setEditingApp(null);
    setModalName('');
    setModalUrl('https://');
    setModalIsMobile(false);
    setModalPos({ right: 56, top: 70 });
    setIsModalOpen(true);
  };

  const openEditAppModal = (app: ConfigApp) => {
    setEditingApp(app);
    setModalName(app.name);
    setModalUrl(app.url);
    setModalIsMobile(!!app.isMobile);
    setModalPos({ right: 56, top: 70 });
    setIsModalOpen(true);
  };

  const handleSaveModalApp = (e: React.FormEvent) => {
    e.preventDefault();
    let url = modalUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let name = modalName.trim();
    if (!name) {
      try {
        const u = new URL(url);
        name = u.hostname.replace('www.', '').split('.')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
      } catch {
        name = 'Web App';
      }
    }

    if (editingApp) {
      // Update existing app
      setApps(prev => prev.map(a => a.id === editingApp.id ? {
        ...a,
        name,
        url,
        isMobile: modalIsMobile
      } : a));

      // PRESERVE existing window size and location! Do not revert bounds!
      // If the app doesn't have saved bounds yet, only then initialize default bounds.
      setSavedBounds(prev => {
        if (prev[editingApp.id]) {
          return prev; // Keep exact custom size and location!
        }
        return {
          ...prev,
          [editingApp.id]: getDefaultBoundsForApp({ ...editingApp, isMobile: modalIsMobile })
        };
      });

      // If this app is currently open, trigger live window reload so the site switches layouts
      if (activeAppId === editingApp.id) {
        setIsWindowRefreshing(true);
        setTimeout(() => setIsWindowRefreshing(false), 450);
      }

      // Popup text says strictly "Updated"
      showNotification('Updated');
    } else {
      // Add new app
      const newId = 'custom_' + Date.now();
      const newApp: ConfigApp = {
        id: newId,
        name,
        url,
        isMobile: modalIsMobile,
        iconType: 'custom'
      };
      setApps(prev => [...prev, newApp]);
      setSavedBounds(prev => ({
        ...prev,
        [newId]: {
          right: 44,
          top: 12,
          width: modalIsMobile ? 380 : 480,
          height: modalIsMobile ? 620 : 580
        }
      }));
      setActiveAppId(newId);

      // Popup text says strictly "Added"
      showNotification('Added');
    }

    setIsModalOpen(false);
  };

  const handleRemoveApp = (app: ConfigApp) => {
    setContextMenu(null);
    if (apps.length <= 1) {
      showNotification('Cannot delete the last remaining app');
      return;
    }
    setApps(prev => prev.filter(a => a.id !== app.id));
    if (activeAppId === app.id) {
      setActiveAppId(null);
    }
    showNotification(`Removed "${app.name}" from sidebar dock`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    const newNote: MockNote = {
      id: Date.now().toString(),
      title: newNoteTitle.trim() || 'Untitled',
      content: newNoteContent.trim(),
      color: 'bg-blue-950/60 border-blue-600/40 text-blue-100',
      pinned: false,
      time: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreatingNote(false);
    showNotification('Note saved');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: MockMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      text: chatInput.trim(),
      time: 'Just now',
      isMe: true
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'Alex',
          text: 'The server detected the mobile User-Agent and switched to mobile layout!',
          time: 'Just now',
          isMe: false
        }
      ]);
    }, 1200);
  };

  const toggleDockFromToolbar = () => {
    setIsDockCollapsed(prev => {
      const next = !prev;
      showNotification(next ? 'Dock collapsed' : 'Dock expanded');
      return next;
    });
  };

  // Drag and drop state for reordering app icons in sidebar dock
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);

  const handleAppDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
    if (contextMenu) setContextMenu(null);
  };

  const handleAppDragOver = (e: React.DragEvent, appId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverAppId !== appId) {
      setDragOverAppId(appId);
    }
  };

  const handleAppDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.parentElement?.contains(related)) {
      return;
    }
    setDragOverAppId(null);
  };

  const handleAppDrop = (e: React.DragEvent, targetAppId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (sourceId && sourceId !== targetAppId) {
      setApps(prev => {
        const fromIdx = prev.findIndex(a => a.id === sourceId);
        const toIdx = prev.findIndex(a => a.id === targetAppId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, moved);
        return copy;
      });
      showNotification('App reordered');
    }
    setDraggedAppId(null);
    setDragOverAppId(null);
  };

  const handleAppDragEnd = () => {
    setDraggedAppId(null);
    setDragOverAppId(null);
  };

  // Renders a placeholder dotted square showing exactly where the dragged icon will land
  const renderDropPlaceholder = (targetAppId: string) => (
    <div
      key={`placeholder-${targetAppId}`}
      onDragOver={(e) => handleAppDragOver(e, targetAppId)}
      onDrop={(e) => handleAppDrop(e, targetAppId)}
      className="w-9 h-9 my-0.5 rounded-lg border-2 border-dotted border-blue-400 bg-blue-500/15 flex items-center justify-center transition-all animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.35)] select-none shrink-0 cursor-default"
      title="Drop icon here"
    >
      <div className="w-3.5 h-3.5 rounded border border-dotted border-blue-300/80 bg-blue-400/20" />
    </div>
  );

  // Icon renderer helper
  const renderAppIcon = (app: ConfigApp) => {
    if (app.id === 'keep') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21h6v-1.5H9V21zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="#FBBF24"/>
        </svg>
      );
    }
    if (app.id === 'messages') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="#3B82F6"/>
          <circle cx="8" cy="10" r="1.5" fill="#3B82F6"/>
          <circle cx="12" cy="10" r="1.5" fill="#3B82F6"/>
          <circle cx="16" cy="10" r="1.5" fill="#3B82F6"/>
        </svg>
      );
    }

    try {
      const parsed = new URL(app.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
      return (
        <img 
          src={faviconUrl} 
          alt={app.name} 
          className="w-4 h-4 rounded object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } catch {
      return (
        <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center">
          {app.name.charAt(0)}
        </div>
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-blue-500/50 text-blue-300 text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold">{statusNotification}</span>
        </div>
      )}

      {/* Simulator Frame (Simulates a standard 16:9 Chrome browser window) */}
      <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Browser Top Chrome & Toolbar */}
        <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
          {/* Window dots */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="ml-3 font-medium text-slate-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              {activeWebsite === 'doc' && 'Google Docs - Product Specification.gdoc'}
              {activeWebsite === 'portal' && 'Internal Developer Hub & API Docs'}
              {activeWebsite === 'dashboard' && 'Analytics & Operations Dashboard'}
              {activeWebsite === 'newtab' && 'New Tab (App Tower Override)'}
            </span>
          </div>

          {/* Browser Navigation / Omnibox */}
          <div className="flex-1 max-w-md mx-4">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1 flex items-center justify-between text-slate-300 text-[11px] font-mono shadow-inner">
              <span className="truncate">
                {activeWebsite === 'doc' && 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZj_A...'}
                {activeWebsite === 'portal' && 'https://portal.internal.company.net/engineering/specs'}
                {activeWebsite === 'dashboard' && 'https://analytics.workspace.google.com/live/metrics'}
                {activeWebsite === 'newtab' && 'chrome://newtab'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>

          {/* Browser Toolbar Icons & EXTENSION ACTION TOGGLE BUTTON */}
          <div className="flex items-center gap-2">
            {/* Website switcher */}
            <div className="flex items-center bg-slate-950/70 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setActiveWebsite('doc')}
                className={`px-2 py-0.5 rounded ${activeWebsite === 'doc' ? 'bg-blue-600 text-white font-medium' : 'hover:text-slate-200'}`}
              >
                Doc
              </button>
              <button
                onClick={() => setActiveWebsite('portal')}
                className={`px-2 py-0.5 rounded ${activeWebsite === 'portal' ? 'bg-blue-600 text-white font-medium' : 'hover:text-slate-200'}`}
              >
                Portal
              </button>
              <button
                onClick={() => setActiveWebsite('dashboard')}
                className={`px-2 py-0.5 rounded ${activeWebsite === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'hover:text-slate-200'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveWebsite('newtab')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${activeWebsite === 'newtab' ? 'bg-blue-600 text-white font-medium' : 'hover:text-slate-200'}`}
              >
                <Plus className="w-2.5 h-2.5" />
                <span>New Tab</span>
              </button>
            </div>

            {/* EXTENSION ACTION BUTTON IN TOOLBAR (TOGGLE DOCK ON/OFF) */}
            <button
              onClick={toggleDockFromToolbar}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                !isDockCollapsed
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title="Click extension icon in toolbar to expand or collapse docked sidebar"
            >
              <PanelRight className="w-3.5 h-3.5 text-blue-400" />
              <span>App Tower</span>
              <span className={`w-1.5 h-1.5 rounded-full ${!isDockCollapsed ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            </button>
          </div>
        </div>

        {/* Viewport Area: Webpage + Firmly Docked 44px Rail */}
        <div 
          onClick={() => {
            if (contextMenu) setContextMenu(null);
          }}
          className="relative w-full h-[620px] bg-slate-950 flex overflow-hidden select-none"
        >
          {/* Main Web Page Content: has dynamic right margin reserved when dock is expanded */}
          <main 
            style={{ 
              marginRight: isDockCollapsed ? '0px' : `${dockWidth}px`,
              transition: 'margin-right 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="flex-1 h-full overflow-y-auto text-slate-200 relative bg-slate-950"
          >
            {activeWebsite === 'newtab' ? (
              /* New Tab Page View */
              !newTabOverrideEnabled && !bypassDisabledNotice ? (
                /* Disabled Notice Screen (Disabled by default) */
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 select-none bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/5">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      Setting Disabled by Default
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight mt-2">
                      New Tab Override is Disabled
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Chrome extension setting <strong>"New Tab Override"</strong> is disabled by default. When enabled, every new tab loads your custom App Tower dashboard with choice of search provider, Bing daily wallpapers, and draggable clock & weather applets.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setNewTabOverrideEnabled(true);
                        showNotification('New Tab Override Enabled');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Enable New Tab Override</span>
                    </button>
                    <button
                      onClick={() => setBypassDisabledNotice(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                    >
                      Preview Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                /* Active New Tab Experience with Wallpapers & Draggable Applets */
                <div 
                  className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
                  style={{
                    backgroundImage: bgType === 'gradient' ? undefined : (
                      bgType === 'bing' ? 'url("https://bing.biturl.top/?resolution=1920&format=image&index=0")' :
                      bgType === 'mountain' ? 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80")' :
                      bgType === 'cosmic' ? 'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80")' :
                      customBgUrl ? `url("${customBgUrl}")` : undefined
                    ),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Backdrop tint filter when wallpaper is active */}
                  {bgType !== 'gradient' && (
                    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] z-0 pointer-events-none" />
                  )}

                  {/* Top Controls Bar */}
                  <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                      {!newTabOverrideEnabled && (
                        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] text-amber-300 font-medium shadow-md">
                          <span>Override Disabled in Settings</span>
                          <button
                            onClick={() => {
                              setNewTabOverrideEnabled(true);
                              showNotification('New Tab Override Enabled');
                            }}
                            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-2 py-0.5 rounded text-[10px] transition cursor-pointer"
                          >
                            Enable
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="pointer-events-auto flex items-center gap-2">
                      <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-all hover:rotate-30 cursor-pointer"
                        title="Configure New Tab (Search, Wallpapers, Clock, Weather)"
                      >
                        <Settings className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                  </div>

                  {/* DRAGGABLE LIVE CLOCK APPLET */}
                  {showClockApplet && (
                    <div
                      style={{
                        left: `${clockPos.x}px`,
                        top: `${clockPos.y}px`,
                        cursor: draggingApplet === 'clock' ? 'grabbing' : 'default'
                      }}
                      className="absolute z-10 w-[240px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/70 hover:border-slate-600 rounded-2xl shadow-2xl overflow-hidden transition-shadow"
                    >
                      {/* Header Drag Handle */}
                      <div
                        onMouseDown={(e) => handleStartAppletDrag(e, 'clock')}
                        className="h-8 px-3 bg-black/25 border-b border-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing text-xs text-slate-400"
                        title="Drag to reposition clock"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
                          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                          <span>Live Clock</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="truncate">{userLocation}</span>
                        </div>
                      </div>
                      <div className="p-3.5 text-center flex flex-col items-center">
                        <div className="text-3xl font-light tracking-tight text-white font-mono flex items-baseline gap-1">
                          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</span>
                          <span className="text-xs font-bold text-blue-400">
                            {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DRAGGABLE LIVE WEATHER APPLET */}
                  {showWeatherApplet && (
                    <div
                      style={{
                        left: `${weatherPos.x}px`,
                        top: `${weatherPos.y}px`,
                        cursor: draggingApplet === 'weather' ? 'grabbing' : 'default'
                      }}
                      className="absolute z-10 w-[240px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/70 hover:border-slate-600 rounded-2xl shadow-2xl overflow-hidden transition-shadow"
                    >
                      {/* Header Drag Handle */}
                      <div
                        onMouseDown={(e) => handleStartAppletDrag(e, 'weather')}
                        className="h-8 px-3 bg-black/25 border-b border-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing text-xs text-slate-400"
                        title="Drag to reposition weather"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
                          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                          <span>Live Weather</span>
                        </div>
                        <div className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                          {userLocation}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                            <CloudSun className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="text-2xl font-light text-white font-mono leading-none">
                              {userWeather.temp}°F
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {userWeather.condition}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-[10.5px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-slate-500" /> {userWeather.wind} mph
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-slate-500" /> {userWeather.humidity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CENTER CONTENT: SEARCH & SHORTCUTS */}
                  <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6 mt-4">
                    {/* Search Form with active Search Provider */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem('search_query') as HTMLInputElement)?.value;
                        if (!input) return;
                        showNotification(`Searching via ${searchProvider.toUpperCase()}: ${input}`);
                      }}
                      className="w-full"
                    >
                      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-full px-5 py-3 shadow-2xl backdrop-blur-md transition-all">
                        <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <input 
                          name="search_query"
                          type="text" 
                          placeholder={`Search with ${searchProvider === 'custom' ? 'Custom Engine' : searchProvider.charAt(0).toUpperCase() + searchProvider.slice(1)} or type a URL...`}
                          className="bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 flex-1 font-sans"
                          autoComplete="off"
                        />
                        <button type="submit" className="w-6 h-6 rounded-full bg-blue-600/20 hover:bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs transition cursor-pointer">
                          ↵
                        </button>
                      </div>
                    </form>

                    <div className="text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>App Tower Dock active on New Tab page</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Document / Portal Content Mock */
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">Browser Feature Guide</span>
                    <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                      Mobile vs Desktop User-Agent Switching
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {apps.length} Apps Active
                    </span>
                  </div>
                </div>

                {/* Informative interactive card explaining User-Agent */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>How Websites Detect Mobile vs Desktop:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-blue-900/30 space-y-1.5">
                      <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5" /> Desktop User-Agent
                      </span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Sends <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded font-mono">User-Agent: Chrome (Windows 64-bit)</code> and <code className="text-blue-300 bg-slate-900 px-1 py-0.5 rounded font-mono">Sec-CH-UA-Mobile: ?0</code>.
                        Websites like Google Messages render their dual-pane desktop web client.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-900/30 space-y-1.5">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Mobile User-Agent
                      </span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Sends <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">User-Agent: Linux; Android Pixel Mobile</code> and <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">Sec-CH-UA-Mobile: ?1</code> via declarativeNetRequest.
                        Websites automatically switch to their dedicated mobile layout!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert text-xs space-y-4 text-slate-300 leading-relaxed">
                  <p>
                    When you edit an app icon and toggle the <strong>Desktop vs Mobile slider</strong>, the extension configures network rules to send that device's User-Agent on all requests and reloads the window.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-slate-200">Try it out in the simulation:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px]">
                      <li>Right-click <strong>Google Messages</strong> in the sidebar dock, click <strong>Edit app & URL...</strong></li>
                      <li>Toggle the slider to <strong>Mobile View</strong> and click <strong>Save Changes</strong>.</li>
                      <li>Notice how Google Messages reloads from the wide dual-pane desktop view into the dedicated single-pane mobile phone interface!</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* FIRMLY DOCKED SIDEBAR RAIL (On right edge with dynamic width & color) */}
          <aside
            style={{
              width: `${dockWidth}px`,
              backgroundColor: dockColor,
              transform: isDockCollapsed ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), width 0.15s ease, background-color 0.15s ease'
            }}
            className="absolute top-0 right-0 h-full border-l border-white/[0.08] flex flex-col items-center justify-between py-3 z-30 select-none shadow-[-2px_0_12px_rgba(0,0,0,0.4)]"
          >
            {/* App Icons (Vertical Stack) */}
            <div 
              onDragLeave={(e) => {
                const related = e.relatedTarget as Node | null;
                if (!related || !e.currentTarget.contains(related)) {
                  setDragOverAppId(null);
                }
              }}
              className="flex flex-col items-center gap-2 w-full"
            >
              {apps.map((app, index) => {
                const isActive = activeAppId === app.id;
                const isBeingDragged = draggedAppId === app.id;
                const isDragTarget = dragOverAppId === app.id && draggedAppId !== null && draggedAppId !== app.id;
                const fromIdx = draggedAppId ? apps.findIndex(a => a.id === draggedAppId) : -1;
                const showPlaceholderBefore = isDragTarget && fromIdx > index;
                const showPlaceholderAfter = isDragTarget && fromIdx < index;

                return (
                  <React.Fragment key={app.id}>
                    {/* Placeholder dotted square before icon when moving upwards */}
                    {showPlaceholderBefore && renderDropPlaceholder(app.id)}

                    <div className="relative group flex items-center justify-center">
                      <button
                        draggable
                        onDragStart={(e) => handleAppDragStart(e, app.id)}
                        onDragOver={(e) => handleAppDragOver(e, app.id)}
                        onDragLeave={handleAppDragLeave}
                        onDrop={(e) => handleAppDrop(e, app.id)}
                        onDragEnd={handleAppDragEnd}
                        onClick={() => {
                          if (activeAppId === app.id) {
                            setActiveAppId(null);
                          } else {
                            setActiveAppId(app.id);
                            showNotification(`Opened ${app.name} (${app.isMobile ? 'Mobile UA' : 'Desktop UA'})`);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const parentRect = e.currentTarget.parentElement?.getBoundingClientRect() || { top: 0 };
                          setContextMenu({
                            app,
                            topPos: Math.max(12, rect.top - parentRect.top)
                          });
                        }}
                        className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-default ${
                          isBeingDragged
                            ? 'opacity-30 scale-90 border border-blue-400/50'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        {renderAppIcon(app)}
                      </button>

                      {/* Instant Hover Badge positioned to the left of app icon */}
                      <div className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 z-50 bg-[#1e222d] text-slate-100 text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-white/10">
                        {app.name} ({app.isMobile ? 'Mobile' : 'Desktop'} • Drag to re-order)
                      </div>
                    </div>

                    {/* Placeholder dotted square after icon when moving downwards */}
                    {showPlaceholderAfter && renderDropPlaceholder(app.id)}
                  </React.Fragment>
                );
              })}

              {/* WHITE PLUS ICON AT BOTTOM OF ICON LIST (NO BACKGROUND, PURE WHITE SYMBOL) */}
              <div className="relative group flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu(null);
                    openAddAppModal();
                  }}
                  className="mt-1.5 w-8 h-8 flex items-center justify-center cursor-default transition-transform duration-150 hover:scale-125 opacity-90 hover:opacity-100"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                >
                  <Plus className="w-5 h-5 text-white" strokeWidth={2.6} />
                </button>
                <div className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 z-50 bg-[#1e222d] text-slate-100 text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-white/10">
                  Add App to Sidebar
                </div>
              </div>

              {/* EXTENSION SETTINGS GEAR BUTTON */}
              <div className="relative group flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu(null);
                    setIsSettingsModalOpen(true);
                  }}
                  className="mt-1 w-8 h-8 flex items-center justify-center cursor-default transition-all duration-150 text-slate-400 group-hover:text-white"
                >
                  <Settings className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" />
                </button>
                {/* Instant Hover Badge positioned to the left of the gear icon, without rotating */}
                <div className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 z-50 bg-[#1e222d] text-slate-100 text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-white/10">
                  Sidebar & Tab Settings
                </div>
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="w-full flex justify-center py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
          </aside>

          {/* RIGHT-CLICK CONTEXT MENU */}
          {contextMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                top: `${contextMenu.topPos}px`,
                right: '50px'
              }}
              className="absolute z-50 min-w-[210px] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in duration-100"
            >
              <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span className="truncate max-w-[110px]">{contextMenu.app.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  contextMenu.app.isMobile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {contextMenu.app.isMobile ? 'Mobile UA' : 'Desktop UA'}
                </span>
              </div>
              <div className="h-[1px] bg-slate-800 my-0.5"></div>

              {/* EDIT APP & URL */}
              <button
                onClick={() => {
                  const targetApp = contextMenu.app;
                  setContextMenu(null);
                  openEditAppModal(targetApp);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-blue-600/20 hover:text-white transition text-left group"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                <span className="font-medium">Edit app & User-Agent...</span>
              </button>

              {/* RESET BOUNDS */}
              <button
                onClick={() => resetBoundsForApp(contextMenu.app)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-blue-600/20 hover:text-white transition text-left group"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                <span className="font-medium">Reset size & location</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-0.5"></div>

              {/* REMOVE APP */}
              <button
                onClick={() => handleRemoveApp(contextMenu.app)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-600/20 hover:text-rose-300 text-rose-400 transition text-left group"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from dock</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-0.5"></div>

              {/* EXTENSION SETTINGS */}
              <button
                onClick={() => {
                  setContextMenu(null);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-blue-600/20 hover:text-white transition text-left group"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                <span className="font-medium">Sidebar & Tab Settings...</span>
              </button>
            </div>
          )}

          {/* SIDEBAR & EXTENSION SETTINGS MODAL */}
          {isSettingsModalOpen && (
            <div 
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 space-y-4 text-xs text-slate-200"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>Sidebar & Tab Settings</span>
                  </div>
                  <button 
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* New Tab Override Toggle */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">New Tab Override</span>
                    <button
                      onClick={() => {
                        const next = !newTabOverrideEnabled;
                        setNewTabOverrideEnabled(next);
                        showNotification(next ? 'New Tab Override Enabled' : 'New Tab Override Disabled');
                      }}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        newTabOverrideEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Disabled by default. When enabled, opening a new tab loads your custom App Tower dashboard.
                  </p>
                </div>

                {/* Sidebar Width Slider */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">Sidebar Width</span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md font-mono">
                      {dockWidth}px
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="36"
                    max="72"
                    value={dockWidth}
                    onChange={(e) => setDockWidth(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>36px (Slim)</span>
                    <span>44px (Default)</span>
                    <span>72px (Wide)</span>
                  </div>
                </div>

                {/* Sidebar Color */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-semibold text-slate-200 text-xs block">Sidebar Color</span>
                  <div className="flex items-center gap-2">
                    {[
                      { name: 'Obsidian', color: '#12141a' },
                      { name: 'Navy', color: '#0f172a' },
                      { name: 'Charcoal', color: '#18181b' },
                      { name: 'Black', color: '#000000' },
                      { name: 'Slate', color: '#1e293b' },
                      { name: 'Indigo', color: '#151226' },
                    ].map(item => (
                      <button
                        key={item.color}
                        onClick={() => setDockColor(item.color)}
                        style={{ backgroundColor: item.color }}
                        className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                          dockColor === item.color ? 'border-blue-400 scale-110 shadow-md shadow-blue-500/20 ring-1 ring-blue-400' : 'border-white/10 hover:scale-105'
                        }`}
                        title={item.name}
                      />
                    ))}
                    <div className="relative w-6 h-6 rounded-lg border border-dashed border-slate-600 flex items-center justify-center overflow-hidden cursor-pointer" title="Custom color">
                      <input 
                        type="color" 
                        value={dockColor} 
                        onChange={(e) => setDockColor(e.target.value)}
                        className="absolute -top-2 -left-2 w-10 h-10 opacity-0 cursor-pointer" 
                      />
                      <span className="text-[10px] text-slate-400">+</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* NEW TAB CONFIGURATION MODAL (Pops up on right side underneath gear icon, movable, no background blur) */}
          {isConfigModalOpen && (
            <>
              {/* Invisible click catcher without background blur */}
              <div 
                onClick={() => setIsConfigModalOpen(false)}
                className="absolute inset-0 z-40 bg-transparent"
              />

              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${configModalPos.top}px`,
                  right: `${configModalPos.right}px`
                }}
                className="absolute z-50 w-[420px] max-w-[calc(100%-32px)] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl space-y-4 text-xs text-slate-200 max-h-[85%] flex flex-col overflow-hidden animate-in fade-in duration-150 select-none"
              >
                {/* Draggable Modal Header */}
                <div 
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    e.preventDefault();
                    setIsDraggingConfigModal(true);
                    configModalDragStart.current = {
                      startX: e.clientX,
                      startY: e.clientY,
                      initRight: configModalPos.right,
                      initTop: configModalPos.top
                    };
                  }}
                  className="px-4 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing"
                  title="Drag to move settings window"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>New Tab Configuration</span>
                  </div>
                  <button 
                    onClick={() => setIsConfigModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 pt-0 space-y-4 overflow-y-auto">
                {/* 1. Search Provider */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-semibold text-slate-200 text-xs block">Search Provider</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'google', label: 'Google' },
                      { id: 'duckduckgo', label: 'DuckDuckGo' },
                      { id: 'bing', label: 'Bing' },
                      { id: 'ecosia', label: 'Ecosia' },
                      { id: 'brave', label: 'Brave' },
                      { id: 'custom', label: 'Custom' }
                    ].map(prov => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => setSearchProvider(prov.id as any)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                          searchProvider === prov.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {prov.label}
                      </button>
                    ))}
                  </div>
                  {searchProvider === 'custom' && (
                    <div className="mt-2 space-y-1">
                      <label className="text-[10.5px] text-slate-400">Custom URL (use <code>{'{q}'}</code> for query):</label>
                      <input 
                        type="text"
                        value={customSearchUrl}
                        onChange={(e) => setCustomSearchUrl(e.target.value)}
                        placeholder="https://kagi.com/search?q={q}"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Background Image */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-semibold text-slate-200 text-xs block">Background Wallpaper</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gradient', label: 'Obsidian Glow' },
                      { id: 'bing', label: 'Bing Daily Rotation' },
                      { id: 'mountain', label: 'Misty Mountains' },
                      { id: 'cosmic', label: 'Deep Nebula' },
                      { id: 'custom', label: 'Custom URL' }
                    ].map(bg => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setBgType(bg.id as any)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center transition cursor-pointer ${
                          bgType === bg.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                  {bgType === 'custom' && (
                    <div className="mt-2 space-y-1">
                      <label className="text-[10.5px] text-slate-400">Custom Image URL:</label>
                      <input 
                        type="url"
                        value={customBgUrl}
                        onChange={(e) => setCustomBgUrl(e.target.value)}
                        placeholder="https://example.com/wallpaper.jpg"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Live Clock Applet Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block">Live Clock Applet</span>
                    <span className="text-[10.5px] text-slate-400">Draggable modal with IP/location time</span>
                  </div>
                  <button
                    onClick={() => setShowClockApplet(!showClockApplet)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      showClockApplet ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                {/* 4. Live Weather Applet Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block">Live Weather Applet</span>
                    <span className="text-[10.5px] text-slate-400">Draggable modal with IP/location weather</span>
                  </div>
                  <button
                    onClick={() => setShowWeatherApplet(!showWeatherApplet)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      showWeatherApplet ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                {/* 5. Extension Setting: New Tab Override */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block">New Tab Override</span>
                    <span className="text-[10.5px] text-slate-400">Disabled by default per extension setting</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !newTabOverrideEnabled;
                      setNewTabOverrideEnabled(next);
                      showNotification(next ? 'New Tab Override Enabled' : 'New Tab Override Disabled');
                    }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      newTabOverrideEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setClockPos({ x: 24, y: 28 });
                      setWeatherPos({ x: 24, y: 175 });
                      setConfigModalPos({ right: 20, top: 48 });
                      showNotification('Applet positions reset');
                    }}
                    className="text-slate-400 hover:text-slate-200 text-xs underline cursor-pointer"
                  >
                    Reset Positions
                  </button>
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                </div>
              </div>
            </>
          )}

          {/* ADD / EDIT APP MODAL (Shows to the Left of the Dock, Movable, NO PAGE BLUR) */}
          {isModalOpen && (
            <>
              {/* Transparent click catcher to dismiss when clicking outside without blurring page */}
              <div 
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 z-40 bg-transparent"
              />

              {/* Floating Movable Modal Card */}
              <div 
                id="simulator-modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  ...(modalPos.left !== undefined 
                    ? { left: `${modalPos.left}px` } 
                    : { right: `${modalPos.right ?? 56}px` }),
                  top: `${modalPos.top ?? 70}px`,
                  width: '375px',
                  maxWidth: '92%'
                }}
                className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-5 space-y-4 text-slate-200 z-50 animate-in fade-in duration-150 select-none"
              >
                {/* Draggable Modal Header */}
                <div 
                  onMouseDown={handleStartModalDrag}
                  className="flex items-center justify-between pb-2.5 border-b border-slate-800 cursor-move"
                  title="Drag header to move dialog"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <Move className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-semibold text-sm text-white">
                      {editingApp ? `Edit ${editingApp.name}` : 'Add App to Sidebar'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {modalUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          window.open(modalUrl, '_blank', 'width=420,height=680');
                          showNotification('Opened in floating popup window');
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Pop out into separate window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveModalApp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      App Name
                    </label>
                    <input
                      type="text"
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="e.g. Google Keep, Messages, Calendar, Slack"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Web URL
                    </label>
                    <input
                      type="url"
                      required
                      value={modalUrl}
                      onChange={(e) => setModalUrl(e.target.value)}
                      placeholder="https://keep.google.com/"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* MOBILE VS DESKTOP USER-AGENT SLIDER */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Device Mode (User-Agent)</span>
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                        modalIsMobile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {modalIsMobile ? '📱 Mobile UA' : '🖥️ Desktop UA'}
                      </span>
                    </div>

                    {/* Segmented Slider Track */}
                    <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => setModalIsMobile(false)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition font-medium ${
                          !modalIsMobile 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop Layout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalIsMobile(true)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition font-medium ${
                          modalIsMobile 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile Layout</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {modalIsMobile 
                        ? 'Sends a Mobile User-Agent and Sec-CH-UA-Mobile: ?1 so the website detects a phone and automatically loads its mobile layout.' 
                        : 'Sends standard Desktop User-Agent. The website serves its standard desktop client and layout.'}
                    </p>

                    {/* RED WARNING TEXT UNDERNEATH THE SLIDER */}
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] font-medium leading-tight">
                      <span className="text-red-400 font-bold shrink-0">⚠️</span>
                      <span>Changing this setting will reload open windows so the website switches between its Desktop and Mobile layouts.</span>
                    </div>
                  </div>

                  {(() => {
                    const trimmedModalUrl = modalUrl.trim();
                    const trimmedModalName = modalName.trim();
                    const isValidModalUrl = trimmedModalUrl.length > 0 && trimmedModalUrl !== 'https://' && trimmedModalUrl !== 'http://';

                    const isEditingApp = !!editingApp;
                    const isNameChanged = isEditingApp ? (trimmedModalName !== (editingApp.name || '').trim()) : false;
                    const isUrlChanged = isEditingApp ? (trimmedModalUrl !== (editingApp.url || '').trim()) : false;
                    const isModeChanged = isEditingApp ? (Boolean(modalIsMobile) !== Boolean(editingApp.isMobile)) : false;

                    const hasGenuineChanges = isEditingApp
                      ? (isNameChanged || isUrlChanged || isModeChanged)
                      : isValidModalUrl;

                    const canSaveAppModal = isValidModalUrl && hasGenuineChanges;

                    return (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!canSaveAppModal}
                          title={!canSaveAppModal ? (isEditingApp ? 'No changes made compared to saved settings' : 'Enter a destination URL to add app') : undefined}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                            canSaveAppModal
                              ? 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-lg shadow-blue-600/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60 shadow-none'
                          }`}
                        >
                          {editingApp ? 'Save App' : 'Add App'}
                        </button>
                      </div>
                    );
                  })()}
                </form>
              </div>
            </>
          )}

          {/* FLOATING COMPANION WINDOW WITH PER-APP BOUNDS & MOBILE/DESKTOP ADAPTATION */}
          {activeApp && (
            <section
              style={{
                right: `${currentBounds.right}px`,
                top: `${currentBounds.top}px`,
                width: `${currentBounds.width}px`,
                height: `${currentBounds.height}px`,
                maxHeight: `calc(100% - ${currentBounds.top + 12}px)`,
                transition: isDragging || isResizing ? 'none' : 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className={`absolute flex flex-col border rounded-xl z-30 overflow-hidden shadow-[-16px_12px_40px_rgba(0,0,0,0.7)] ${
                theme === 'dark'
                  ? 'bg-slate-900/98 backdrop-blur-2xl border-slate-700/80 text-slate-100'
                  : 'bg-white/98 backdrop-blur-2xl border-slate-300 text-slate-900'
              }`}
            >
              {/* Window Refresh Overlay Animation */}
              {isWindowRefreshing && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-100">
                  <RotateCw className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="text-xs font-semibold text-slate-200">
                    Reloading with {activeApp.isMobile ? 'Mobile User-Agent' : 'Desktop User-Agent'}...
                  </span>
                </div>
              )}

              {/* Left Edge Resize Handle */}
              <div
                onMouseDown={(e) => handleStartResize(e, 'left')}
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/40 transition z-50 group"
                title="Drag to resize window width"
              >
                <div className="w-1 h-8 rounded bg-slate-600/40 group-hover:bg-blue-400 absolute left-0.5 top-1/2 -translate-y-1/2 transition"></div>
              </div>

              {/* Bottom-Left Corner Resize Handle */}
              <div
                onMouseDown={(e) => handleStartResize(e, 'corner')}
                className="absolute left-0 bottom-0 w-4 h-4 cursor-nesw-resize hover:bg-blue-500/50 transition z-50 flex items-end justify-start p-0.5"
                title="Drag corner to resize"
              >
                <div className="w-2 h-2 border-b-2 border-l-2 border-blue-400"></div>
              </div>

              {/* Window Header Bar (Draggable) */}
              <header 
                onMouseDown={handleStartDrag}
                className={`p-3 border-b flex items-center justify-between cursor-move select-none ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-500/10">
                    {renderAppIcon(activeApp)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs tracking-tight">{activeApp.name}</span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        activeApp.isMobile ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {activeApp.isMobile ? '📱 Mobile UA' : '🖥️ Desktop UA'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Move className="w-2.5 h-2.5" /> Drag header to reposition
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit app button */}
                  <button
                    onClick={() => openEditAppModal(activeApp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit App & User-Agent"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Reset size button */}
                  <button
                    onClick={() => resetBoundsForApp(activeApp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Reset size & location"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <a 
                    href={activeApp.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button 
                    onClick={() => setActiveAppId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Close companion window"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </header>

              {/* User-Agent HTTP Inspector Banner */}
              <div className={`px-3 py-1 flex items-center justify-between text-[10.5px] border-b select-none font-mono ${
                activeApp.isMobile 
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' 
                  : 'bg-blue-950/40 border-blue-800/40 text-blue-300'
              }`}>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-white">HTTP UA:</span>
                  <span className="truncate max-w-[260px]">
                    {activeApp.isMobile ? 'Android 14; Pixel 8 Mobile Safari' : 'Windows x64; Chrome Desktop'}
                  </span>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-slate-900 border border-current">
                  {activeApp.isMobile ? 'Mobile Layout' : 'Desktop Layout'}
                </span>
              </div>

              {/* Mobile Phone Device Bezel Bar when app is in Mobile view */}
              {activeApp.isMobile && (
                <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="font-semibold text-slate-300">9:41</span>
                  </div>
                  <div className="w-12 h-2.5 bg-slate-800 rounded-full mx-auto"></div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-slate-400" />
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              )}

              {/* Companion Window Body */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                {useLiveIframe ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Real Companion Windows bypass this!</h4>
                      <p className="text-xs text-slate-400 max-w-xs">
                        In the installed Chrome extension, clicking "{activeApp.name}" opens a real native browser window, completely bypassing all iframe 403 blocks.
                      </p>
                    </div>
                    <a
                      href={activeApp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open {activeApp.name} Directly
                    </a>
                  </div>
                ) : activeApp.id === 'keep' ? (
                  /* Interactive Google Keep Mock - Adapts to Mobile vs Desktop User-Agent Layout */
                  <div className="flex-1 flex flex-col">
                    {/* Website Header Bar */}
                    <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        {activeApp.isMobile ? (
                          <Menu className="w-4 h-4 text-slate-400 cursor-pointer" />
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Pin className="w-3.5 h-3.5" /> Keep
                          </span>
                        )}
                        <div className="flex-1 max-w-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-slate-400">
                          <Search className="w-3 h-3 text-slate-500" />
                          <span className="text-[11px] truncate">Search notes</span>
                        </div>
                      </div>
                      {!activeApp.isMobile && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Grid View</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                      {/* Note creation bar */}
                      {isCreatingNote ? (
                        <form onSubmit={handleAddNote} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                          <input
                            type="text"
                            placeholder="Title"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            className="w-full bg-transparent text-xs font-semibold focus:outline-none placeholder-slate-500"
                            autoFocus
                          />
                          <textarea
                            placeholder="Take a note..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-500 resize-none h-16"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsCreatingNote(false)}
                              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium hover:bg-amber-500/30"
                            >
                              Save Note
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsCreatingNote(true)}
                          className="w-full text-left px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 flex items-center justify-between"
                        >
                          <span>Take a note...</span>
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      )}

                      {/* Notes Layout: Desktop uses multi-column grid, Mobile uses single vertical stream */}
                      <div className={activeApp.isMobile ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
                        {notes.map((note) => (
                          <div key={note.id} className={`p-3 rounded-xl border text-xs space-y-1 ${note.color}`}>
                            <div className="flex items-center justify-between font-semibold">
                              <span className="truncate">{note.title}</span>
                              <span className="text-[10px] opacity-60 shrink-0">{note.time}</span>
                            </div>
                            <p className="whitespace-pre-line opacity-90 text-[11px] leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Quick Action Footer Bar in Mobile View */}
                    {activeApp.isMobile && (
                      <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-around text-slate-400 text-xs">
                        <button className="p-1 hover:text-amber-400 flex items-center gap-1 text-[11px]" title="New list">
                          <CheckSquare className="w-3.5 h-3.5" /> <span>List</span>
                        </button>
                        <button className="p-1 hover:text-amber-400 flex items-center gap-1 text-[11px]" title="Audio note">
                          <Mic className="w-3.5 h-3.5" /> <span>Voice</span>
                        </button>
                        <button className="p-1 hover:text-amber-400 flex items-center gap-1 text-[11px]" title="Photo note">
                          <ImageIcon className="w-3.5 h-3.5" /> <span>Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeApp.id === 'messages' ? (
                  /* Interactive Google Messages Mock - Switches between Desktop Dual-Pane & Mobile Phone Single-Pane */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* DESKTOP VIEW: Dual-pane layout (Conversations List + Chat Thread) */}
                    {!activeApp.isMobile ? (
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left conversations column */}
                        <div className="w-[140px] border-r border-slate-800 bg-slate-950/50 flex flex-col p-2 space-y-2 select-none">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">Chats</span>
                          <button
                            onClick={() => setSelectedConversation('alex')}
                            className={`p-2 rounded-xl text-left text-xs transition ${
                              selectedConversation === 'alex' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">Alex</div>
                            <div className="text-[10px] truncate text-slate-400">Desktop UA sent...</div>
                          </button>
                          <button
                            onClick={() => setSelectedConversation('sarah')}
                            className={`p-2 rounded-xl text-left text-xs transition ${
                              selectedConversation === 'sarah' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">Sarah</div>
                            <div className="text-[10px] truncate text-slate-400">Meeting at 3?</div>
                          </button>
                          <button
                            onClick={() => setSelectedConversation('team')}
                            className={`p-2 rounded-xl text-left text-xs transition ${
                              selectedConversation === 'team' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">Dev Team</div>
                            <div className="text-[10px] truncate text-slate-400">Build passed!</div>
                          </button>
                        </div>

                        {/* Right conversation column */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="p-2 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/30">
                            <span className="font-semibold text-slate-200">Alex (Google Messages Web)</span>
                            <span className="text-[10px] text-blue-400 font-mono">Desktop Client</span>
                          </div>

                          <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                            {messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                              >
                                <div
                                  className={`p-2.5 rounded-2xl text-xs ${
                                    msg.isMe 
                                      ? 'bg-blue-600 text-white rounded-br-none' 
                                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                                <span className="text-[9.5px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Type a message (Desktop keyboard)..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="submit"
                              className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      /* MOBILE VIEW: Single-pane mobile phone interface */
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Mobile chat top bar */}
                        <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                              A
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200 leading-tight">Alex</div>
                              <div className="text-[9.5px] text-emerald-400">Mobile RCS Active</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                            <Video className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                          </div>
                        </div>

                        {/* Mobile messages stream */}
                        <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                              <div
                                className={`p-2.5 rounded-2xl text-xs ${
                                  msg.isMe 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9.5px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
                            </div>
                          ))}
                        </div>

                        {/* Mobile touch message bar */}
                        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Text (Mobile RCS)..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Custom URL App Preview - Explaining User-Agent layout dispatch */
                  <div className="flex-1 flex flex-col p-4 text-center items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg uppercase">
                      {activeApp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{activeApp.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-xs truncate">{activeApp.url}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-xs text-left space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Device Mode:</span>
                        <span className={activeApp.isMobile ? 'text-emerald-300 font-semibold' : 'text-blue-300 font-semibold'}>
                          {activeApp.isMobile ? 'Mobile Phone' : 'Desktop Browser'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Sec-CH-UA-Mobile:</span>
                        <span className="text-slate-200">{activeApp.isMobile ? '?1' : '?0'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 leading-normal">
                        {activeApp.isMobile 
                          ? 'Server receives Mobile User-Agent and serves its mobile phone layout.'
                          : 'Server receives standard desktop User-Agent and serves its desktop layout.'}
                      </div>
                    </div>
                    <a
                      href={activeApp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Launch URL in New Window
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile Phone Home Indicator Bar */}
              {activeApp.isMobile && (
                <div className="py-2 flex justify-center bg-slate-950/90 border-t border-slate-900 select-none">
                  <div className="w-28 h-1 rounded-full bg-slate-600/70"></div>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
