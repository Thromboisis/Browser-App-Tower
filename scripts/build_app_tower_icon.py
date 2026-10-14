#!/usr/bin/env python3
import struct
import zlib
import base64
import os
import math

def create_png(width, height, rgba_data):
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    raw_lines = bytearray()
    row_bytes = width * 4
    for y in range(height):
        raw_lines.append(0)
        raw_lines.extend(rgba_data[y * row_bytes:(y + 1) * row_bytes])

    idat_data = zlib.compress(bytes(raw_lines), 9)
    return png_header + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat_data) + chunk(b'IEND', b'')

# The 3-cube isometric tower SVG definition
app_tower_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
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
</svg>"""

# High-quality pixel rasterizer for 16, 48, and 128px PNGs matching the uploaded icon
def render_app_tower_png(size):
    buf = bytearray(size * size * 4)
    def set_px(x, y, r, g, b, a=255):
        if 0 <= x < size and 0 <= y < size:
            idx = (y * size + x) * 4
            # Alpha blend over existing
            cur_a = buf[idx+3] / 255.0
            new_a = a / 255.0
            out_a = new_a + cur_a * (1.0 - new_a)
            if out_a > 0:
                out_r = int((r * new_a + buf[idx] * cur_a * (1.0 - new_a)) / out_a)
                out_g = int((g * new_a + buf[idx+1] * cur_a * (1.0 - new_a)) / out_a)
                out_b = int((b * new_a + buf[idx+2] * cur_a * (1.0 - new_a)) / out_a)
                buf[idx] = min(255, max(0, out_r))
                buf[idx+1] = min(255, max(0, out_g))
                buf[idx+2] = min(255, max(0, out_b))
                buf[idx+3] = int(min(255, max(0, out_a * 255)))

    corner_r = max(2, int(size * 0.22))
    # 1. Background squircle (#171827 to #10111a)
    for y in range(size):
        for x in range(size):
            dx = max(0, max(corner_r - x, x - (size - 1 - corner_r)))
            dy = max(0, max(corner_r - y, y - (size - 1 - corner_r)))
            if dx * dx + dy * dy <= corner_r * corner_r:
                dist = math.sqrt((x - size*0.5)**2 + (y - size*0.4)**2) / (size * 0.7)
                factor = min(1.0, dist)
                r = int(32 * (1 - factor) + 16 * factor)
                g = int(35 * (1 - factor) + 17 * factor)
                b = int(54 * (1 - factor) + 26 * factor)
                set_px(x, y, r, g, b, 255)

    # Helper to draw an isometric cube tier
    # (cx, cy) is center of top face of cube
    def draw_cube(cy_top, top_col, left_col, right_col, emblem_type):
        cx = size // 2
        half_w = int(size * 0.25)
        h_face = int(size * 0.12)
        h_side = int(size * 0.20)

        # Top Face (Isometric rhombus with rounded top)
        for dy in range(-h_face, h_face + 1):
            cur_w = int(half_w * (1.0 - abs(dy) / float(h_face + 1)))
            for dx in range(-cur_w, cur_w + 1):
                # Gradient shading on top face (brighter towards top-left)
                t = (dx + dy + half_w + h_face) / float(half_w*2 + h_face*2 + 1)
                r = int(top_col[0] * (0.85 + 0.25 * t))
                g = int(top_col[1] * (0.85 + 0.25 * t))
                b = int(top_col[2] * (0.85 + 0.25 * t))
                set_px(cx + dx, cy_top + dy, min(255, r), min(255, g), min(255, b), 255)

        # Left Face (Darker shading)
        for dy in range(0, h_side):
            for dx in range(-half_w, 1):
                # Slanted isometric edge: dy vs dx
                slant_limit = int((dx + half_w) / float(half_w + 1) * h_face)
                if dy >= slant_limit:
                    r = int(left_col[0] * (0.8 + 0.2 * (dy/float(h_side))))
                    g = int(left_col[1] * (0.8 + 0.2 * (dy/float(h_side))))
                    b = int(left_col[2] * (0.8 + 0.2 * (dy/float(h_side))))
                    set_px(cx + dx, cy_top + dy, r, g, b, 255)

        # Right Face (Illuminated side with emblem)
        for dy in range(0, h_side):
            for dx in range(0, half_w + 1):
                slant_limit = int((half_w - dx) / float(half_w + 1) * h_face)
                if dy >= slant_limit:
                    r = int(right_col[0] * (0.9 + 0.15 * (1.0 - dy/float(h_side))))
                    g = int(right_col[1] * (0.9 + 0.15 * (1.0 - dy/float(h_side))))
                    b = int(right_col[2] * (0.9 + 0.15 * (1.0 - dy/float(h_side))))
                    set_px(cx + dx, cy_top + dy, min(255, r), min(255, g), min(255, b), 255)

        # Draw subtle embossed emblem on right face for larger sizes
        if size >= 48:
            ex = cx + int(half_w * 0.45)
            ey = cy_top + int(h_side * 0.55)
            emb_col = (int(right_col[0]*0.55), int(right_col[1]*0.55), int(right_col[2]*0.55))
            if emblem_type == 'star': # Star dot
                for ddx in [-1, 0, 1]:
                    for ddy in [-1, 0, 1]:
                        if abs(ddx) + abs(ddy) <= 1:
                            set_px(ex + ddx, ey + ddy, *emb_col, 200)
            elif emblem_type == 'pin': # Pin node
                for ddx in [-1, 0, 1]:
                    for ddy in [-1, 0, 1]:
                        set_px(ex + ddx, ey + ddy, *emb_col, 200)
            elif emblem_type == 'grid': # 2x2 grid
                set_px(ex-1, ey-1, *emb_col, 200)
                set_px(ex+1, ey-1, *emb_col, 200)
                set_px(ex-1, ey+1, *emb_col, 200)
                set_px(ex+1, ey+1, *emb_col, 200)

    # Draw bottom to top so upper cubes overlap correctly
    # Bottom Cube: Teal / Cyan
    draw_cube(
        cy_top=int(size * 0.65),
        top_col=(34, 211, 238),
        left_col=(8, 145, 178),
        right_col=(6, 182, 212),
        emblem_type='grid'
    )

    # Middle Cube: Purple / Violet
    draw_cube(
        cy_top=int(size * 0.43),
        top_col=(192, 132, 252),
        left_col=(126, 34, 206),
        right_col=(147, 51, 234),
        emblem_type='pin'
    )

    # Top Cube: Golden Yellow / Amber
    draw_cube(
        cy_top=int(size * 0.21),
        top_col=(254, 215, 102),
        left_col=(217, 119, 6),
        right_col=(251, 191, 36),
        emblem_type='star'
    )

    return create_png(size, size, buf)

# Generate and save PNG icons directly into extension/icons/
os.makedirs('extension/icons', exist_ok=True)
png_b64s = {}

for sz in [16, 48, 128]:
    png_data = render_app_tower_png(sz)
    path = f'extension/icons/icon{sz}.png'
    with open(path, 'wb') as f:
        f.write(png_data)
    b64 = base64.b64encode(png_data).decode('utf-8')
    png_b64s[sz] = b64
    print(f"Generated {path} ({len(png_data)} bytes)")

# Also write to src/data/app_tower_icon.ts
ts_code = f'''// Generated official App Tower icon (3-Cube Isometric Stack: Gold, Purple, Cyan)
export const APP_TOWER_SVG = `{app_tower_svg}`;

export const ICON_16_B64 = "{png_b64s[16]}";
export const ICON_48_B64 = "{png_b64s[48]}";
export const ICON_128_B64 = "{png_b64s[128]}";
'''

with open('src/data/appTowerIcon.ts', 'w') as f:
    f.write(ts_code)

print("Icon assets successfully created!")
