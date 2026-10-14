#!/usr/bin/env python3
import struct
import zlib
import base64
import os

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

def render_base(size, corner_r=None):
    if corner_r is None:
        corner_r = max(2, int(size * 0.22))
    buf = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            dx = max(0, max(corner_r - x, x - (size - 1 - corner_r)))
            dy = max(0, max(corner_r - y, y - (size - 1 - corner_r)))
            if dx * dx + dy * dy <= corner_r * corner_r:
                factor = (x + y) / (2.0 * size)
                r = int(15 * (1 - factor) + 5 * factor)
                g = int(23 * (1 - factor) + 8 * factor)
                b = int(42 * (1 - factor) + 18 * factor)
                idx = (y * size + x) * 4
                buf[idx] = r
                buf[idx+1] = g
                buf[idx+2] = b
                buf[idx+3] = 255
    return buf

def set_px(buf, size, x, y, r, g, b, a=255):
    if 0 <= x < size and 0 <= y < size:
        idx = (y * size + x) * 4
        buf[idx] = r
        buf[idx+1] = g
        buf[idx+2] = b
        buf[idx+3] = a

# 1. Dock Spire
def render_dock_spire(size):
    buf = render_base(size)
    rail_w = max(4, int(size * 0.32))
    rail_x = size - rail_w - max(1, int(size * 0.08))

    for y in range(int(size * 0.12), size - int(size * 0.12)):
        y_frac = (y - size * 0.12) / (size * 0.76)
        t = y_frac
        rr = int(37 * (1-t) + 2 * t)
        gg = int(99 * (1-t) + 132 * t)
        bb = int(235 * (1-t) + 199 * t)
        for x in range(rail_x, rail_x + rail_w):
            set_px(buf, size, x, y, rr, gg, bb, 255)
        set_px(buf, size, rail_x, y, 56, 189, 248, 255)

    chip_w = max(2, int(rail_w * 0.65))
    chip_x = rail_x + int((rail_w - chip_w) / 2)
    chip_h = max(2, int(size * 0.14))

    for y in range(int(size * 0.22), int(size * 0.22) + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(buf, size, x, y, 245, 158, 11, 255)
    for y in range(int(size * 0.44), int(size * 0.44) + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(buf, size, x, y, 59, 130, 246, 255)
    for y in range(int(size * 0.66), int(size * 0.66) + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(buf, size, x, y, 16, 185, 129, 255)

    bx = rail_x + int(rail_w / 2)
    by = int(size * 0.16)
    set_px(buf, size, bx, by, 255, 255, 255, 255)
    return create_png(size, size, buf)

# 2. App Monolith (3D Isometric Stack)
def render_app_monolith(size):
    buf = render_base(size)
    cx = size // 2
    # 3 decks stacked vertically
    tiers = [
        (int(size * 0.28), (56, 189, 248), (2, 132, 199)),   # Top (Cyan)
        (int(size * 0.50), (129, 140, 248), (79, 70, 229)),  # Mid (Indigo)
        (int(size * 0.72), (192, 132, 252), (147, 51, 234)), # Bot (Purple)
    ]
    half_w = max(3, int(size * 0.32))
    h = max(2, int(size * 0.12))

    for cy, top_col, side_col in tiers:
        # Top face
        for dy in range(-h//2, h//2 + 1):
            cur_w = int(half_w * (1 - abs(dy) / (h//2 + 1) * 0.3))
            for dx in range(-cur_w, cur_w + 1):
                set_px(buf, size, cx + dx, cy + dy, *top_col)
        # Side face
        for dy in range(h//2, h + 1):
            for dx in range(-half_w + 1, half_w):
                set_px(buf, size, cx + dx, cy + dy, *side_col)

    # Center beam
    for y in range(int(size * 0.2), int(size * 0.8)):
        set_px(buf, size, cx, y, 255, 255, 255, 200)

    return create_png(size, size, buf)

# 3. Cyber Spire (Lettermark "A" + Skyscraper)
def render_cyber_spire(size):
    buf = render_base(size)
    cx = size // 2
    top_y = int(size * 0.14)
    bot_y = int(size * 0.86)
    w_base = int(size * 0.36)

    # Draw triangular spire / A
    for y in range(top_y, bot_y):
        frac = (y - top_y) / float(bot_y - top_y)
        cur_half_w = int(w_base * frac)
        # Gradient
        rr = int(56 * (1-frac) + 29 * frac)
        gg = int(189 * (1-frac) + 78 * frac)
        bb = int(248 * (1-frac) + 216 * frac)
        for dx in range(-cur_half_w, cur_half_w + 1):
            # Cutout inner A triangle
            if frac > 0.4 and abs(dx) < int(cur_half_w * 0.45) and y < int(size * 0.70):
                set_px(buf, size, cx + dx, y, 10, 15, 28)
            else:
                set_px(buf, size, cx + dx, y, rr, gg, bb)

    # Horizontal dock tiers
    for dx in range(-int(w_base * 0.55), int(w_base * 0.55)):
        set_px(buf, size, cx + dx, int(size * 0.65), 34, 211, 238)
        if size >= 48:
            set_px(buf, size, cx + dx, int(size * 0.65) + 1, 34, 211, 238)

    # Summit beacon
    for dy in range(-3, 0):
        set_px(buf, size, cx, top_y + dy, 255, 255, 255)

    return create_png(size, size, buf)

# 4. Hex Command
def render_hex_command(size):
    buf = render_base(size)
    cx = size // 2
    top_y = int(size * 0.16)
    bot_y = int(size * 0.84)
    pillar_w = max(4, int(size * 0.28))

    for y in range(top_y, bot_y):
        frac = (y - top_y) / float(bot_y - top_y)
        rr = int(99 * (1-frac) + 6 * frac)
        gg = int(102 * (1-frac) + 182 * frac)
        bb = int(241 * (1-frac) + 212 * frac)
        for dx in range(-pillar_w, pillar_w + 1):
            set_px(buf, size, cx + dx, y, rr, gg, bb)

    # Hollow center chamber
    chamber_w = max(2, int(pillar_w * 0.6))
    for y in range(top_y + 3, bot_y - 3):
        for dx in range(-chamber_w, chamber_w + 1):
            set_px(buf, size, cx + dx, y, 15, 23, 42)

    # 3 Glowing app gems
    cores = [
        (int(size * 0.32), (245, 158, 11)),
        (int(size * 0.50), (6, 182, 212)),
        (int(size * 0.68), (99, 102, 241)),
    ]
    r_core = max(1, int(size * 0.08))
    for cy, col in cores:
        for dy in range(-r_core, r_core + 1):
            for dx in range(-r_core, r_core + 1):
                if dx*dx + dy*dy <= r_core*r_core:
                    set_px(buf, size, cx + dx, cy + dy, *col)

    # Right bracket dock
    rx = cx + pillar_w + max(1, int(size * 0.06))
    for y in range(int(size * 0.35), int(size * 0.65)):
        set_px(buf, size, rx, y, 56, 189, 248)

    return create_png(size, size, buf)

generators = {
    'dock-spire': render_dock_spire,
    'app-monolith': render_app_monolith,
    'cyber-spire': render_cyber_spire,
    'hex-command': render_hex_command,
}

output_dict = {}
for logo_id, gen in generators.items():
    output_dict[logo_id] = {}
    for sz in [16, 48, 128]:
        png_data = gen(sz)
        b64 = base64.b64encode(png_data).decode('utf-8')
        output_dict[logo_id][sz] = b64

# Save output to a JSON / TS friendly file
import json
with open('src/data/generated_icons_b64.json', 'w') as f:
    json.dump(output_dict, f, indent=2)

print("All 4 logos generated at 16, 48, 128px and saved to JSON.")
