// Generated official App Tower icon (3-Cube Isometric Stack: Gold, Purple, Cyan)
export const APP_TOWER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="at_bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#22253a" />
      <stop offset="100%" stop-color="#12131f" />
    </radialGradient>

    <!-- Top Yellow Cube Gradients -->
    <linearGradient id="cube_y_top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fed766" />
      <stop offset="60%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="cube_y_left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="cube_y_right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Middle Purple Cube Gradients -->
    <linearGradient id="cube_p_top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="60%" stop-color="#9333ea" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <linearGradient id="cube_p_left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#581c87" />
    </linearGradient>
    <linearGradient id="cube_p_right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>

    <!-- Bottom Teal Cube Gradients -->
    <linearGradient id="cube_t_top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0891b2" />
    </linearGradient>
    <linearGradient id="cube_t_left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0891b2" />
      <stop offset="100%" stop-color="#0e7490" />
    </linearGradient>
    <linearGradient id="cube_t_right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <!-- Base Ambient Shadow -->
    <radialGradient id="base_shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#07080f" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#12131f" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Dark Rounded App Container Background -->
  <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#at_bg)" stroke="#2a2d45" stroke-width="1.5" />

  <!-- Soft Ambient Drop Shadow under Tower -->
  <ellipse cx="64" cy="112" rx="30" ry="10" fill="url(#base_shadow)" />

  <!-- 3. BOTTOM CUBE (TEAL / CYAN) -->
  <g id="bottom_cube">
    <!-- Left Face -->
    <path d="M42 75.5 L63 87.5 L63 111.5 Q63 115 59.5 113.5 L40.5 102.5 Q38 101 38 98 L38 78 Q38 74.5 42 75.5 Z" fill="url(#cube_t_left)" />
    <!-- Right Face -->
    <path d="M64 87.5 L86 75.5 Q90 74.5 90 78 L90 98 Q90 101 87.5 102.5 L68.5 113.5 Q64.5 115 64.5 111.5 Z" fill="url(#cube_t_right)" />
    <!-- Top Face -->
    <path d="M64 63.5 Q66 62.5 68.5 64 L86 74 Q89 75.5 87 77 L66 88.5 Q64 89.5 62 88.5 L41 77 Q39 75.5 42 74 L59.5 64 Q62 62.5 64 63.5 Z" fill="url(#cube_t_top)" />
    <!-- Embossed 4-tile grid icon on right face -->
    <g opacity="0.35" fill="#0c4a6e">
      <rect x="74" y="86" width="3.5" height="3.5" rx="0.8" />
      <rect x="79" y="89" width="3.5" height="3.5" rx="0.8" />
      <rect x="74" y="91" width="3.5" height="3.5" rx="0.8" />
      <rect x="79" y="94" width="3.5" height="3.5" rx="0.8" />
    </g>
  </g>

  <!-- 2. MIDDLE CUBE (PURPLE / VIOLET) -->
  <g id="middle_cube">
    <!-- Left Face -->
    <path d="M42 47.5 L63 59.5 L63 83.5 Q63 87 59.5 85.5 L40.5 74.5 Q38 73 38 70 L38 50 Q38 46.5 42 47.5 Z" fill="url(#cube_p_left)" />
    <!-- Right Face -->
    <path d="M64 59.5 L86 47.5 Q90 46.5 90 50 L90 70 Q90 73 87.5 74.5 L68.5 85.5 Q64.5 87 64.5 83.5 Z" fill="url(#cube_p_right)" />
    <!-- Top Face -->
    <path d="M64 35.5 Q66 34.5 68.5 36 L86 46 Q89 47.5 87 49 L66 60.5 Q64 61.5 62 60.5 L41 49 Q39 47.5 42 46 L59.5 36 Q62 34.5 64 35.5 Z" fill="url(#cube_p_top)" />
    <!-- Embossed Map Pin / Location node on right face -->
    <g opacity="0.35" fill="#4c1d95">
      <path d="M78 57.5 C76 57.5 74.5 59 74.5 61 C74.5 63.5 78 68 78 68 C78 68 81.5 63.5 81.5 61 C81.5 59 80 57.5 78 57.5 Z" />
      <circle cx="78" cy="61" r="1.2" fill="#9333ea" />
    </g>
  </g>

  <!-- 1. TOP CUBE (GOLDEN YELLOW / AMBER) -->
  <g id="top_cube">
    <!-- Left Face -->
    <path d="M42 19.5 L63 31.5 L63 55.5 Q63 59 59.5 57.5 L40.5 46.5 Q38 45 38 42 L38 22 Q38 18.5 42 19.5 Z" fill="url(#cube_y_left)" />
    <!-- Right Face -->
    <path d="M64 31.5 L86 19.5 Q90 18.5 90 22 L90 42 Q90 45 87.5 46.5 L68.5 57.5 Q64.5 59 64.5 55.5 Z" fill="url(#cube_y_right)" />
    <!-- Top Face -->
    <path d="M64 7.5 Q66 6.5 68.5 8 L86 18 Q89 19.5 87 21 L66 32.5 Q64 33.5 62 32.5 L41 21 Q39 19.5 42 18 L59.5 8 Q62 6.5 64 7.5 Z" fill="url(#cube_y_top)" />
    <!-- Embossed 5-pointed Star on right face -->
    <polygon points="78,28 79.5,32 83.5,32.3 80.5,35 81.5,39 78,36.8 74.5,39 75.5,35 72.5,32.3 76.5,32" opacity="0.38" fill="#78350f" />
  </g>
</svg>`;

export const ICON_16_B64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABf0lEQVR42n2Tv0vDQBTHM9g6N7+btkmbNLWKgyD+NSIFKTiJi47ODoKLW2dx0kXQqdA6WLQOOtTFoQ7iYIdOuujwvHeXO/s88OBDcnfv+32XvHeGMTNspwaOm4Dj1cH104yGesd13Df+DsuOwHaZ2Et4oFdsMBbAD5oKnOO6MEp4PM2sxEL42l+H95sNmA5b8PGwCV+jtjKSJiK7U2VuMbjseJjhvDVHgNtUg5+ExaOOZMcM3a0c4btX18A4dQphILL7wSIMd3KE6WWsgXEYjzpD/Lxfg3bphNBZ+9T412C7ckE4Xp1oUAPyCU3Yi/qEw5WxhqhGZoBVwOaQJSyWliAoL0PYfYLo+hmiwQtU79+g9jjh67ivSolNZdm0jPndI0pvrEHKaNohyBZG1/x+h3I10pDZUWeYVgV4K2cm8wenhNzZnYYUo45346wJHos3FrlQKZ+LOxBTMY6CWQZpwltbGnES/lRCto9xGK/dygJbNK0QTDTKzBQo4sKQCH8ABR+h/hDu1NsAAAAASUVORK5CYII=";
export const ICON_48_B64 = "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";
export const ICON_128_B64 = "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";
