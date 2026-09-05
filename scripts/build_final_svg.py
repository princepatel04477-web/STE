#!/usr/bin/env python3
"""Regenerate the numbered SVG from the (unchanged) stallMap2026.ts geometry
plus the new stallAllotment2026.ts brand names and final_layout.xls's
non-stall features (walls/aisles/legend - same drawing, geometry untouched).

Run: py -3 scripts/build_final_svg.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\rebel\OneDrive\Documents\Projects\STE-feature-clean-code-assets")
sys.path.insert(0, str(ROOT / "scripts"))
import number_stalls as ns

MAP_TS = ROOT / "src" / "data" / "stallMap2026.ts"
ALLOT_TS = ROOT / "src" / "data" / "stallAllotment2026.ts"
OUT_SVG = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"

STRIP_END_ROW = ns.STRIP_END_ROW
CROSS_AISLE_ROW = ns.CROSS_AISLE_ROW
GRID_X, GRID_Y = ns.GRID_X, ns.GRID_Y


def parse_stall_map():
    text = MAP_TS.read_text(encoding="utf-8")
    body_m = re.search(r"STALL_MAP_2026: Stall2026\[\] = \[(.*?)\n\];", text, re.S)
    body = body_m.group(1)
    # split into top-level object literals (each starts at "  { stallNumber:")
    entries = re.findall(r"\{ stallNumber:.*?\n?\s*\},?(?=\n  \{ stallNumber:|\n\];|\Z)", body, re.S)
    stalls = []
    for e in entries:
        num = int(re.search(r"stallNumber:\s*(\d+),", e).group(1))
        size = re.search(r'size:\s*"([^"]*)"', e).group(1)
        sheet_size = re.search(r'sheetSize:\s*"([^"]*)"', e).group(1)
        area_sqm = int(re.search(r"areaSqm:\s*(\d+),", e).group(1))
        area_sqft = int(re.search(r"areaSqft:\s*(\d+),", e).group(1))
        zone = re.search(r'zone:\s*"([^"]*)"', e).group(1)
        width_m = int(re.search(r"widthM:\s*(\d+),", e).group(1))
        depth_m = int(re.search(r"depthM:\s*(\d+),", e).group(1))
        x = float(re.search(r"x:\s*([\d.]+),", e).group(1))
        y = float(re.search(r"y:\s*([\d.]+),", e).group(1))
        w = float(re.search(r"w:\s*([\d.]+),", e).group(1))
        h = float(re.search(r"h:\s*([\d.]+)\s*[,}]", e).group(1))
        row = round((y - GRID_Y[1]) / GRID_Y[0])
        stall = {"stallNumber": num, "size": size, "sheetSize": sheet_size,
                 "areaSqm": area_sqm, "areaSqft": area_sqft, "zone": zone,
                 "widthM": width_m, "depthM": depth_m, "x": x, "y": y, "w": w, "h": h}
        if zone == "North Wall Strip":
            stall["frontEnd"] = "centre"
        elif zone == "North Hall":
            stall["frontEnd"] = "south"
        else:
            stall["frontEnd"] = "north"
        aliases = re.search(r"sheetAliases:\s*\[([^\]]*)\]", e)
        if aliases and aliases.group(1).strip():
            stall["sheetAliases"] = [a.strip().strip('"') for a in aliases.group(1).split(",")]
        legacy = re.search(r'legacyNumber:\s*"([^"]*)"', e)
        if legacy:
            stall["legacyNumber"] = legacy.group(1)
        reserved = re.search(r'reservedFor:\s*"([^"]*)"', e)
        if reserved:
            stall["reservedFor"] = reserved.group(1)
        halves_m = re.search(r"halves:\s*\[(.*?)\]", e, re.S)
        if halves_m:
            halves = []
            for hm in re.finditer(
                r'\{\s*id:\s*"([^"]+)"(?:,\s*size:\s*"([^"]*)")?,\s*x:\s*([\d.]+),\s*y:\s*([\d.]+),\s*w:\s*([\d.]+),\s*h:\s*([\d.]+)\s*\}',
                halves_m.group(1)):
                halves.append({"id": hm.group(1), "x": float(hm.group(3)), "y": float(hm.group(4)),
                               "w": float(hm.group(5)), "h": float(hm.group(6))})
            stall["halves"] = halves
        subs_m = re.search(r"subStalls:\s*\[(.*?)\n\s*\]", e, re.S)
        if subs_m:
            subs = []
            for sm in re.finditer(
                r'\{\s*id:\s*"([^"]+)",\s*units:\s*"([^"]*)",\s*brand:\s*"([^"]*)",\s*size:\s*"([^"]*)",'
                r'\s*x:\s*([\d.]+),\s*y:\s*([\d.]+),\s*w:\s*([\d.]+),\s*h:\s*([\d.]+)\s*\}',
                subs_m.group(1)):
                subs.append({"id": sm.group(1), "units": sm.group(2), "brand": sm.group(3),
                            "size": sm.group(4), "x": float(sm.group(5)), "y": float(sm.group(6)),
                            "w": float(sm.group(7)), "h": float(sm.group(8))})
            stall["subStalls"] = subs
        stalls.append(stall)
    return stalls


def parse_brands():
    text = ALLOT_TS.read_text(encoding="utf-8")
    return {unit: brand for unit, brand in
            re.findall(r'unitId:\s*"([^"]+)"[^\n]*?brand:\s*"([^"]*)"', text)}


stalls = parse_stall_map()
print("parsed %d stalls from stallMap2026.ts" % len(stalls))

candidates, features = json.load(open(ROOT / "scratch" / "layout_stalls.json")), None
import importlib
mod = importlib.import_module("build_final_2026")
_, features = mod.parse_layout()
print("parsed %d non-stall features from final_layout.xls" % len(features))

brands = parse_brands()
print("parsed %d brand names from stallAllotment2026.ts" % len(brands))

ns.draw_plan(stalls, features, brands)
print("wrote", OUT_SVG.relative_to(ROOT))
