import os
import re
import sys
import json
import shutil
import tempfile
import subprocess
from pathlib import Path

ROOT = Path(r"c:\Users\rebel\OneDrive\Documents\Projects\STE-feature-clean-code-assets")
os.chdir(ROOT)

sys.path.insert(0, str(ROOT / "scripts"))
import number_stalls

# 1. Load layout geometry
stalls, features = number_stalls.read_layout()
stalls = number_stalls.carry_numbers(stalls)
number_stalls.split_halves(stalls, number_stalls.LOCKED_SPLIT_BAYS)

# 2. Load fascia mapping from public/assets/fascia_map.json, built by
#    scripts/build_fascia_map.py straight from live Supabase
#    (exhibitors.fascia_names_json - what each exhibitor typed into the
#    portal) and STE_2026_Admin_Master_Report_For_facia-names.xlsx (the
#    organisers' own reconciled sheet, used where Supabase has nothing).
#    No hardcoded name list here any more - regenerate the JSON and rerun
#    this script when either source changes.
with open(ROOT / 'public' / 'assets' / 'fascia_map.json', 'r', encoding='utf-8') as f:
    fascia_map = json.load(f)

# Clean and normalize fascia names for visual display
def get_clean_fascia_names(unit_id, orig_brand):
    info = fascia_map.get(str(unit_id))
    raw_names = info['fascia_names'] if info else [orig_brand]

    cleaned = []
    seen = set()
    for n in raw_names:
        s = str(n).strip()
        s_clean = re.sub(r'(?i)\s*(pvt\.?\s*ltd\.?|private\s+limited|llp|limited)', '', s).strip()
        norm = re.sub(r'[\s_.,\(\)]', '', s_clean.lower())
        if s_clean and norm not in seen:
            seen.add(norm)
            cleaned.append(s_clean)
            
    if not cleaned:
        return [orig_brand]
    return cleaned[:2]

COLOUR_BY_SIZE = number_stalls.COLOUR_BY_SIZE

