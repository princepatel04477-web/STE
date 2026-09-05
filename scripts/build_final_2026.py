#!/usr/bin/env python3
"""
STE 2026 - final roster build (5 Sep 2026 update pass).

Ground truth split:
  - ste_final_stall_numbers.xlsx (176 rows: Brand/Size/Stall Number/Mobile) is
    authoritative for WHO holds WHICH stall number and their mobile - this is
    the organisers' final roster, superseding stallAllotment2026.ts entirely.
  - final_layout.xls, sheet "STE - Proposed Layout 5.9.2026", is used only for
    geometry (each stall's rectangle) and as a sanity cross-check on size.

Regenerates:
  src/data/stallMap2026.ts
  src/data/stallAllotment2026.ts
  public/assets/Final-Layout-STE-2026-numbered.svg
  public/assets/Final-Layout-STE-2026-numbered.png (best-effort, not wired to
    the live site - FloorPlan2026.tsx loads the .svg)

Run: py -3 scripts/build_final_2026.py
"""
import re
import sys
import json
from collections import Counter, defaultdict
from pathlib import Path

import xlrd
import openpyxl

ROOT = Path(r"C:\Users\rebel\OneDrive\Documents\Projects\STE-feature-clean-code-assets")
sys.path.insert(0, str(ROOT / "scripts"))
import number_stalls as ns  # reuse draw_plan / write_typescript / COLOUR_BY_SIZE / grid math

LAYOUT_XLS = ROOT / "final_layout.xls"
LAYOUT_SHEET = "STE - Proposed Layout 5.9.2026"
ROSTER_XLSX = ROOT / "ste_final_stall_numbers.xlsx"
OUT_TS = ROOT / "src" / "data" / "stallMap2026.ts"
OUT_ALLOT = ROOT / "src" / "data" / "stallAllotment2026.ts"
OUT_SVG = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"

UNITS_PER_M = ns.UNITS_PER_M
VIEW_W, VIEW_H = ns.VIEW_W, ns.VIEW_H
GRID_X, GRID_Y = ns.GRID_X, ns.GRID_Y
STRIP_END_ROW = ns.STRIP_END_ROW
CROSS_AISLE_ROW = ns.CROSS_AISLE_ROW
SHEET_SIZE_BY_SQM = ns.SHEET_SIZE_BY_SQM
COLOUR_BY_SIZE = ns.COLOUR_BY_SIZE

TRADE_GROUPS = ns.TRADE_GROUPS
trade_group = ns.trade_group
SAREE_CATEGORY = ns.SAREE_CATEGORY


def cell_text(sheet, r, c):
    v = sheet.cell_value(r, c)
    if isinstance(v, float) and v == int(v):
        v = int(v)
    return " ".join(str(v).split())


def region_text(sheet, rlo, rhi, clo, chi):
    for r in range(rlo, rhi):
        for c in range(clo, chi):
            t = cell_text(sheet, r, c)
            if t:
                return t
    return ""


def to_plan(row, col, rows, cols):
    ax, bx = GRID_X
    ay, by = GRID_Y
    return {"x": round(col * ax + bx, 2), "y": round(row * ay + by, 2),
            "w": round(cols * ax, 2), "h": round(rows * ay, 2)}


def describe(rows, cols):
    area = rows * cols
    entry = SHEET_SIZE_BY_SQM.get(area)
    if not entry:
        return None
    sqft, sheet_size, aliases = entry
    return {"widthM": cols, "depthM": rows,
            "size": "%dM x %dM" % (max(rows, cols), min(rows, cols)),
            "areaSqm": area, "areaSqft": sqft,
            "sheetSize": sheet_size, "sheetAliases": list(aliases)}


# "<num>[ ]<letter>? <brand...> [<size>]" - letter is a lone A-Z token right
# after the number, space-separated (the drawing writes "136 A Jai Shree
# Krishna", not "136A ..."); size, when present, is the trailing "NM x NM".
LABEL_RE = re.compile(
    r"^(?P<num>\d+)\s*(?:\s(?P<letter>[AB])\b)?\s+(?P<brand>.*?)"
    r"(?:\s+(?P<size>\d+\s*M\s*[xX]\s*\d+\s*M))?$"
)


def parse_layout():
    book = xlrd.open_workbook(LAYOUT_XLS, formatting_info=True)
    sheet = book.sheet_by_name(LAYOUT_SHEET)
    candidates = defaultdict(list)  # unitId -> [candidate,...]
    features = []
    for rlo, rhi, clo, chi in sheet.merged_cells:
        rows, cols = rhi - rlo, chi - clo
        label = region_text(sheet, rlo, rhi, clo, chi)
        if not label:
            continue
        m = LABEL_RE.match(label)
        if not m:
            continue
        num = m.group("num")
        letter = m.group("letter") or ""
        brand = (m.group("brand") or "").strip()
        desc = describe(rows, cols)
        if desc is None:
            # Legend swatches ("18M x 3M - 25") and anything else whose span
            # is not one of the ten real sizes.
            continue
        unit_id = num + letter
        candidates[unit_id].append({
            "row": rlo, "col": clo, "brand": brand, "rawLabel": label,
            **desc, **to_plan(rlo, clo, rows, cols),
        })
    # Real (non-stall) drawing features: hall furniture, walls, legend text -
    # anything whose label did NOT start with a bare number.
    for rlo, rhi, clo, chi in sheet.merged_cells:
        rows, cols = rhi - rlo, chi - clo
        label = region_text(sheet, rlo, rhi, clo, chi)
        if not label or LABEL_RE.match(label):
            continue
        index = book.xf_list[sheet.cell_xf_index(rlo, clo)]
        colour = book.colour_map.get(index.background.pattern_colour_index)
        features.append({"row": rlo, "col": clo, "label": label,
                         "fill": "#%02x%02x%02x" % colour if colour else None,
                         **to_plan(rlo, clo, rows, cols)})
    return candidates, features


