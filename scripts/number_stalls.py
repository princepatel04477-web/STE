#!/usr/bin/env python3
"""
STE 2026 - stall numbering generator.

Reads the approved floor plan (Final-Layout-STE-2026.svg), reconstructs the
underlying cell grid from the drawing's fills and border lines, recovers every
stall as an exact rectangle, then assigns stall numbers 1..153.

The floor is walked once, west to east:
  1. North wall strip   - the 6M x 3M run along the top wall, west -> east.
  2. North hall columns - columns west -> east; inside a column, from the
     central cross-aisle end back toward the north wall.
  3. South hall columns - columns west -> east; inside a column, from the
     central cross-aisle end back toward the south wall.

Numbers are then handed out saree frontage first, so it holds one unbroken run
(1-29: the north wall strip, then the eight big perimeter blocks), with the
rest of the floor following from 30 in the same walk order.

Each stall also carries the draw pool it belongs to. The saree pool is
stalls 1-108 less 27, 28 and 29 - 105 stalls, sized to the saree list exactly.
Those three are the big perimeter blocks kept back for K.K. Garments, Geeta Tex
and Mohilya, who booked those sizes but are not saree brands.

Outputs:
  src/data/stallMap2026.ts                         - typed master stall list
  public/assets/Final-Layout-STE-2026-numbered.svg - the plan with numbers on it

Run:  python scripts/number_stalls.py
"""
from __future__ import annotations

import re
from bisect import bisect_right
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_SVG = ROOT / "Final-Layout-STE-2026.svg"
OUT_TS = ROOT / "src" / "data" / "stallMap2026.ts"
OUT_SVG = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"
SHEET = ROOT / "STE_data_sheet.xlsx"
OUT_ALLOT = ROOT / "src" / "data" / "stallAllotment2026.ts"

# The drawing is a PDF export at 0.75 scale; 1 metre = 5.638 user units.
PDF_SCALE = 0.75
UNITS_PER_M = 5.638
# Top edge of the central 6M cross-aisle: the north/south hall divider.
CROSS_AISLE_Y = 317.4
# Stalls above this y are the north wall strip, not a hall column.
NORTH_STRIP_Y = 70.0

# Fill colour -> stall size, straight off the drawing's own legend.
SIZE_BY_COLOUR = {
    "#eaf1dd": (6, 42),   # 42M x 6M
    "#fcd5b4": (6, 30),   # 30M x 6M
    "#c5d9f1": (3, 36),   # 36M x 3M
    "#e6b9b8": (3, 30),   # 30M x 3M
    "#ffff99": (3, 24),   # 24M x 3M
    "#66ffff": (3, 18),   # 18M x 3M
    "#00ff99": (3, 12),   # 12M x 3M
    "#b2a1c7": (3, 9),    # 9M x 3M
    "#ff99ff": None,      # 6M x 3M - runs both ways, so accept either
    "#ff3399": (3, 3),    # 3M x 3M
    # The south-west 18M x 3M below the food court. It is drawn in the legend's
    # cyan rather than the hall cyan, and the legend's own tally of 25 leaves it
    # out, but the source workbook carries it as a stall cell like any other
    # (sheet "STE - Proposed Layout", r84 c28), so it is counted here.
    "#00ffff": (18, 3),
}
LEGEND_SWATCH_M = (11, 3)  # the colour keys in the legend box, not stalls

# The saree frontage: the big perimeter runs plus the north wall strip. These
# take the opening block of numbers so the section reads as one run on signage.
SAREE_SIZES = {"30M x 3M", "36M x 3M"}

# The saree pool runs from stall 1 up to a boundary sized to the saree list
# itself (see size_pool_and_splits), less these three big perimeter blocks,
# which are kept back for the non-saree brands that booked those sizes.
SAREE_POOL_EXCLUDES = {27, 28, 29}

# Who counts as saree: sarees, lehengas, and the uniform-saree firms. Run
# against the sheet's own Category column, this reproduces the agreed list
# exactly.
SAREE_CATEGORY = re.compile(r"sare+|leh[ae]ng", re.I)

# Trade groups. The sheet writes a category 35 different ways - "Kurties",
# "Kurtis", "Kurti / Suits" - so each row is folded into one of these, first
# match winning. A brand selling sarees and lehengas is a saree brand, which is
# why saree is tested before lehenga.
#
# The floor is then laid out group by group in this order, so neighbours are
# always in the same trade: no kurti stall backing onto menswear.
TRADE_GROUPS = [
    ("Saree", re.compile(r"sare+", re.I)),
    ("Lehenga", re.compile(r"leh[ae]ng", re.I)),
    ("Blouses", re.compile(r"blouse", re.I)),
    ("Kurti", re.compile(r"kurt", re.I)),
    ("Suits", re.compile(r"suit", re.I)),
    ("Dress Material & Fabrics", re.compile(r"fabric|dress mat+erial|lace", re.I)),
    ("Kids Wear", re.compile(r"kids", re.I)),
    ("Men's Wear", re.compile(r"men", re.I)),
    ("Ethnic & Poshak", re.compile(r"poshak|ethnic", re.I)),
    ("Home & Other", re.compile(r".", re.I)),
]


