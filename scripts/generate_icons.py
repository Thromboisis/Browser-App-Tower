#!/usr/bin/env python3
import struct
import zlib
import base64
import math
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

def render_dock_spire(size):
    buf = bytearray(size * size * 4)
    def set_px(x, y, r, g, b, a=255):
        if 0 <= x < size and 0 <= y < size:
            idx = (y * size + x) * 4
            buf[idx] = r
            buf[idx+1] = g
            buf[idx+2] = b
            buf[idx+3] = a

    corner_r = max(2, int(size * 0.2))
    rail_w = max(4, int(size * 0.32))
    rail_x = size - rail_w - max(1, int(size * 0.08))

    for y in range(size):
        for x in range(size):
            # Distance from corners for rounded rectangle
            dx = max(0, max(corner_r - x, x - (size - 1 - corner_r)))
            dy = max(0, max(corner_r - y, y - (size - 1 - corner_r)))
            if dx * dx + dy * dy <= corner_r * corner_r:
                # Inside base squircle: background gradient #0f172a to #060913
                factor = (x + y) / (2.0 * size)
                r = int(15 * (1 - factor) + 6 * factor)
                g = int(23 * (1 - factor) + 9 * factor)
                b = int(42 * (1 - factor) + 19 * factor)
                set_px(x, y, r, g, b, 255)

    # Draw right dock rail
    for y in range(int(size * 0.12), size - int(size * 0.12)):
        # Rail gradient #2563eb (top) -> #0284c7 (mid) -> #0d9488 (bottom)
        y_frac = (y - size * 0.12) / (size * 0.76)
        if y_frac < 0.5:
            t = y_frac * 2
            rr = int(37 * (1-t) + 2 * t)
            gg = int(99 * (1-t) + 132 * t)
            bb = int(235 * (1-t) + 199 * t)
        else:
            t = (y_frac - 0.5) * 2
            rr = int(2 * (1-t) + 13 * t)
            gg = int(132 * (1-t) + 148 * t)
            bb = int(199 * (1-t) + 136 * t)

        for x in range(rail_x, rail_x + rail_w):
            set_px(x, y, rr, gg, bb, 255)

        # Luminous left spine of rail
        set_px(rail_x, y, 56, 189, 248, 255)

    # Draw 3 app chips inside rail
    chip_w = max(2, int(rail_w * 0.65))
    chip_x = rail_x + int((rail_w - chip_w) / 2)
    chip_h = max(2, int(size * 0.14))

    # Chip 1 (Amber / Notes)
    y1 = int(size * 0.22)
    for y in range(y1, y1 + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(x, y, 245, 158, 11, 255)

    # Chip 2 (Blue / Chat)
    y2 = int(size * 0.44)
    for y in range(y2, y2 + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(x, y, 59, 130, 246, 255)

    # Chip 3 (Teal / Plus)
    y3 = int(size * 0.66)
    for y in range(y3, y3 + chip_h):
        for x in range(chip_x, chip_x + chip_w):
            set_px(x, y, 16, 185, 129, 255)

    # Top beacon dot
    bx = rail_x + int(rail_w / 2)
    by = int(size * 0.16)
    set_px(bx, by, 255, 255, 255, 255)
    if size >= 48:
        set_px(bx-1, by, 56, 189, 248, 220)
        set_px(bx+1, by, 56, 189, 248, 220)
        set_px(bx, by-1, 56, 189, 248, 220)
        set_px(bx, by+1, 56, 189, 248, 220)

    # Faint browser content lines on the left side for larger sizes
    if size >= 48:
        for y in [int(size * 0.3), int(size * 0.45), int(size * 0.6)]:
            for x in range(int(size * 0.18), rail_x - int(size * 0.1)):
                set_px(x, y, 51, 65, 85, 180)

    return create_png(size, size, buf)

os.makedirs('extension/icons', exist_ok=True)
for sz in [16, 48, 128]:
    png_data = render_dock_spire(sz)
    path = f'extension/icons/icon{sz}.png'
    with open(path, 'wb') as f:
        f.write(png_data)
    b64 = base64.b64encode(png_data).decode('utf-8')
    print(f"Generated {path} ({len(png_data)} bytes), base64 length: {len(b64)}")