def xml_escape(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

# Average glyph width for this bold sans stack, as a fraction of font-size.
# Used to fit a name into a box: pick the largest size in [min,max] that
# keeps it inside width_units, then truncate with an ellipsis if even the
# floor size would still overflow - so a long fascia name shrinks first and
# only clips as a last resort, instead of silently overflowing the stall.
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
    return text[: max_chars - 1].rstrip() + "…"

def wrap_two(text):
    """Split a name across two lines on a word boundary, or None if it can't be.

    A 100 sqft square is too small for most single names on one line without
    shrinking past legibility - "Ashirwad Textiles" at floor size was landing
    at 1.7px and still getting ellipsised down to "Ashirwad Texti…", which
    reads as a blank box at arm's length. Two shorter lines fit at a size
    that is actually readable; one line stays the fallback for a single word
    or anything wrap_two can't split evenly."""
    words = text.split()
    if len(words) < 2:
        return None
    target = -(-len(text) // 2)
    line1, i = "", 0
    for i, word in enumerate(words):
        if line1 and len(line1) + 1 + len(word) > target:
            break
        line1 = f"{line1} {word}" if line1 else word
    else:
        return None
    line2 = " ".join(words[i:])
    return (line1, line2) if line1 and line2 else None

out = []
out.append('<?xml version="1.0" encoding="utf-8"?>')
out.append('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"'
           ' width="872" height="615" viewBox="-15 -12 872 615">')
out.append('<defs>')
out.append('  <style>')
out.append('    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }')
out.append('    .hall-feat { font-weight: bold; fill: #111827; }')
out.append('    .stall-rect { stroke: #1f2937; stroke-width: 0.55; }')
out.append('    .size-lbl { font-size: 3.2px; font-weight: 600; fill: #4b5563; }')
out.append('    .brand-lbl { font-weight: 700; fill: #000000; }')
out.append('    .brand-lbl-2 { font-weight: 700; fill: #000000; }')
out.append('    .vacant-lbl { font-size: 3.2px; font-style: italic; font-weight: 500; fill: #6b7280; }')
out.append('  </style>')
out.append('</defs>')
out.append('<rect x="-15" y="-12" width="872" height="615" fill="#ffffff"/>')

# Title Banner
out.append('<text x="421" y="-2.5" font-size="7.5" font-weight="800" fill="#111827" text-anchor="middle" letter-spacing="0.5">SURAT TEXTILE EXHIBITION (STE) 2026 — MASTER APPROVED LAYOUT (FASCIA NAMES)</text>')

# Features (hall walls, launch pad, office, legend, etc.). Rects are drawn
# here, in reading order; labels are collected into feature_labels and drawn
# last (after every stall rect too), because a wall strip like the one
# beside the electrical/wash-room/fire-exit badges on the west corridor is
# defined later in the sheet than those badges and was painting straight
# over their text - the label was never actually too big for its box, it was
# just getting covered.
feature_labels = []
for f in features:
    fill = f["fill"]
    if fill and fill != "#ffffff":
        out.append(f'<rect x="{f["x"]:.2f}" y="{f["y"]:.2f}" width="{f["w"]:.2f}" height="{f["h"]:.2f}" fill="{fill}" stroke="#374151" stroke-width="0.5"/>')
    elif fill == "#ffffff":
        out.append(f'<rect x="{f["x"]:.2f}" y="{f["y"]:.2f}" width="{f["w"]:.2f}" height="{f["h"]:.2f}" fill="#ffffff" stroke="#9ca3af" stroke-width="0.5"/>')

    lbl = f["label"].strip()
    if lbl:
        cx = f["x"] + f["w"] / 2
        cy = f["y"] + f["h"] / 2
        # A feature's own footprint (f["w"]) is often just an icon-sized
        # marker - the label is meant to spill into the open aisle around
        # it, so fit it against the hall span it sits in rather than its own
        # tiny box, with a floor so a long one shrinks instead of vanishing.
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
    
    # -------------------------------------------------------------------------
    # 1. Stall 39 (Mega Anchor SSS Pavilion)
    # -------------------------------------------------------------------------
    if s["stallNumber"] == 39:
        for sub in s.get("subStalls", []):
            sub_fill = COLOUR_BY_SIZE.get(sub["size"], "#ffffff")
            out.append(f'<rect x="{sub["x"]:.2f}" y="{sub["y"]:.2f}" width="{sub["w"]:.2f}" height="{sub["h"]:.2f}" fill="{sub_fill}" class="stall-rect"/>')
            
            sub_cx = sub["x"] + sub["w"] / 2
            sub_cy = sub["y"] + sub["h"] / 2
            unit_lbl = sub["units"]
            brand_name = sub["brand"]
            
            out.append(f'<rect x="{sub["x"] + 1.5:.2f}" y="{sub["y"] + 1.5:.2f}" width="{sub["w"] - 3.0:.2f}" height="4.6" rx="1.2" fill="#ffffff" stroke="#b91c1c" stroke-width="0.5"/>')
            out.append(f'<text x="{sub_cx:.2f}" y="{sub["y"] + 4.8:.2f}" font-size="3.2" font-weight="800" fill="#b91c1c" text-anchor="middle">Bay {xml_escape(unit_lbl)}</text>')
            
            if sub["h"] < 20:
                b_sz = 2.7
                sy = sub["y"] + 10.2
                out.append(f'<text x="{sub_cx:.2f}" y="{sy:.2f}" font-size="{b_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(brand_name)}</text>')
            else:
                brand_cy = sub["y"] + 19.5
                b_sz = 3.6
                out.append(f'<text x="{sub_cx:.2f}" y="{brand_cy + b_sz*0.35:.2f}" font-size="{b_sz:.1f}" class="brand-lbl" text-anchor="middle" transform="rotate(-90 {sub_cx:.2f} {brand_cy:.2f})">{xml_escape(brand_name)}</text>')
                
        badges.append(draw_badge(s["x"] + s["w"] / 2, s["y"] - 4.2, "39 - SARAOGI SUPER SALES (SSS)"))
        continue

    # -------------------------------------------------------------------------
    # 2. Split Bays (91A/91B, 107A/107B)
    # -------------------------------------------------------------------------
    if "halves" in s:
        a, b = s["halves"]
        if a["y"] == b["y"]:
            split_pos = max(a["x"], b["x"])
            out.append(f'<line x1="{split_pos:.2f}" y1="{s["y"]:.2f}" x2="{split_pos:.2f}" y2="{s["y"]+s["h"]:.2f}" stroke="#b91c1c" stroke-width="0.6" stroke-dasharray="2 1.5"/>')
        else:
            split_pos = max(a["y"], b["y"])
            out.append(f'<line x1="{s["x"]:.2f}" y1="{split_pos:.2f}" x2="{s["x"]+s["w"]:.2f}" y2="{split_pos:.2f}" stroke="#b91c1c" stroke-width="0.6" stroke-dasharray="2 1.5"/>')
            
        for half in s["halves"]:
            hid = half["id"]
            hcx = half["x"] + half["w"] / 2
            f_names = get_clean_fascia_names(hid, "")
            
            badges.append(draw_badge(hcx, half["y"] + 3.8, hid, is_small=True))
            
            if f_names:
                avail = half["w"] * 0.94
                if len(f_names) == 1:
                    f_sz = fit_size(f_names[0], avail, max_size=2.6, min_size=2.0)
                    shown = fit_text(f_names[0], avail, f_sz)
                    out.append(f'<text x="{hcx:.2f}" y="{half["y"] + 9.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(shown)}</text>')
                else:
                    f_sz = min(fit_size(n, avail, max_size=2.3, min_size=1.8) for n in f_names)
                    n0, n1 = (fit_text(n, avail, f_sz) for n in f_names)
                    out.append(f'<text x="{hcx:.2f}" y="{half["y"] + 8.6:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(n0)}</text>')
                    out.append(f'<text x="{hcx:.2f}" y="{half["y"] + 11.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle">{xml_escape(n1)}</text>')
        continue

    # -------------------------------------------------------------------------
    # 3. Regular Stalls
    # -------------------------------------------------------------------------
    sno = s["stallNumber"]
    sno_str = str(sno)
    f_names = get_clean_fascia_names(sno_str, "")
    size_str = s["size"]
    w, h = s["w"], s["h"]
    cx = s["x"] + w / 2
    cy = s["y"] + h / 2
    is_vertical = h > w * 1.3
    is_square = abs(w - h) < 3.0
    
    # -------------------------------------------------------------------------
    # North Wall Strip (Stalls 1-21) - Horizontal 6M x 3M (w=33.84, h=16.90)
    # -------------------------------------------------------------------------
    if s.get("zone") == "North Wall Strip":
        # Badge at top-left
        badges.append(draw_badge(s["x"] + 6.0, s["y"] + 3.8, sno_str, is_small=True))
        # Size on the top right
        out.append(f'<text x="{s["x"] + w - 1.5:.2f}" y="{s["y"] + 4.2:.2f}" class="size-lbl" text-anchor="end">{xml_escape(size_str)}</text>')
        
        if f_names and f_names[0]:
            avail = w * 0.94
            if len(f_names) == 1:
                # 1 name centered
                f_sz = fit_size(f_names[0], avail, max_size=3.8, min_size=2.4)
                shown = fit_text(f_names[0], avail, f_sz)
                out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(shown)}</text>')
            else:
                # 2 names, Line 1 & Line 2
                f_sz = min(fit_size(n, avail, max_size=3.2, min_size=2.1) for n in f_names)
                n0, n1 = (fit_text(n, avail, f_sz) for n in f_names)
                out.append(f'<text x="{cx:.2f}" y="{s["y"] + 9.5:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(n0)}</text>')
                out.append(f'<text x="{cx:.2f}" y="{s["y"] + 13.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle">{xml_escape(n1)}</text>')
        else:
            out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.2:.2f}" class="vacant-lbl" text-anchor="middle">(Vacant)</text>')
        continue

    # -------------------------------------------------------------------------
    # Square Stalls 3M x 3M (w=16.92, h=16.90)
    # -------------------------------------------------------------------------
    if is_square:
        badges.append(draw_badge(cx, s["y"] + 3.8, sno_str, is_small=True))
        if f_names and f_names[0]:
            avail = w * 0.94
            if len(f_names) == 1:
                name = f_names[0]
                one_line = fit_size(name, avail, max_size=2.7, min_size=2.0)
                rows = wrap_two(name) if one_line <= 2.1 else None
                if rows:
                    f_sz = min(fit_size(r, avail, max_size=2.7, min_size=2.0) for r in rows)
                    out.append(f'<text x="{cx:.2f}" y="{s["y"] + 8.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(fit_text(rows[0], avail, f_sz))}</text>')
                    out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle">{xml_escape(fit_text(rows[1], avail, f_sz))}</text>')
                else:
                    shown = fit_text(name, avail, one_line)
                    out.append(f'<text x="{cx:.2f}" y="{s["y"] + 10.2:.2f}" font-size="{one_line:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(shown)}</text>')
            else:
                f_sz = min(fit_size(n, avail, max_size=2.3, min_size=1.8) for n in f_names)
                n0, n1 = (fit_text(n, avail, f_sz) for n in f_names)
                out.append(f'<text x="{cx:.2f}" y="{s["y"] + 8.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(n0)}</text>')
                out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.8:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle">{xml_escape(n1)}</text>')
        else:
            out.append(f'<text x="{cx:.2f}" y="{s["y"] + 9.8:.2f}" class="vacant-lbl" text-anchor="middle">Vacant</text>')
        continue

    # -------------------------------------------------------------------------
    # Vertical Column Stalls (h > w * 1.3)
    # -------------------------------------------------------------------------
    if is_vertical:
        front = s.get("frontEnd", "south")
        
        if front == "south":
            badge_y = s["y"] + h - 5.0
            size_y = s["y"] + 4.0
            brand_span = (s["y"] + 7.0, badge_y - 5.0)
        else:
            badge_y = s["y"] + 5.0
            size_y = s["y"] + h - 4.0
            brand_span = (badge_y + 5.0, s["y"] + h - 7.0)
            
        badges.append(draw_badge(cx, badge_y, sno_str))
        out.append(f'<text x="{cx:.2f}" y="{size_y + 1.2:.2f}" class="size-lbl" text-anchor="middle" transform="rotate(-90 {cx:.2f} {size_y:.2f})">{xml_escape(size_str)}</text>')
        
        if f_names and f_names[0]:
            span_len = brand_span[1] - brand_span[0]
            brand_cy = (brand_span[0] + brand_span[1]) / 2
            
            if len(f_names) == 1:
                # 1 name
                f_sz = fit_size(f_names[0], span_len, max_size=4.4, min_size=2.4)
                shown = fit_text(f_names[0], span_len, f_sz)
                out.append(f'<text x="{cx:.2f}" y="{brand_cy + f_sz*0.35:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle" transform="rotate(-90 {cx:.2f} {brand_cy:.2f})">{xml_escape(shown)}</text>')
            else:
                # 2 names side-by-side in vertical stall!
                f_sz = min(fit_size(n, span_len, max_size=3.6, min_size=2.0) for n in f_names)
                n0, n1 = (fit_text(n, span_len, f_sz) for n in f_names)

                # Offset: lx1 and lx2 within stall width (w = 16.92)
                offset = min(3.0, w * 0.18)
                lx1 = cx - offset
                lx2 = cx + offset
                out.append(f'<text x="{lx1:.2f}" y="{brand_cy + f_sz*0.35:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle" transform="rotate(-90 {lx1:.2f} {brand_cy:.2f})">{xml_escape(n0)}</text>')
                out.append(f'<text x="{lx2:.2f}" y="{brand_cy + f_sz*0.35:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle" transform="rotate(-90 {lx2:.2f} {brand_cy:.2f})">{xml_escape(n1)}</text>')
        else:
            brand_cy = (brand_span[0] + brand_span[1]) / 2
            out.append(f'<text x="{cx:.2f}" y="{brand_cy + 1.0:.2f}" class="vacant-lbl" text-anchor="middle" transform="rotate(-90 {cx:.2f} {brand_cy:.2f})">(Vacant)</text>')
        continue

    # -------------------------------------------------------------------------
    # Horizontal interior stalls
    # -------------------------------------------------------------------------
    badges.append(draw_badge(s["x"] + 6.0, s["y"] + 3.8, sno_str, is_small=True))
    out.append(f'<text x="{s["x"] + w - 1.5:.2f}" y="{s["y"] + 4.2:.2f}" class="size-lbl" text-anchor="end">{xml_escape(size_str)}</text>')
    if f_names and f_names[0]:
        avail = w * 0.94
        if len(f_names) == 1:
            f_sz = fit_size(f_names[0], avail, max_size=3.6, min_size=2.2)
            shown = fit_text(f_names[0], avail, f_sz)
            out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.5:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(shown)}</text>')
        else:
            f_sz = min(fit_size(n, avail, max_size=3.0, min_size=1.9) for n in f_names)
            n0, n1 = (fit_text(n, avail, f_sz) for n in f_names)
            out.append(f'<text x="{cx:.2f}" y="{s["y"] + 9.5:.2f}" font-size="{f_sz:.1f}" class="brand-lbl" text-anchor="middle">{xml_escape(n0)}</text>')
            out.append(f'<text x="{cx:.2f}" y="{s["y"] + 13.5:.2f}" font-size="{f_sz:.1f}" class="brand-lbl-2" text-anchor="middle">{xml_escape(n1)}</text>')
    else:
        out.append(f'<text x="{cx:.2f}" y="{s["y"] + 11.2:.2f}" class="vacant-lbl" text-anchor="middle">(Vacant)</text>')