def trade_group(category):
    for name, rule in TRADE_GROUPS:
        if rule.search(str(category or "")):
            return name
    return "Home & Other"

# The sheet still writes the two 6M-wide blocks the old way in places.
SHEET_SIZE_ALIASES = {"3m x 60m": "30m x 6m", "3m x 78m": "42m x 6m"}

# Hand-allotted before the draw - these three do not go into the lucky draw.
# Each is the only stall on the floor of the size that exhibitor booked.
# Brands seated by hand before the draw runs, so their stall number is fixed
# rather than drawn. Keyed by the sheet's own spelling of the brand, which is
# how allot() looks them up, and the stall has to be the size they booked.
#
# 43 and 46 are an exchange the organisers asked for on 29 Aug 2026: Earth
# Fabrics take the 43 they are already allotted and Bahubali take the 46 Earth
# Fabrics had drawn. Both are 3m x 18m, 600 sqft in the north hall saree band,
# so neither firm changes size, and both are listed here so a rerun seats them
# again instead of drawing either number afresh.
RESERVED = {
    27: "K.K. Garments",                      # 36M x 3M
    39: "SARAOGI SUPER SALES PRIVATE LIMITED",  # 42M x 6M, the largest stall
    40: "Murtidhara Sarees / Shyamraj",       # 30M x 6M
    43: "Earth Fabrics",                      # 18M x 3M, swapped with 46
    46: "Bahubali",                           # 18M x 3M, swapped with 43
}

# Firms that have pulled out since the floor was drawn, against the unit they
# were holding. Keyed by the sheet's own spelling, the way RESERVED is.
#
# Both the firm and its unit come out of the draw together, and that pairing is
# the point: the draw hands a band's free units to that band's brands in order,
# so dropping the firm alone would pull every brand behind it one stall
# forward, off the number already on their slip. Dropping the unit with them
# keeps the two lists in step and leaves the stall standing empty.
#
# The saree pool is still sized against the full sheet list, withdrawals
# included, so the pool end and the split bays do not move either.
#
#   Navdurga  withdrew (organisers, 31 Aug 2026). Stall 61, a 3m x 18m,
#             600 sqft bay in the north hall saree band, goes back empty.
WITHDRAWN = {
    "Navdurga": "61",                         # 18M x 3M
}

# Brands the organisers spell differently from the sheet, keyed by the sheet's
# own spelling. The name here is what the floor plan, the allotment slip and
# the fascia are printed from, so it has to be the firm's own.
#
#   Aalingan Art  the second name is Nidhanam, and the firm writes the pair
#                 with a slash rather than in brackets (organisers,
#                 29 Aug 2026).
#   Jyotsana      spells itself Jyotsna (organisers, 28 Aug 2026).
#   Vani NX       the firm's own fascia reads Vaani (organisers, 28 Aug 2026).
#
# The corrected name is what allot() then keys RESERVED on, so a brand listed
# in both maps wants its corrected spelling there. None is, today.
BRAND_CORRECTIONS = {
    "Aalingan Art (Nidhidham)": "Aalingan Art / Nidhanam",
    "Jyotsana": "Jyotsna",
    "Vani NX": "Vaani NX",
}

# Numbers the organisers have corrected since the sheet was filed, keyed by the
# sheet's own spelling of the brand. The sheet is the exhibitor list, not the
# contact book, and a number that has been given up is worse than none: it can
# be reassigned to a stranger who would then answer for the firm.
#
#   Apple lifestyle  gave up 9099140404 and answer on 9825398582 (organisers,
#                    29 Aug 2026). The old number is retired, not aliased.
#   Saraogi          the sheet leaves their number blank; they answer on
#                    9810550285 (organisers, 29 Aug 2026). Worth carrying
#                    because 39 is held, and a held stall is looked up by
#                    mobile before brand name.
#
# Keep registeredExhibitors.ts in step - that is the list the portal actually
# lets people in on.
MOBILE_CORRECTIONS = {
    "Apple lifestyle": "9825398582",
    "SARAOGI SUPER SALES PRIVATE LIMITED": "9810550285",
}

# The organiser's size ladder: sqm -> (sqft, dimension, aliases).
#
# The dimension is how the stall is actually laid out on the floor, and it is
# what the join to STE_data_sheet.xlsx keys on. The two 6M-wide blocks are the
# exception: the sheet folds them out into a single 3m-wide run ("3m x 60m",
# "3m x 78m") even though the drawing builds them two bays deep, so their
# sheet wording is carried as an alias and both spellings still match.
SHEET_SIZE_BY_SQM = {
    9: (100, "3m x 3m", ()),
    18: (200, "3m x 6m", ()),
    27: (300, "3m x 9m", ()),
    36: (400, "3m x 12m", ()),
    54: (600, "3m x 18m", ()),
    72: (800, "3m x 24m", ()),
    90: (1000, "3m x 30m", ()),
    108: (1200, "3m x 36m", ()),
    180: (2000, "30m x 6m", ("3m x 60m",)),
    252: (2600, "42m x 6m", ("3m x 78m",)),
}

RECT_RE = re.compile(r"M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)V(-?[\d.]+)H(-?[\d.]+)Z")
PATH_RE = re.compile(r"<path([^>]*)/>")
TEXT_RE = re.compile(r"<text([^>]*)>(.*?)</text>", re.S)
TSPAN_RE = re.compile(r'<tspan y="([-\d.]+)" x="([^"]*)"[^>]*>(.*?)</tspan>', re.S)