def norm_brand(s):
    s = re.sub(r"(?i)\b(pvt\.?|private|ltd\.?|limited|llp)\b", "", s)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def best_candidate(unit_id, roster_brand, roster_sqft, candidates):
    opts = candidates.get(unit_id, [])
    if not opts:
        return None, "no geometry on drawing"
    if len(opts) == 1:
        return opts[0], None
    rb = norm_brand(roster_brand)
    scored = []
    for o in opts:
        ob = norm_brand(o["brand"])
        name_hit = ob in rb or rb in ob or (ob and ob[:6] == rb[:6])
        sqft_hit = o["areaSqft"] == roster_sqft
        scored.append((name_hit, sqft_hit, o))
    name_matches = [o for h, _, o in scored if h]
    if len(name_matches) == 1:
        return name_matches[0], None
    sqft_matches = [o for _, h, o in scored if h]
    if len(sqft_matches) == 1:
        return sqft_matches[0], "picked by sqft match only (brand text didn't match)"
    return opts[0], "AMBIGUOUS: %d drawing candidates, picked first" % len(opts)


def load_roster():
    wb = openpyxl.load_workbook(ROSTER_XLSX, data_only=True)
    ws = wb["Exhibitors"]
    rows = []
    for brand, size, num, mobile in ws.iter_rows(min_row=2, values_only=True):
        if not brand or not num:
            continue
        raw_num = re.sub(r"\s+", "", str(num).strip().upper())
        m = re.match(r"^(\d+)([A-Z]?)$", raw_num)
        if not m:
            print("  SKIP unparseable stall number %r for %r" % (num, brand))
            continue
        base, letter = m.group(1), m.group(2)
        sqft_m = re.search(r"\d+", str(size) or "")
        sqft = int(sqft_m.group()) if sqft_m else None
        mob_digits = re.sub(r"\D", "", str(mobile or ""))
        if len(mob_digits) == 12 and mob_digits.startswith("91"):
            mob_digits = mob_digits[2:]
        rows.append({
            "unitId": base + letter, "base": int(base), "letter": letter,
            "brand": str(brand).strip(), "areaSqft": sqft,
            "mobile": mob_digits if len(mob_digits) == 10 else "",
        })
    return rows


def main():
    print("Parsing layout drawing:", LAYOUT_XLS.name, "/", LAYOUT_SHEET)
    candidates, features = parse_layout()
    print("  %d distinct unit-ids with geometry, %d non-stall features"
          % (len(candidates), len(features)))

    print("Loading roster:", ROSTER_XLSX.name)
    roster = load_roster()
    print("  %d roster rows" % len(roster))

    dupes = Counter(r["unitId"] for r in roster)
    dupe_ids = {k for k, v in dupes.items() if v > 1}
    if dupe_ids:
        print("  WARNING duplicate unitIds in roster itself:", dupe_ids)

    resolved = []
    problems = []
    for r in roster:
        if r["brand"].strip().upper() == "EMPTY":
            continue  # 145A: a vacant half, not a real exhibitor
        cand, note = best_candidate(r["unitId"], r["brand"], r["areaSqft"], candidates)
        resolved.append({**r, "geom": cand})
        if note:
            problems.append((r["unitId"], r["brand"], note))
        if cand is None:
            problems.append((r["unitId"], r["brand"], "NO GEOMETRY FOUND"))

    print("\n%d real exhibitors resolved, %d flagged:" % (len(resolved), len(problems)))
    for u, b, note in problems:
        print("  %-8s %-40s %s" % (u, b, note))

    # unused drawing candidates: geometry on the drawing that no roster row claimed
    claimed = {r["unitId"] for r in roster}
    unused = {uid: opts for uid, opts in candidates.items() if uid not in claimed}
    print("\n%d drawing unit-ids with NO roster row (stale/vacant on the drawing):"
          % len(unused))
    for uid, opts in sorted(unused.items(), key=lambda kv: (len(kv[0]), kv[0])):
        for o in opts:
            print("  %-8s %-40s %s" % (uid, o["brand"], o["size"]))

    Path(ROOT / "scratch" / "resolved.json").write_text(
        json.dumps(resolved, default=str, indent=1))
    Path(ROOT / "scratch" / "problems.json").write_text(json.dumps(problems, indent=1))
    Path(ROOT / "scratch" / "unused.json").write_text(
        json.dumps({k: v for k, v in unused.items()}, indent=1))
    print("\nwrote scratch/resolved.json, scratch/problems.json, scratch/unused.json")


if __name__ == "__main__":
    main()
