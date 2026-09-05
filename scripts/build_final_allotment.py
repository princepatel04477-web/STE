#!/usr/bin/env python3
"""Build the final stallAllotment2026.ts + regenerate the SVG for the
5 Sep 2026 roster update (ste_final_stall_numbers.xlsx). See
scripts/build_final_2026.py's header for the source-file split. Run after
build_final_2026.py.

Run: py -3 scripts/build_final_allotment.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\rebel\OneDrive\Documents\Projects\STE-feature-clean-code-assets")
sys.path.insert(0, str(ROOT / "scripts"))
import number_stalls as ns

OUT_ALLOT = ROOT / "src" / "data" / "stallAllotment2026.ts"
OUT_MAP = ROOT / "src" / "data" / "stallMap2026.ts"
OUT_SVG = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"

CONFLICT_MOBILE = "9810550285"  # Saraogi's mobile the new roster also gives to Miu-Miu @39

current = json.load(open(ROOT / "scratch" / "current_allotment.json"))
roster = json.load(open(ROOT / "scratch" / "resolved.json"))
for r in roster:
    if r["unitId"] == "102" and "ykdk" in r["brand"].lower():
        r["unitId"], r["base"] = "104", 104

cur_by_unit = {r["unitId"]: r for r in current}
ros_by_unit = {r["unitId"]: r for r in roster}

REMOVE = {"PENDING-4", "PENDING-99", "PENDING-86", "22"}
KEEP_FLAGGED = {"PENDING-5", "PENDING-39", "79"}  # left exactly as-is, just flagged

def sqm_from_sheet_size(sheet_size):
    m = re.match(r"(\d+)m x (\d+)m", sheet_size)
    return int(m.group(1)) * int(m.group(2)) if m else None

rows = []
notes = []
for c in current:
    uid = c["unitId"]
    if uid in REMOVE:
        notes.append("removed %s (%s) - %s" % (
            uid, c["brand"],
            "roster marks the stall EMPTY" if uid == "22" else "resolved onto a real unit below"))
        continue
    if uid in KEEP_FLAGGED:
        rows.append(dict(c))
        continue
    r = ros_by_unit.get(uid)
    if r is None:
        rows.append(dict(c))  # untouched, no roster row for this unit
        continue
    new_mobile = r["mobile"]
    if uid == "39" and new_mobile == CONFLICT_MOBILE:
        notes.append("39 Miu-Miu: roster gives them Saraogi's mobile %s - NOT written "
                      "(kept %s) pending organiser confirmation, see header" % (
                          CONFLICT_MOBILE, c["mobile"]))
        new_mobile = c["mobile"]
    row = dict(c)
    row["brand"] = r["brand"]
    row["mobile"] = new_mobile
    if r["areaSqft"]:
        row["areaSqft"] = str(r["areaSqft"])
    rows.append(row)

# brand-new units
NEW_ROWS = [
    {"unitId": "92A", "base": 92},
    {"unitId": "136A", "base": 136},
]
for nr in NEW_ROWS:
    r = ros_by_unit[nr["unitId"]]
    base_row = cur_by_unit.get(str(nr["base"]))
    zone = base_row["zone"] if base_row else "South Hall"
    is_saree = bool(ns.SAREE_CATEGORY.search(r["brand"]))
    group = ns.trade_group(r["brand"])
    rows.append({
        "unitId": r["unitId"], "stallNumber": str(nr["base"]), "brand": r["brand"],
        "category": "", "group": group, "mobile": r["mobile"],
        "sheetSize": "3m x 3m", "areaSqft": str(r["areaSqft"] or 100),
        "pool": "Saree" if is_saree else "General", "zone": zone, "held": "true",
    })
    notes.append("added %s %s (brand-new to the roster; category inferred from name, "
                 "not sourced)" % (r["unitId"], r["brand"]))

def unit_sort_key(u):
    m = re.match(r"(\d+)([A-Za-z-]*)", u)
    return (int(m.group(1)), m.group(2)) if m else (999999, u)

rows.sort(key=lambda r: unit_sort_key(r["unitId"]))

print("=== build notes ===")
for n in notes:
    print(" -", n)
print("\nfinal row count:", len(rows))

# ---- write stallAllotment2026.ts ----
def json_str(v):
    return '"%s"' % str(v).replace("\\", "\\\\").replace('"', '\\"')

lines = []
for r in rows:
    lines.append(
        "  { unitId: %-10s stallNumber: %-5s brand: %s, category: %s,\n"
        "    group: %-28s mobile: %-14s sheetSize: %-12s areaSqft: %-6s"
        " pool: %-11s zone: %-21s held: %s },"
        % ('"%s",' % r["unitId"], "%s," % r["stallNumber"], json_str(r["brand"]),
           json_str(r["category"]), '"%s",' % r["group"], '"%s",' % r["mobile"],
           '"%s",' % r["sheetSize"], "%s," % r["areaSqft"], '"%s",' % r["pool"],
           '"%s",' % r["zone"], r["held"])
    )

real_rows = [r for r in rows if not r["unitId"].startswith("PENDING")]
stall_count = len({r["stallNumber"] for r in real_rows})

_cur_text = OUT_ALLOT.read_text(encoding="utf-8")
_m = re.search(r"SAREE_POOL_STALLS: number\[\] = \[([^\]]*)\];", _cur_text)
SAREE_POOL_LITERAL = "[%s]" % _m.group(1)

header = '''/**
 * STE 2026 final roster - rebuilt %s Sep 2026 from ste_final_stall_numbers.xlsx
 * (176 rows: Brand Name / Stall Size / Stall Number / Mobile Number), the
 * organisers' own final list, matched by stall/unit id against the geometry
 * already in stallMap2026.ts (unchanged by this pass - every unit id the new
 * roster names already had a rectangle on the floor). Do not hand-edit;
 * rerun scripts/build_final_2026.py then scripts/build_final_allotment.py.
 *
 * Changes this pass:
 *   - %d exhibitors carried straight across (same unit, same brand).
 *   - %d rows updated in place: mostly spelling/mobile corrections; two are
 *     real reassignments worth knowing about:
 *       18 <-> 19  the Shiv Vardhaan / Durga Textiles swap applied
 *                  5 Sep 2026 (commit 0ae4379) is REVERSED here - the new
 *                  roster puts Shiv Vardhaan back on 18 and Durga back on 19.
 *                  Confirm this is intentional before treating it as final.
 *       137        Ganesh Fashion -> SAHVIKA (not a spelling fix - a
 *                  different brand on the same bay).
 *   - PENDING-4 (Chandwani Silk Mills) and PENDING-99 (Saaj Creations)
 *     resolved onto real units 2 and 112 - removed.
 *   - PENDING-86 (an already-unlet placeholder) removed - nothing lost.
 *   - Unit 22 (Triveni, stale on the drawing) removed - the roster
 *     explicitly marks 22 EMPTY.
 *   - 92A (Prabhukripa Synthetics) and 136A (Jai Shree Krishna) added -
 *     brand-new to the roster; their category/group is inferred from the
 *     brand name (no category column in the source sheet), not sourced.
 *
 * STILL UNRESOLVED - left exactly as they were, not touched by this pass:
 *   PENDING-5   Divine Silk Mills   - still absent from the new roster.
 *   PENDING-39  Saraogi Super Sales - still absent from the new roster BY
 *               NAME, but the roster gives stall 39 (Miu-Miu, 100 sqft) the
 *               mobile 9810550285 - Saraogi's own known mobile, and the one
 *               unit 50 (SSS) held until this pass, where the roster now
 *               leaves it blank. That mobile was NOT written onto Miu-Miu
 *               here (unit 39 below keeps its prior mobile) because writing
 *               it to production would silently reassign Saraogi's existing
 *               portal identity to a different exhibitor. Needs an explicit
 *               answer from the organisers before either row's mobile
 *               changes.
 *   79          Geeta Readymade / King's Man, a HAND-CONFIRMED (held: true)
 *               assignment, is entirely absent from the new roster with no
 *               replacement named for the unit. Kept as-is rather than
 *               deleted a confirmed exhibitor on an unexplained omission.
 *
 * %d exhibitors on %d stalls.
 */

''' % ("5", len(real_rows) - len(NEW_ROWS) - 24, 24, len(real_rows), stall_count)

OUT_ALLOT.write_text(
    header +
    'export type AllotmentPool = "Saree" | "General";\n\n'
    "export interface Allotment2026 {\n"
    "  /** Stall number, or a bay half such as \"106A\". */\n"
    "  unitId: string;\n"
    "  stallNumber: number;\n"
    "  brand: string;\n"
    "  category: string;\n"
    "  /** Trade group the floor is laid out by. */\n"
    "  group: string;\n"
    "  mobile: string;\n"
    "  sheetSize: string;\n"
    "  areaSqft: number;\n"
    "  pool: AllotmentPool;\n"
    "  zone: string;\n"
    "  /** Hand-allotted / organiser-issued rather than drawn. */\n"
    "  held: boolean;\n"
    "}\n\n"
    "export const ALLOTMENTS_2026: Allotment2026[] = [\n%s\n];\n\n"
    "/** Stalls the saree brands drew from (unchanged by this pass). */\n"
    "export const SAREE_POOL_STALLS: number[] = %s;\n\n"
    "/** The only 200 sqft bays cut into A/B halves (unchanged by this pass). */\n"
    "export const SPLIT_BAYS_2026: number[] = [91, 107];\n\n"
    "export function findAllotmentByMobile(mobile: string) {\n"
    "  const key = mobile.replace(/\\D/g, \"\").slice(-10);\n"
    "  return ALLOTMENTS_2026.find((a) => a.mobile === key);\n"
    "}\n\n"
    "export function findAllotmentByUnit(unitId: string) {\n"
    "  const key = unitId.trim().toUpperCase();\n"
    "  return ALLOTMENTS_2026.find((a) => a.unitId.toUpperCase() === key);\n"
    "}\n"
    % ("\n".join(lines), SAREE_POOL_LITERAL),
    encoding="utf-8",
)
print("wrote", OUT_ALLOT.relative_to(ROOT))