# --------------------------------------------------------------------------
# 1. Read the drawing
# --------------------------------------------------------------------------
def read_shapes(body):
    """Split every rectangle in the drawing into colour fills and border lines.

    Border lines carry no fill attribute, so they render black by default -
    that is what marks one stall off from the next."""
    fills, walls = [], []
    for m in PATH_RE.finditer(body):
        attrs = m.group(1)
        d = re.search(r'd="([^"]*)"', attrs)
        if not d:
            continue
        colour_attr = re.search(r'fill="(#[0-9a-fA-F]{6})"', attrs)
        colour = colour_attr.group(1) if colour_attr else "#000000"
        for r in RECT_RE.finditer(d.group(1)):
            x1, y1, x2, y2, _ = (float(v) for v in r.groups())
            box = (
                colour,
                min(x1, x2) * PDF_SCALE, min(y1, y2) * PDF_SCALE,
                max(x1, x2) * PDF_SCALE, max(y1, y2) * PDF_SCALE,
            )
            (walls if colour == "#000000" else fills).append(box)
    return fills, walls


def snap(values, tol=0.2):
    out = []
    for v in sorted(values):
        if not out or v - out[-1] > tol:
            out.append(v)
    return out


def recover_stalls(fills, walls):
    """Rebuild the spreadsheet grid, then flood-fill it into stall rectangles.

    Neighbouring stalls of the same size share a fill colour, so colour alone
    would merge them; the black border cells are what keep them apart."""
    edges_x = snap([v for s in fills + walls for v in (s[1], s[3])])
    edges_y = snap([v for s in fills + walls for v in (s[2], s[4])])
    n_cols, n_rows = len(edges_x) - 1, len(edges_y) - 1

    def span(edges, lo, hi):
        return (
            max(0, bisect_right(edges, lo + 0.2) - 1),
            min(len(edges) - 2, bisect_right(edges, hi - 0.2) - 1),
        )

    grid = [[None] * n_cols for _ in range(n_rows)]
    for colour, x1, y1, x2, y2 in fills:
        if colour == "#ffffff":
            continue
        c1, c2 = span(edges_x, x1, x2)
        r1, r2 = span(edges_y, y1, y2)
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                grid[r][c] = colour
    for _, x1, y1, x2, y2 in walls:
        c1, c2 = span(edges_x, x1, x2)
        r1, r2 = span(edges_y, y1, y2)
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                grid[r][c] = "WALL"

    seen = [[False] * n_cols for _ in range(n_rows)]
    stalls = []
    for r0 in range(n_rows):
        for c0 in range(n_cols):
            colour = grid[r0][c0]
            if seen[r0][c0] or colour in (None, "WALL"):
                continue
            stack, cells = [(r0, c0)], []
            seen[r0][c0] = True
            while stack:
                r, c = stack.pop()
                cells.append((r, c))
                for dr, dc in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    nr, nc = r + dr, c + dc
                    if (0 <= nr < n_rows and 0 <= nc < n_cols
                            and not seen[nr][nc] and grid[nr][nc] == colour):
                        seen[nr][nc] = True
                        stack.append((nr, nc))
            c1, c2 = min(c for _, c in cells), max(c for _, c in cells) + 1
            r1, r2 = min(r for r, _ in cells), max(r for r, _ in cells) + 1
            x, y = edges_x[c1], edges_y[r1]
            stall = classify(colour, x, y, edges_x[c2] - x, edges_y[r2] - y)
            if stall:
                stalls.append(stall)
    return stalls


def classify(colour, x, y, w, h):
    """Keep the region only if it is a stall of a size the legend declares."""
    if colour not in SIZE_BY_COLOUR or w < 2 or h < 2:
        return None
    w_m, h_m = round(w / UNITS_PER_M), round(h / UNITS_PER_M)
    if (w_m, h_m) == LEGEND_SWATCH_M:
        return None
    expected = SIZE_BY_COLOUR[colour]
    if expected is None:                       # 6M x 3M, either orientation
        if sorted((w_m, h_m)) != [3, 6]:
            return None
    elif (w_m, h_m) != expected and (h_m, w_m) != expected:
        return None
    long_m, short_m = max(w_m, h_m), min(w_m, h_m)
    area = w_m * h_m
    sqft, sheet_size, aliases = SHEET_SIZE_BY_SQM[area]
    return {
        "x": round(x, 2), "y": round(y, 2), "w": round(w, 2), "h": round(h, 2),
        "widthM": w_m, "depthM": h_m,
        "size": "%dM x %dM" % (long_m, short_m),
        "areaSqm": area,
        "areaSqft": sqft,
        "sheetSize": sheet_size,
        "sheetAliases": list(aliases),
        "colour": colour,
    }


