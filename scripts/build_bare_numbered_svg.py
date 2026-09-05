#!/usr/bin/env python3
"""Regenerate public/assets/Final-Layout-STE-2026-numbered.svg as a bare,
numbers-only plan - stall number badge + size label + size-coded colour,
no exhibitor names - matching the reference photo the organisers use to
point exhibitors to their stall by the number on their allotment slip
rather than by hunting for their brand name in tiny text.

Same geometry/colour source as build_final_svg2.py (stallMap2026.ts via
build_final_svg.parse_stall_map(), hall features via
build_final_2026.parse_layout()) - only the per-stall label logic differs.

Run: py -3 scripts/build_bare_numbered_svg.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\rebel\OneDrive\Documents\Projects\STE-feature-clean-code-assets")
sys.path.insert(0, str(ROOT / "scripts"))
import number_stalls
import build_final_svg as bfs  # reuse parse_stall_map()
import build_final_2026 as b2  # reuse parse_layout()

COLOUR_BY_SIZE = number_stalls.COLOUR_BY_SIZE

stalls = bfs.parse_stall_map()
_, features = b2.parse_layout()
print("stalls=%d features=%d" % (len(stalls), len(features)))


def xml_escape(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


CHAR_W = 0.6


def fit_size(text, width_units, max_size, min_size):
    if not text:
        return max_size
    size = width_units / (CHAR_W * len(text))
    return max(min_size, min(max_size, size))


def fit_text(text, width_units, size):
    max_chars = max(3, int(width_units / (CHAR_W * size)))
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rstrip() + "\u2026"


VIEW_W, VIEW_H = number_stalls.VIEW_W, number_stalls.VIEW_H
out = []
out.append('<?xml version="1.0" encoding="utf-8"?>')
out.append('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"'
           f' width="{VIEW_W}" height="{VIEW_H}" viewBox="-15 -12 872 615">')
out.append('<defs>')
out.append('  <style>')
out.append('    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }')
out.append('    .hall-feat { font-weight: bold; fill: #111827; }')
out.append('    .stall-rect { stroke: #1f2937; stroke-width: 0.55; }')
out.append('    .size-lbl { font-size: 3.4px; font-weight: 700; fill: #1f2937; }')
out.append('  </style>')
out.append('</defs>')
out.append('<rect x="-15" y="-12" width="872" height="615" fill="#ffffff"/>')
out.append('<text x="421" y="-2.5" font-size="7.5" font-weight="800" fill="#111827" text-anchor="middle" letter-spacing="0.5">SURAT TEXTILE EXHIBITION (STE) 2026 \u2014 PROPOSED LAYOUT (STALL NUMBERS)</text>')

#: Hall furniture / legend labels the raw drawing carries as plain text -
#: kept verbatim. Anything else in a feature's label is exhibitor-name text
#: the source sheet happens to have baked into a non-stall cell (e.g. a
#: Premium Lounge bay or a stray one-off addition never turned into a
#: proper STALL_MAP_2026 entry); this pass strips the name back out to just
#: an "A<n>"/size fragment if present, or drops the label entirely.
SAFE_FEATURE = re.compile(
    r'^(elec\.?|jail|fire( exit)?|wash room|stair|entry|exit|'
    r'premium lounge|product launch pad|ste office|help desk|'
    r'proposed layout|.* - \d+)$',
    re.IGNORECASE,
)
BAY_PREFIX = re.compile(r'^(A\d+)\b')
SIZE_SUFFIX = re.compile(r'(\d+M\s*x\s*\d+M)\s*$', re.IGNORECASE)

feature_labels = []
for f in features:
    fill = f["fill"]
    if fill and fill != "#ffffff":
        out.append(f'<rect x="{f["x"]:.2f}" y="{f["y"]:.2f}" width="{f["w"]:.2f}" height="{f["h"]:.2f}" fill="{fill}" stroke="#374151" stroke-width="0.5"/>')
    elif fill == "#ffffff":
        out.append(f'<rect x="{f["x"]:.2f}" y="{f["y"]:.2f}" width="{f["w"]:.2f}" height="{f["h"]:.2f}" fill="#ffffff" stroke="#9ca3af" stroke-width="0.5"/>')
    lbl = f["label"].strip()
    if lbl and not SAFE_FEATURE.match(lbl):
        prefix = BAY_PREFIX.match(lbl)
        suffix = SIZE_SUFFIX.search(lbl)
        lbl = " ".join(x.group(1) for x in (prefix, suffix) if x)
    if lbl:
        cx = f["x"] + f["w"] / 2
        cy = f["y"] + f["h"] / 2
        avail = max(f["w"] * 6, 40.0)
        font_sz = fit_size(lbl, avail, max_size=6.8, min_size=4.2)
        shown = fit_text(lbl, avail, font_sz)
        feature_labels.append(
            f'<text x="{cx:.2f}" y="{cy + font_sz*0.35:.2f}" font-size="{font_sz:.1f}" '
            f'class="hall-feat" text-anchor="middle">{xml_escape(shown)}</text>'
        )


def draw_badge(cx, cy, text, is_small=False):
    t_str = str(text)
    bw = max(9.6, 3.8 + 2.8 * len(t_str)) if not is_small else max(8.0, 2.8 + 2.4 * len(t_str))
    bh = 6.0 if not is_small else 5.0
    f_sz = 4.4 if not is_small else 3.5
    return (
        f'<rect x="{cx - bw/2:.2f}" y="{cy - bh/2:.2f}" width="{bw:.2f}" height="{bh:.2f}" rx="1.5" fill="#ffffff" stroke="#b91c1c" stroke-width="0.75"/>'
        f'<text x="{cx:.2f}" y="{cy + f_sz*0.34:.2f}" font-size="{f_sz:.1f}" font-weight="800" text-anchor="middle" fill="#b91c1c">{xml_escape(t_str)}</text>'
    )


badges = []

for s in stalls:
    rect_fill = COLOUR_BY_SIZE.get(s["size"], "#e5e7eb")
    out.append(f'<rect x="{s["x"]:.2f}" y="{s["y"]:.2f}" width="{s["w"]:.2f}" height="{s["h"]:.2f}" fill="{rect_fill}" class="stall-rect"/>')

    if s["stallNumber"] == 39 and s.get("subStalls"):
        for sub in s.get("subStalls", []):
            sub_fill = COLOUR_BY_SIZE.get(sub["size"], "#ffffff")
            out.append(f'<rect x="{sub["x"]:.2f}" y="{sub["y"]:.2f}" width="{sub["w"]:.2f}" height="{sub["h"]:.2f}" fill="{sub_fill}" class="stall-rect"/>')
            sub_cx = sub["x"] + sub["w"] / 2
            out.append(f'<rect x="{sub["x"] + 1.5:.2f}" y="{sub["y"] + 1.5:.2f}" width="{sub["w"] - 3.0:.2f}" height="4.6" rx="1.2" fill="#ffffff" stroke="#b91c1c" stroke-width="0.5"/>')
            out.append(f'<text x="{sub_cx:.2f}" y="{sub["y"] + 4.8:.2f}" font-size="3.2" font-weight="800" fill="#b91c1c" text-anchor="middle">Bay {xml_escape(sub["units"])}</text>')
        badges.append(draw_badge(s["x"] + s["w"] / 2, s["y"] - 4.2, "39"))
        continue

    if "halves" in s:
        halves = s["halves"]
        if len(halves) == 2:
            a, b = halves
            if a["y"] == b["y"]:
                split_pos = max(a["x"], b["x"])
                out.append(f'<line x1="{split_pos:.2f}" y1="{s["y"]:.2f}" x2="{split_pos:.2f}" y2="{s["y"]+s["h"]:.2f}" stroke="#b91c1c" stroke-width="0.6" stroke-dasharray="2 1.5"/>')
            else:
                split_pos = max(a["y"], b["y"])
                out.append(f'<line x1="{s["x"]:.2f}" y1="{split_pos:.2f}" x2="{s["x"]+s["w"]:.2f}" y2="{split_pos:.2f}" stroke="#b91c1c" stroke-width="0.6" stroke-dasharray="2 1.5"/>')
        for half in halves:
            hcx = half["x"] + half["w"] / 2
            badges.append(draw_badge(hcx, half["y"] + half["h"] / 2, half["id"], is_small=True))
        continue

    sno_str = str(s["stallNumber"])
    size_str = s["size"]
    w, h = s["w"], s["h"]
    cx = s["x"] + w / 2
    is_vertical = h > w * 1.3
    is_square = abs(w - h) < 3.0

    if s.get("zone") == "North Wall Strip":
        badges.append(draw_badge(cx, s["y"] + h / 2, sno_str, is_small=True))
        out.append(f'<text x="{s["x"] + w - 1.5:.2f}" y="{s["y"] + 4.2:.2f}" class="size-lbl" text-anchor="end">{xml_escape(size_str)}</text>')
        continue

    if is_square:
        badges.append(draw_badge(cx, s["y"] + h / 2, sno_str, is_small=True))
        out.append(f'<text x="{cx:.2f}" y="{s["y"] + h - 2.2:.2f}" class="size-lbl" text-anchor="middle">{xml_escape(size_str)}</text>')
        continue

    if is_vertical:
        cy = s["y"] + h / 2
        badges.append(draw_badge(cx, cy, sno_str))
        out.append(f'<text x="{cx:.2f}" y="{s["y"] + h - 3.0:.2f}" class="size-lbl" text-anchor="middle" transform="rotate(-90 {cx:.2f} {s["y"] + h - 3.0:.2f})">{xml_escape(size_str)}</text>')
        continue

    badges.append(draw_badge(cx, s["y"] + h / 2, sno_str, is_small=True))
    out.append(f'<text x="{s["x"] + w - 1.5:.2f}" y="{s["y"] + 4.2:.2f}" class="size-lbl" text-anchor="end">{xml_escape(size_str)}</text>')

out.append('<g id="hall-feat-labels">')
out.extend(feature_labels)
out.append('</g>')
out.append('<g id="stall-badges">')
out.extend(badges)
out.append('</g>')
out.append('</svg>')

svg_content = "\n".join(out) + "\n"
out_svg_path = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"
out_svg_path.write_text(svg_content, encoding="utf-8")
print(f"wrote {out_svg_path}")
print(
    "REMINDER: this asset is served with a one-year immutable cache header "
    "(see FloorPlan2026.tsx). Copy this file to a NEW -v<n> filename and "
    "bump PLAN_SRC there too, or every browser that already loaded the old "
    "name keeps showing it for up to a year regardless of this redeploy."
)