# Draw the hall-feature labels (electrical/wash-room/fire-exit/etc.) and the
# stall-number badges last, on top of every rect, so nothing drawn after them
# in the sheet's own cell order can paint over their text.
out.append('<g id="hall-feat-labels">')
out.extend(feature_labels)
out.append('</g>')

out.append('<g id="stall-badges">')
out.extend(badges)
out.append('</g>')

out.append('</svg>')

svg_content = "\n".join(out) + "\n"

# Save SVG
out_svg_path = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"
out_svg_path.write_text(svg_content, encoding="utf-8")
print(f"Updated SVG written to {out_svg_path}")

# Write HTML wrapper for Chrome headless rendering
html_wrapper = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {{ box-sizing: border-box; }}
    body, html {{
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      background-color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }}
    svg {{
      width: 100%;
      height: 100%;
      display: block;
    }}
  </style>
</head>
<body>
{svg_content}
</body>
</html>
"""

tmp_dir = tempfile.gettempdir()
tmp_html = Path(tmp_dir) / "ste_layout_render.html"
tmp_png = Path(tmp_dir) / "ste_layout_render.png"
tmp_html.write_text(html_wrapper, encoding="utf-8")

if tmp_png.exists():
    tmp_png.unlink()

chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
print("Rendering ultra high-resolution PNG via Chrome (3488 x 2460)...")

cmd = [
    chrome_exe,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=3488,2460",
    f"--screenshot={str(tmp_png)}",
    f"file:///{str(tmp_html).replace(os.sep, '/')}"
]

res = subprocess.run(cmd, capture_output=True, text=True)
if tmp_png.exists():
    dest_png1 = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.png"
    dest_png2 = ROOT / "Final-Layout-STE-2026.png"
    dest_png3 = ROOT / "Final-Layout-STE-2026-with-names.png"
    shutil.copy(tmp_png, dest_png1)
    shutil.copy(tmp_png, dest_png2)
    shutil.copy(tmp_png, dest_png3)
    print("SUCCESS: High-resolution PNG generated with official fascia names:")
    print(f"  1. {dest_png1} ({dest_png1.stat().st_size:,} bytes)")
    print(f"  2. {dest_png2} ({dest_png2.stat().st_size:,} bytes)")
    print(f"  3. {dest_png3} ({dest_png3.stat().st_size:,} bytes)")
else:
    print("Error during screenshot:", res.stderr)