def read_legacy_numbers(body):
    """The handful of numbers already printed on the drawing (101, 105, 111...)."""
    found = []
    for m in TEXT_RE.finditer(body):
        tr = re.search(r'transform="matrix\(([^)]*)\)"', m.group(1))
        a, b, c, d, e, f = (float(v) for v in re.split(r"[ ,]+", tr.group(1).strip()))
        for t in TSPAN_RE.finditer(m.group(2)):
            ty = float(t.group(1))
            xs = [float(v) for v in t.group(2).split()]
            txt = t.group(3).strip()
            if not re.fullmatch(r"1\d\d", txt) or len(xs) != len(txt):
                continue
            pts = [(a * x + c * ty + e, b * x + d * ty + f) for x in xs]
            cx = (min(p[0] for p in pts) + max(p[0] for p in pts)) / 2
            cy = (min(p[1] for p in pts) + max(p[1] for p in pts)) / 2
            found.append((txt, cx, cy))
    return found


# --------------------------------------------------------------------------
# 2. Assign the numbers
# --------------------------------------------------------------------------
def assign_numbers(stalls):
    strip = sorted((s for s in stalls if s["y"] < NORTH_STRIP_Y),
                   key=lambda s: s["x"])
    north = [s for s in stalls if NORTH_STRIP_Y <= s["y"] < CROSS_AISLE_Y]
    south = [s for s in stalls if s["y"] >= CROSS_AISLE_Y]

    def by_column(group, from_cross_aisle_upward):
        """Columns west to east; inside a column, start at the cross-aisle end."""
        columns = defaultdict(list)
        for s in group:
            columns[round(s["x"], 1)].append(s)
        ordered = []
        for x in sorted(columns):
            ordered.extend(sorted(
                columns[x],
                key=lambda s: -s["y"] if from_cross_aisle_upward else s["y"]))
        return ordered

    walk = (
        [("North Wall Strip", s) for s in strip]
        + [("North Hall", s) for s in by_column(north, True)]
        + [("South Hall", s) for s in by_column(south, False)]
    )
    for zone, s in walk:
        s["zone"] = zone
        # Frontage flag, used only to decide who gets the opening numbers.
        s["frontage"] = (
            zone == "North Wall Strip" or s["size"] in SAREE_SIZES
        )
        # The end the number is printed at - the stall's frontage on the aisle.
        s["frontEnd"] = "centre" if zone == "North Wall Strip" else (
            "south" if zone == "North Hall" else "north")

    # The saree frontage takes the opening block of numbers so it reads as one
    # run on signage; the rest of the floor follows in the same walk order.
    ordered = ([s for _, s in walk if s["frontage"]]
               + [s for _, s in walk if not s["frontage"]])
    for i, s in enumerate(ordered, start=1):
        s["stallNumber"] = i
        if i in RESERVED:
            s["reservedFor"] = RESERVED[i]
        del s["frontage"]
    return ordered


def attach_legacy(stalls, legacy):
    for label, cx, cy in legacy:
        for s in stalls:
            if s["x"] <= cx <= s["x"] + s["w"] and s["y"] <= cy <= s["y"] + s["h"]:
                s["legacyNumber"] = label
                break


def split_halves(stalls, bay_numbers):
    """Cut the named 200 sqft bays into two 100 sqft modules, 4A and 4B.

    Only the bays the saree pool actually needs are cut; every other bay keeps
    its plain number and is let whole.

    A is always the half at the bay's frontage: the west half of a bay that runs
    along the north wall, otherwise the half facing the central cross-aisle."""
    for s in stalls:
        if s["stallNumber"] not in bay_numbers:
            continue
        n = s["stallNumber"]
        if s["widthM"] > s["depthM"]:                 # runs east-west
            half = s["w"] / 2
            boxes = [(s["x"], s["y"], half, s["h"]),
                     (s["x"] + half, s["y"], half, s["h"])]
        else:                                          # runs north-south
            half = s["h"] / 2
            boxes = [(s["x"], s["y"], s["w"], half),
                     (s["x"], s["y"] + half, s["w"], half)]
            if s["frontEnd"] == "south":               # frontage is the far end
                boxes.reverse()
        s["halves"] = [
            {"id": "%d%s" % (n, letter), "x": round(x, 2), "y": round(y, 2),
             "w": round(w, 2), "h": round(h, 2)}
            for letter, (x, y, w, h) in zip("AB", boxes)
        ]


# --------------------------------------------------------------------------
# 3. Pools and allotment
# --------------------------------------------------------------------------
def read_exhibitors():
    """The exhibitor list, straight out of STE_data_sheet.xlsx."""
    import openpyxl
    ws = openpyxl.load_workbook(SHEET, data_only=True)["Ste-final-list"]
    out = []
    for brand, category, sqft, dims, mobile in ws.iter_rows(min_row=2,
                                                            values_only=True):
        if not brand:
            continue
        size = str(dims).strip().lower()
        # The sheet's spelling is the key both correction maps are written
        # against; the corrected one is what everything downstream reads.
        sheet_brand = re.sub(r"\s+", " ", str(brand)).strip()
        brand_name = BRAND_CORRECTIONS.get(sheet_brand, sheet_brand)
        out.append({
            "brand": brand_name,
            "category": str(category or "").strip(),
            "sheetSize": SHEET_SIZE_ALIASES.get(size, size),
            "areaSqft": int(sqft),
            "mobile": MOBILE_CORRECTIONS.get(sheet_brand, normalise_mobile(mobile)),
            "isSaree": bool(SAREE_CATEGORY.search(str(category or ""))),
            "group": trade_group(category),
        })
    return out


def normalise_mobile(raw):
    """The exhibitor's own 10-digit mobile, or "" if the cell does not hold one.

    A cell carrying two numbers is read as the first of them, so a partner's
    number is ignored. Only when there is no unbroken run does the whole cell
    get read as one number: the sheet groups a good half of its numbers for
    legibility - "98209-35033", "94292 22300" - and reading a run at a time
    dropped every one of them, which left 46 exhibitors on the floor plan with
    no number to be found by.

    Anything that is not ten digits after the country code is dropped rather
    than trimmed to fit. "98988666093" is a mistyped number, not a prefixed
    one, and there is no way to tell which digit is the spare - guessing would
    file a firm under a mobile that is not theirs.
    """
    if raw is None:
        return ""
    if isinstance(raw, float) and raw.is_integer():
        raw = int(raw)
    for run in re.findall(r"\d+", str(raw)):
        if len(run) == 12 and run.startswith("91"):
            run = run[2:]
        if len(run) == 10:
            return run
    digits = re.sub(r"\D", "", str(raw))
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""


def size_pool_and_splits(stalls, saree):
    """Find the smallest opening block that holds the saree list, and the fewest
    bays that have to be cut in half to do it.

    The block has to run past number 91 no matter what, because the floor holds
    no 3M x 3M stall below 92 and the saree list needs seventeen of them."""
    want = Counter(e["sheetSize"] for e in saree)
    for end in range(1, len(stalls) + 1):
        pool = [s for s in stalls
                if s["stallNumber"] <= end
                and s["stallNumber"] not in SAREE_POOL_EXCLUDES]
        have = Counter(s["sheetSize"] for s in pool)
        if any(have.get(k, 0) < want[k] for k in want
               if k not in ("3m x 3m", "3m x 6m")):
            continue
        bays = [s for s in pool if s["sheetSize"] == "3m x 6m"]
        whole_small = have.get("3m x 3m", 0)
        short = max(0, want["3m x 3m"] - whole_small)
        to_split = -(-short // 2)                      # two modules per bay
        if len(bays) - to_split < want["3m x 6m"]:
            continue
        # Cut the last bays in the run, so the small modules sit together at the
        # far end of the pool rather than breaking up the main aisles.
        split = sorted(b["stallNumber"] for b in bays)[-to_split:] if to_split else []
        return end, set(split)
    raise SystemExit("the saree list does not fit anywhere on this floor")


def build_units(stalls, split_bays):
    """Every lettable unit: a split bay contributes its two 100 sqft halves."""
    units = []
    for s in stalls:
        if s["stallNumber"] in split_bays:
            for h in s["halves"]:
                units.append({"unitId": h["id"], "stall": s,
                              "sheetSize": "3m x 3m", "areaSqft": 100})
        else:
            units.append({"unitId": str(s["stallNumber"]), "stall": s,
                          "sheetSize": s["sheetSize"], "areaSqft": s["areaSqft"]})
    units.sort(key=lambda u: (u["stall"]["stallNumber"], u["unitId"]))
    return units


def allot(stalls, exhibitors, pool_end, split_bays):
    """Give every exhibitor a stall of the size they booked, next to its trade.

    Stalls of one size sit together on this floor - the 100 sqft stalls run
    down the east wall, the 600 sqft ones fill the middle columns - so the
    clustering is done inside each size band. Within a band the stalls are
    handed out in floor order to brands sorted by trade, and the trade order is
    the same in every band. That puts all the kurti 600s side by side, all the
    menswear 600s side by side, and keeps the two apart, in every size.

    Counts match exactly per size, so nobody is left over and nobody is moved
    to a size they did not book. A withdrawn firm and the unit it held both sit
    this out, which leaves that stall empty without moving anyone else."""
    order = [name for name, _ in TRADE_GROUPS]
    units = [u for u in build_units(stalls, split_bays)
             if u["unitId"] not in set(WITHDRAWN.values())]
    exhibitors = [e for e in exhibitors if e["brand"] not in WITHDRAWN]

    def in_saree_pool(number):
        return number <= pool_end and number not in SAREE_POOL_EXCLUDES

    allotments = []
    taken_numbers, taken_brands = set(), set()
    by_brand = {e["brand"]: e for e in exhibitors}
    for number, brand in sorted(RESERVED.items()):
        ex = by_brand.get(brand)
        if not ex:
            continue
        stall = next(s for s in stalls if s["stallNumber"] == number)
        allotments.append({"unitId": str(number), "stall": stall, "ex": ex,
                           "held": True})
        taken_numbers.add(number)
        taken_brands.add(brand)

    unplaced = []
    for saree_side in (True, False):
        free = defaultdict(list)
        for u in units:
            n = u["stall"]["stallNumber"]
            if n in taken_numbers or in_saree_pool(n) is not saree_side:
                continue
            free[u["sheetSize"]].append(u)
        for lst in free.values():
            lst.sort(key=lambda u: (u["stall"]["stallNumber"], u["unitId"]))

        people = [e for e in exhibitors
                  if e["isSaree"] is saree_side and e["brand"] not in taken_brands]
        people.sort(key=lambda e: (e["sheetSize"], order.index(e["group"]),
                                   e["brand"]))
        for ex in people:
            bucket = free.get(ex["sheetSize"]) or []
            if not bucket:
                unplaced.append(ex)
                continue
            u = bucket.pop(0)
            allotments.append({"unitId": u["unitId"], "stall": u["stall"],
                               "ex": ex, "held": False})

    allotments.sort(key=lambda a: (a["stall"]["stallNumber"], a["unitId"]))
    return allotments, unplaced


def trade_runs(allotments):
    """Check the promise: inside any one size, a trade must be a single
    unbroken run of stalls. Returns a row per size with the run count against
    the number of trades in it - equal means no trade is split."""
    by_size = defaultdict(list)
    for a in sorted(allotments, key=lambda a: (a["stall"]["stallNumber"],
                                               a["unitId"])):
        by_size[a["ex"]["sheetSize"]].append(a)
    rows = []
    for size, items in by_size.items():
        runs, prev = 0, None
        for a in items:
            if a["ex"]["group"] != prev:
                runs += 1
            prev = a["ex"]["group"]
        trades = len({a["ex"]["group"] for a in items})
        rows.append((size, len(items), trades, runs))
    return sorted(rows, key=lambda r: -r[1])


# --------------------------------------------------------------------------
# 4. Write the outputs
# --------------------------------------------------------------------------
def write_numbered_svg(source, stalls):
    badges = ['<g id="stall-numbers" font-family="Arial, Helvetica, sans-serif">']

    def badge(cx, cy, label):
        bw, bh = 4.2 + 3.6 * len(label), 9.0
        badges.append(
            '<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f" rx="2"'
            ' fill="#ffffff" stroke="#c00000" stroke-width="0.7"/>'
            '<text x="%.2f" y="%.2f" font-size="6.6" font-weight="bold"'
            ' text-anchor="middle" fill="#c00000">%s</text>'
            % (cx - bw / 2, cy - bh / 2, bw, bh, cx, cy + 2.4, label)
        )

    for s in stalls:
        if "halves" in s:
            # A 200 sqft bay: label both 100 sqft modules and rule the split.
            for h in s["halves"]:
                badge(h["x"] + h["w"] / 2, h["y"] + h["h"] / 2, h["id"])
            a, b = s["halves"]
            if a["y"] == b["y"]:                    # bay runs east-west
                x = max(a["x"], b["x"])
                badges.append('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"'
                              ' stroke="#c00000" stroke-width="0.5"'
                              ' stroke-dasharray="2 1.6"/>'
                              % (x, s["y"], x, s["y"] + s["h"]))
            else:
                y = max(a["y"], b["y"])
                badges.append('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"'
                              ' stroke="#c00000" stroke-width="0.5"'
                              ' stroke-dasharray="2 1.6"/>'
                              % (s["x"], y, s["x"] + s["w"], y))
            continue
        inset = 7.5
        if s["frontEnd"] == "south":
            cy = s["y"] + s["h"] - inset
        elif s["frontEnd"] == "north":
            cy = s["y"] + inset
        else:
            cy = s["y"] + s["h"] / 2
        badge(s["x"] + s["w"] / 2, cy, str(s["stallNumber"]))
    badges.append("</g>")
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text(source.replace("</svg>", "\n".join(badges) + "\n</svg>"),
                       encoding="utf-8")


def write_typescript(stalls):
    rows = []
    for s in stalls:
        legacy = '"%s"' % s["legacyNumber"] if "legacyNumber" in s else "undefined"
        rows.append(
            "  { stallNumber: %-4s size: %-12s sheetSize: %-12s areaSqm: %-5s"
            " areaSqft: %-6s zone: %-21s widthM: %2d,"
            " depthM: %2d, x: %7.2f, y: %6.2f, w: %6.2f, h: %6.2f,"
            " legacyNumber: %s%s%s%s },"
            % ("%d," % s["stallNumber"], '"%s",' % s["size"],
               '"%s",' % s["sheetSize"], "%d," % s["areaSqm"],
               "%d," % s["areaSqft"], '"%s",' % s["zone"],
               s["widthM"], s["depthM"],
               s["x"], s["y"], s["w"], s["h"], legacy,
               (", sheetAliases: [%s]"
                % ", ".join('"%s"' % a for a in s["sheetAliases"]))
               if s["sheetAliases"] else "",
               ', reservedFor: "%s"' % s["reservedFor"]
               if "reservedFor" in s else "",
               (", halves: [%s]" % ", ".join(
                   '{ id: "%s", x: %.2f, y: %.2f, w: %.2f, h: %.2f }'
                   % (h["id"], h["x"], h["y"], h["w"], h["h"])
                   for h in s["halves"]))
               if "halves" in s else "")
        )
    totals = Counter(s["size"] for s in stalls)
    ordered_totals = sorted(totals.items(), key=lambda kv: -kv[1])
    breakdown = "\n".join(" *   %-10s %3d" % (k, v) for k, v in ordered_totals)
    counts = "\n".join('  "%s": %d,' % (k, v) for k, v in ordered_totals)
    nl = "\n"
    OUT_TS.write_text(
        "/**\n"
        " * STE 2026 master stall map - generated from Final-Layout-STE-2026.svg.\n"
        " *\n"
        " * Do not hand-edit. Regenerate with:  python scripts/number_stalls.py\n"
        " *\n"
        " * %d stalls, %d sqm:\n%s\n"
        " *\n"
        " * x/y/w/h are the stall's rectangle in the floor-plan SVG's own\n"
        " * coordinate space (1 metre = %s units), so they can be used to draw\n"
        " * or hit-test the plan directly.\n"
        " */\n\n"
        'export type StallZone = "North Wall Strip" | "North Hall" | "South Hall";\n\n'
        "/** One 100 sqft module of a 200 sqft bay that was split. */\n"
        "export interface StallHalf {\n"
        "  /** The bay number with an A or B suffix, e.g. \"91A\". */\n"
        "  id: string;\n"
        "  x: number;\n"
        "  y: number;\n"
        "  w: number;\n"
        "  h: number;\n"
        "}\n\n"
        "export interface Stall2026 {\n"
        "  /** 1..%d, walked west to east: north wall strip, north hall, south hall. */\n"
        "  stallNumber: number;\n"
        "  /** As written on the floor plan, e.g. \"18M x 3M\". */\n"
        "  size: string;\n"
        "  /** The stall's real floor dimension, e.g. \"3m x 18m\" - join on this. */\n"
        "  sheetSize: string;\n"
        "  /** Other spellings the exhibitor sheet uses for this same size. */\n"
        "  sheetAliases?: string[];\n"
        "  areaSqm: number;\n"
        "  /** The organiser's own sqft figure for this size. */\n"
        "  areaSqft: number;\n"
        "  zone: StallZone;\n"
        "  widthM: number;\n"
        "  depthM: number;\n"
        "  x: number;\n"
        "  y: number;\n"
        "  w: number;\n"
        "  h: number;\n"
        "  /** Number printed on the original drawing, where one was. */\n"
        "  legacyNumber?: string;\n"
        "  /** Hand-allotted before the draw - excluded from the lucky draw. */\n"
        "  reservedFor?: string;\n"
        "  /** Set only on the bays the saree pool needed split, e.g. 91A / 91B. */\n"
        "  halves?: StallHalf[];\n"
        "}\n\n"
        "export const STALL_MAP_2026: Stall2026[] = [\n%s\n];\n\n"
        "export const TOTAL_STALLS_2026 = STALL_MAP_2026.length;\n\n"
        "export const STALL_COUNT_BY_SIZE: Record<string, number> = {\n%s\n};\n\n"
        "export function getStall(stallNumber: number): Stall2026 | undefined {\n"
        "  return STALL_MAP_2026.find((s) => s.stallNumber === stallNumber);\n"
        "}\n\n"
        "export function getStallsBySize(size: string): Stall2026[] {\n"
        "  return STALL_MAP_2026.filter((s) => s.size === size);\n"
        "}\n\n"
        "/**\n"
        " * Every lettable 100 sqft module on the floor: a 200 sqft bay counts as\n"
        " * its two halves, everything else as itself. A 200 sqft exhibitor takes\n"
        " * both halves of one bay.\n"
        " */\n"
        "export const STALL_UNITS_2026: {\n"
        "  id: string;\n"
        "  stallNumber: number;\n"
        "  areaSqft: number;\n"
        "}[] = STALL_MAP_2026.flatMap((s) =>\n"
        "  s.halves\n"
        "    ? s.halves.map((h) => ({\n"
        "        id: h.id,\n"
        "        stallNumber: s.stallNumber,\n"
        "        areaSqft: 100,\n"
        "      }))\n"
        "    : [{ id: String(s.stallNumber), stallNumber: s.stallNumber,\n"
        "         areaSqft: s.areaSqft }]\n"
        ");\n\n"
        "/** The two halves of a 200 sqft bay, or [] for any other stall. */\n"
        "export function getHalves(stallNumber: number): StallHalf[] {\n"
        "  return getStall(stallNumber)?.halves ?? [];\n"
        "}\n\n"
        "/** Hand-allotted before the draw. */\n"
        "export const RESERVED_STALLS_2026: Stall2026[] =\n"
        "  STALL_MAP_2026.filter((s) => s.reservedFor);\n\n"
        "/** The stalls the lucky draw may allot. */\n"
        "export const DRAWABLE_STALLS_2026: Stall2026[] =\n"
        "  STALL_MAP_2026.filter((s) => !s.reservedFor);\n\n"
        "/**\n"
        " * Stalls matching a size as the exhibitor sheet writes it, e.g. \"3m x 18m\".\n"
        " * Accepts the sheet's older spellings too, so \"3m x 60m\" still finds the\n"
        " * 30m x 6m block and \"3m x 78m\" the 42m x 6m one.\n"
        " */\n"
        "export function getStallsBySheetSize(sheetSize: string): Stall2026[] {\n"
        "  const wanted = sheetSize.trim().toLowerCase();\n"
        "  return STALL_MAP_2026.filter(\n"
        "    (s) => s.sheetSize === wanted || s.sheetAliases?.includes(wanted)\n"
        "  );\n"
        "}\n"
        % (len(stalls), sum(s["areaSqm"] for s in stalls), breakdown,
           UNITS_PER_M, len(stalls), nl.join(rows), counts),
        encoding="utf-8")


def write_allotment(allotments, pool_end, split_bays, exhibitors):
    rows = []
    for a in allotments:
        ex, s = a["ex"], a["stall"]
        rows.append(
            "  { unitId: %-8s stallNumber: %-5s brand: %s, category: %s,\n"
            "    group: %-28s mobile: %-14s sheetSize: %-12s areaSqft: %-6s"
            " pool: %-11s zone: %-21s held: %s },"
            % ('"%s",' % a["unitId"], "%d," % s["stallNumber"],
               json_str(ex["brand"]), json_str(ex["category"]),
               '"%s",' % ex["group"], '"%s",' % ex["mobile"], '"%s",' % ex["sheetSize"],
               "%d," % ex["areaSqft"],
               '"%s",' % ("Saree" if ex["isSaree"] else "General"),
               '"%s",' % s["zone"],
               "true" if a["held"] else "false")
        )
    saree_pool = sorted(s for s in range(1, pool_end + 1)
                        if s not in SAREE_POOL_EXCLUDES)
    OUT_ALLOT.write_text(
        "/**\n"
        " * STE 2026 demo allotment - generated from STE_data_sheet.xlsx and the\n"
        " * stall map. Do not hand-edit; rerun scripts/number_stalls.py.\n"
        " *\n"
        " * %d exhibitors on %d stalls. Saree brands (sarees, lehengas and the\n"
        " * uniform-saree firms) draw from stalls 1-%d less %s; everyone else\n"
        " * takes the south hall and those three big blocks.\n"
        " *\n"
        " * The draw order is seeded, so the same floor comes back every run.\n"
        " * This is a demo allotment, not a live draw result.\n"
        " */\n\n"
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
        "  /** Hand-allotted before the draw rather than drawn. */\n"
        "  held: boolean;\n"
        "}\n\n"
        "export const ALLOTMENTS_2026: Allotment2026[] = [\n%s\n];\n\n"
        "/** Stalls the saree brands drew from. */\n"
        "export const SAREE_POOL_STALLS: number[] = [%s];\n\n"
        "/** The only 200 sqft bays cut into A/B halves. */\n"
        "export const SPLIT_BAYS_2026: number[] = [%s];\n\n"
        "export function findAllotmentByMobile(mobile: string) {\n"
        "  const key = mobile.replace(/\\D/g, \"\").slice(-10);\n"
        "  return ALLOTMENTS_2026.find((a) => a.mobile === key);\n"
        "}\n\n"
        "export function findAllotmentByUnit(unitId: string) {\n"
        "  const key = unitId.trim().toUpperCase();\n"
        "  return ALLOTMENTS_2026.find((a) => a.unitId.toUpperCase() === key);\n"
        "}\n"
        % (len(allotments), len({a["stall"]["stallNumber"] for a in allotments}),
           pool_end, ", ".join(str(n) for n in sorted(SAREE_POOL_EXCLUDES)),
           "\n".join(rows),
           ", ".join(str(n) for n in saree_pool),
           ", ".join(str(n) for n in sorted(split_bays))),
        encoding="utf-8")


def json_str(value):
    return '"%s"' % str(value).replace("\\", "\\\\").replace('"', '\\"')


def main():
    source = SRC_SVG.read_text(encoding="utf-8")
    body = source[source.find("</defs>"):]
    fills, walls = read_shapes(body)
    stalls = assign_numbers(recover_stalls(fills, walls))
    attach_legacy(stalls, read_legacy_numbers(body))

    exhibitors = read_exhibitors()
    saree = [e for e in exhibitors if e["isSaree"]]
    pool_end, split_bays = size_pool_and_splits(stalls, saree)
    split_halves(stalls, split_bays)
    allotments, unplaced = allot(stalls, exhibitors, pool_end, split_bays)

    write_numbered_svg(source, stalls)
    write_typescript(stalls)
    write_allotment(allotments, pool_end, split_bays, exhibitors)

    print("%d stalls, %d sqm" % (len(stalls), sum(s["areaSqm"] for s in stalls)))
    for size, n in sorted(Counter(s["size"] for s in stalls).items(),
                          key=lambda kv: -kv[1]):
        print("  %-10s %3d" % (size, n))
    print("\n%d exhibitors: %d saree, %d general"
          % (len(exhibitors), len(saree), len(exhibitors) - len(saree)))
    print("saree pool  stalls 1-%d less %s  (%d stalls)"
          % (pool_end, sorted(SAREE_POOL_EXCLUDES),
             pool_end - len(SAREE_POOL_EXCLUDES)))
    print("bays split  %s" % (sorted(split_bays) or "none"))
    print("allotted    %d" % len(allotments))
    print("")
    print("size        brands  trades  runs")
    for size, n, trades, runs in trade_runs(allotments):
        flag = "clean" if runs == trades else "SPLIT"
        print("  %-10s %3d %6d %5d   %s" % (size, n, trades, runs, flag))
    if unplaced:
        print("UNPLACED    %d" % len(unplaced))
        for e in unplaced:
            print("   %-40s %s" % (e["brand"], e["sheetSize"]))
    for path in (OUT_TS, OUT_ALLOT, OUT_SVG):
        print("wrote %s" % path.relative_to(ROOT))


if __name__ == "__main__":
    main()
