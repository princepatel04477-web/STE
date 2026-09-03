#!/usr/bin/env python3
"""
STE 2026 - stall numbering generator.

Reads the approved floor plan (Final-Layout-STE-2026.xls, sheet
"STE - Proposed Layout 3.9.2026"), recovers every stall as an exact rectangle,
carries the numbers already on the exhibitors' slips across unchanged, and
numbers whatever the new plan added from 153 up.

THE DRAWING IS A SPREADSHEET
The organisers draw the floor in Excel on a grid of one cell per metre, so a
merged block of 18 rows by 3 columns labelled "18M x 3M" is a stall and its
span is its real size. That is exact to the metre, so the geometry here is
read straight off the merge list rather than traced back out of a PDF export.
GRID_X / GRID_Y put a cell back into the printed plan's own coordinate space,
so every rectangle the app already hit-tests against stays where it was.

NUMBERS DO NOT MOVE
A stall number is on a signed allotment slip, so it belongs to the exhibitor
rather than to the position. LOCKED_NUMBERS pins each number to the cell it
occupies in this layout: a stall the organisers slid up its column keeps its
number, and a number that has come off the floor is retired rather than
reissued. Only a bay no number claims takes a new one, counting on from 153 -
153 being free because 152 and 153 were thrown together under the lower
number. The walk order below is what hands new numbers out; it no longer
re-cuts the old ones.

WHAT THE 3 SEP 2026 LAYOUT CHANGED
  - The food court was shrunk. The floor it gave back holds 20 new bays in the
    south-west, numbered 153-172.
  - The north hall columns were re-stacked: 53, 56, 59, 62, 65, 68 and 71 moved
    up to the north wall and 54, 57, 60, 63, 66, 69 and 72 dropped into the
    middle, with the four 9M columns (74/75/76, 78/79/80, 83/84/85, 88/89/90)
    re-stacked the same way. Every one of them keeps its number.
  - 111 came off the floor: its 18M x 3M block is drawn parked outside the hall
    wall and its floor is now 3M x 3M bays. Nobody had drawn it, so it is
    retired and left as a gap rather than reissued.
  - 39, the 42M x 6M anchor, is now drawn cut into 15 bays carrying their own
    1-28 numbering and their brands. It stays one stall on one number: the cut
    is the holder's own sub-letting, recorded as subStalls, and it is kept out
    of the draw, the unit count and the occupancy figures.

The floor is walked once, west to east:
  1. North wall strip   - the 6M x 3M run along the top wall, west -> east.
  2. North hall columns - columns west -> east; inside a column, from the
     central cross-aisle end back toward the north wall.
  3. South hall columns - columns west -> east; inside a column, from the
     central cross-aisle end back toward the south wall.

Outputs:
  src/data/stallMap2026.ts                         - typed master stall list
  public/assets/Final-Layout-STE-2026-numbered.svg - the plan, drawn and numbered

The plan is drawn here rather than annotated onto an export, because the
layout only exists as a spreadsheet now. A stall's badge and its rectangle are
the same rectangle, so the two cannot drift apart.

The allotment (src/data/stallAllotment2026.ts) is NOT rewritten by default. It
carries live draw results and hand-seated rows, and re-running the seeded draw
over a floor that has changed shape would move brands off numbers already on
their slips. Pass --allotment to rebuild it deliberately.

Run:  python scripts/number_stalls.py
"""
from __future__ import annotations

import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parent.parent
SRC_XLS = ROOT / "Final-Layout-STE-2026.xls"
SRC_SHEET = "STE - Proposed Layout 3.9.2026"
OUT_TS = ROOT / "src" / "data" / "stallMap2026.ts"
OUT_SVG = ROOT / "public" / "assets" / "Final-Layout-STE-2026-numbered.svg"
SHEET = ROOT / "STE_data_sheet.xlsx"
OUT_ALLOT = ROOT / "src" / "data" / "stallAllotment2026.ts"

# The printed plan's coordinate space, kept from the PDF export the first
# numbering was cut from so the app's own overlay constants still hold:
# 1 metre = 5.638 user units in an 841.92 x 595.32 viewBox.
UNITS_PER_M = 5.638
VIEW_W, VIEW_H = 841.92007, 595.32

# One spreadsheet cell is one metre. These put a cell back on the printed
# plan - a least-squares fit of the previous layout's 152 stalls onto the
# coordinates the export gave them, good to a third of a unit (about 6cm on
# the floor), so nothing the app already draws shifts.
GRID_X = (5.63974, 18.1471)   # x = col * 5.63974 + 18.1471
GRID_Y = (5.63200, 30.6141)   # y = row * 5.63200 + 30.6141

# Where the halls start and stop, in grid rows. Between them lies the central
# 6M cross-aisle, rows 51 to 57.
STRIP_END_ROW = 9        # rows above this are the north wall strip
CROSS_AISLE_ROW = 55     # rows from here down are the south hall

# The legend box sits in the middle of the south hall and lists sizes with
# their counts, so its swatches read as stalls unless they are cut out first.
LEGEND_BOX = (60, 91, 55, 84)   # rows [60, 91), columns [55, 84)

# Blocks the organisers have dragged off the floor and left beside the
# drawing. They are not stalls any more; see RETIRED_NUMBERS.
PARKED_CELLS = {(85, 141)}      # the 18M x 3M that was 111

# Stall size -> the fill the printed plan uses for it, off the drawing's own
# legend. The workbook's palette is not the print's, so the plan is drawn from
# the size rather than from the cell's own colour.
COLOUR_BY_SIZE = {
    "42M x 6M": "#eaf1dd",
    "30M x 6M": "#fcd5b4",
    "36M x 3M": "#c5d9f1",
    "30M x 3M": "#e6b9b8",
    "24M x 3M": "#ffff99",
    "18M x 3M": "#66ffff",
    "12M x 3M": "#00ff99",
    "9M x 3M": "#b2a1c7",
    "6M x 3M": "#ff99ff",
    "3M x 3M": "#ff3399",
}

# The 42M x 6M anchor. The drawing no longer labels it with its size - it is
# covered by the 15 bays its holder has sub-let - so the block itself is named
# here, and read_layout() lifts the bays out of those cells.
ANCHOR_CELL = (9, 37, 42, 6)    # row, column, rows, columns

# --------------------------------------------------------------------------
# The numbering, pinned
# --------------------------------------------------------------------------
# Every number that is on an allotment slip, against the cell it sits on in
# THIS layout. A stall that moved is still the same stall, so it is listed at
# the cell it moved to and keeps its number; see the module docstring for what
# moved on 3 Sep 2026.
#
# Editing this table renumbers the floor, so edit it only when the organisers
# have actually re-let a bay - never to tidy up a gap.
LOCKED_NUMBERS = {
    (  3,   4):   1, (  3,  10):   2, (  3,  16):   3, (  3,  22):   4, (  3,  28):   5,
    (  3,  34):   6, (  3,  40):   7, (  3,  49):   8, (  3,  55):   9, (  3,  61):  10,
    (  3,  67):  11, (  3,  73):  12, (  3,  79):  13, (  3,  85):  14, (  3,  94):  15,
    (  3, 100):  16, (  3, 106):  17, (  3, 112):  18, (  3, 118):  19, (  3, 124):  20,
    (  3, 130):  21, ( 21,   4):  22, ( 21,  10):  23, ( 21,  13):  24, ( 21,  19):  25,
    ( 21,  22):  26, ( 15, 118):  27, ( 21, 121):  28, ( 21, 127):  29, (  9,   4):  30,
    (  9,  10):  31, (  9,  13):  32, (  9,  19):  33, (  9,  22):  34, ( 27,  28):  35,
    (  9,  28):  36, ( 27,  31):  37, (  9,  31):  38, (  9,  37):  39,
    ( 21,  46):  40, (  9,  46):  41,
    (  9,  49):  42, ( 33,  55):  43, ( 21,  55):  44, (  9,  55):  45, ( 33,  58):  46,
    ( 21,  58):  47, (  9,  58):  48, ( 33,  64):  49, ( 21,  64):  50, (  9,  64):  51,
    ( 33,  67):  52, (  9,  67):  53, ( 27,  67):  54, ( 33,  73):  55, (  9,  73):  56,
    ( 27,  73):  57, ( 33,  76):  58, (  9,  76):  59, ( 27,  76):  60, ( 33,  82):  61,
    (  9,  82):  62, ( 27,  82):  63, ( 33,  85):  64, (  9,  85):  65, ( 27,  85):  66,
    ( 33,  91):  67, (  9,  91):  68, ( 27,  91):  69, ( 33,  94):  70, (  9,  94):  71,
    ( 27,  94):  72, ( 33, 100):  73, ( 18, 100):  74, (  9, 100):  75, ( 27, 100):  76,
    ( 33, 103):  77, ( 18, 103):  78, (  9, 103):  79, ( 27, 103):  80, ( 42, 109):  81,
    ( 33, 109):  82, ( 18, 109):  83, (  9, 109):  84, ( 27, 109):  85, ( 42, 112):  86,
    ( 33, 112):  87, ( 18, 112):  88, (  9, 112):  89, ( 27, 112):  90, (  9, 118):  91,
    ( 18, 121):  92, ( 15, 121):  93, ( 12, 121):  94, (  9, 121):  95, ( 18, 127):  96,
    ( 15, 127):  97, ( 12, 127):  98, (  9, 127):  99, ( 27, 130): 100, ( 24, 130): 101,
    ( 21, 130): 102, ( 18, 130): 103, ( 15, 130): 104, ( 12, 130): 105, (  9, 130): 106,
    ( 57,  28): 107, ( 63,  28): 108, ( 69,  28): 109, ( 75,  28): 110, ( 57,  34): 112,
    ( 57,  37): 113, ( 57,  43): 114, ( 57,  98): 115, ( 75,  98): 116, ( 81,  98): 117,
    ( 57, 101): 118, ( 75, 101): 119, ( 81, 101): 120, ( 57, 107): 121, ( 75, 107): 122,
    ( 81, 107): 123, ( 87, 107): 124, ( 57, 110): 125, ( 75, 110): 126, ( 81, 110): 127,
    ( 87, 110): 128, ( 57, 116): 129, ( 69, 116): 130, ( 78, 116): 131, ( 57, 119): 132,
    ( 69, 119): 133, ( 78, 119): 134, ( 57, 125): 135, ( 69, 125): 136, ( 81, 125): 137,
    ( 87, 125): 138, ( 57, 128): 139, ( 69, 128): 140, ( 81, 128): 141, ( 87, 128): 142,
    ( 57, 134): 143, ( 60, 134): 144, ( 63, 134): 145, ( 66, 134): 146, ( 69, 134): 147,
    ( 72, 134): 148, ( 75, 134): 149, ( 78, 134): 150, ( 81, 134): 151, ( 84, 134): 152,
    ( 75,  43): 153, ( 57,  25): 157,
    ( 69,  25): 158, ( 75,  25): 159, ( 78,  25): 160, ( 81,  25): 161, ( 87,  25): 162,
    ( 81,  28): 163, ( 87,  28): 164, ( 87,  31): 165, ( 81,  34): 166, ( 87,  34): 167,
    ( 81,  37): 168, ( 87,  37): 169, ( 87,  40): 170, ( 87,  43): 172,
}

# Numbers that have come off the floor. They are never handed out again: an
# exhibitor's old number has to keep meaning nothing rather than quietly mean
# somebody else's stall.
RETIRED_NUMBERS = {
    111,   # 18M x 3M, south hall. Drawn parked outside the hall wall on the
           # 3 Sep 2026 layout and its floor cut into 3M x 3M bays. It had not
           # been drawn for, so retiring it moves nobody.
    #
    # The organisers' second pass at the 3 Sep layout took the four westernmost
    # south-hall bays back off the floor, leaving that corner to the premium
    # lounge. All four were bays the same day's first pass had added, so none
    # had ever been offered, let alone drawn for.
    154,   # 9M x 3M, was column 19
    155,   # 3M x 3M, was column 19
    156,   # 3M x 3M, was column 22
    # 171's 3M x 3M square was swallowed by the 9M x 3M bay that now runs from
    # row 75 to row 84 in column 43. That bay is numbered 153 - the number the
    # same pass freed up, and one no exhibitor had ever held.
    171,
}

# Where a bay the plan has added starts counting. 153 is free because the
# organisers threw 152 and 153 together into one 3m x 6m bay under the lower
# number (organisers, 1 Sep 2026).
FIRST_NEW_NUMBER = 153

# Numbers printed on the drawing the floor was first numbered from. They are
# carried so an exhibitor holding an old plan can still find their stall.
LEGACY_NUMBERS = {
    1: "111", 2: "112", 22: "109", 23: "108", 24: "107", 25: "106",
    26: "105", 27: "103", 28: "106", 29: "105", 39: "101", 40: "102",
}

# The whole stalls that are hand-allotted, so the plan can grey them out and
# DRAWABLE_STALLS_2026 can leave them alone. This is deliberately narrower
# than RESERVED, which allot() reads: RESERVED also seats brands on bays that
# do go into the draw (and on half of one), and marking those on the map would
# take them off the floor.
MAP_RESERVED = {
    27: "K.K. Garments",                          # 36M x 3M
    39: "SARAOGI SUPER SALES PRIVATE LIMITED",    # 42M x 6M, the largest stall
    40: "Murtidhara Sarees / Shyamraj",           # 30M x 6M
}

# The bays the saree pool needed cut in half. Locked rather than re-derived:
# the halves are on slips as 91A / 91B and 107A / 107B, and re-sizing the pool
# against a floor that has changed shape could cut a different pair.
LOCKED_SPLIT_BAYS = [91, 107]

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
# rather than drawn. Values are the sheet's own spelling of the brand, which is
# how allot() looks them up, and the unit has to be the size they booked.
#
# Keyed by unit id rather than stall number, so a half of a split bay can be
# let on its own: "107B" reserves that half and leaves 107A in the draw, where
# a bare 107 would have taken the whole bay off the floor. A unit id that is
# not on the floor stops the run rather than quietly seating nobody.
#
# 43 and 46 are an exchange the organisers asked for on 29 Aug 2026: Earth
# Fabrics take the 43 they are already allotted and Bahubali take the 46 Earth
# Fabrics had drawn. Both are 3m x 18m, 600 sqft in the north hall saree band,
# so neither firm changes size, and both are listed here so a rerun seats them
# again instead of drawing either number afresh.
#
# 100 is neither a swap nor a size the draw could have handled: Anaya Designer
# are not on the sheet at all (see LATE_ENTRANTS), so there was no row for the
# draw to seat. The bay was standing free, which is why seating them by hand
# moves nobody.
#
# 107B is on the sheet and still cannot be drawn for. Jagadamba Creation book
# 100 sqft of fabrics (organisers, 1 Sep 2026), and every 100 sqft unit outside
# the saree pool is taken - the only two standing empty, 103 and 107B, are both
# inside it, where a general firm's draw cannot reach. Seating them by hand is
# what puts them on the floor at all; drawn, they would come out unplaced.
# 107B rather than 103 keeps the trade runs whole: it is the last 100 sqft unit
# before the south hall fabrics run, where 103 sits in the middle of the north
# hall saree squares.
RESERVED = {
    "27": "K.K. Garments",                    # 36M x 3M
    "39": "SARAOGI SUPER SALES PRIVATE LIMITED",  # 42M x 6M, the largest stall
    "40": "Murtidhara Sarees / Shyamraj",     # 30M x 6M
    "43": "Earth Fabrics",                    # 18M x 3M, swapped with 46
    "46": "Bahubali",                         # 18M x 3M, swapped with 43
    "100": "Anaya Designer",                  # 24M x 3M, booked after the sheet
    "107B": "Jagadamba Creation",             # half a 6M x 3M, the free one
    "137": "Garden Vareli",                   # 6M x 3M, booked after the sheet
    "152": "Raghav Creation",                 # 6M x 3M, the merged 152+153
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
# A firm that held no unit maps to None: it comes out of the draw and no bay
# comes out with it, which is the whole of the change for a firm that was never
# seated.
#
#   Navdurga    withdrew (organisers, 31 Aug 2026). Stall 61, a 3m x 18m,
#               600 sqft bay in the north hall saree band, goes back empty.
#   Gopal Hari  withdrew (organisers, 1 Sep 2026) and needs no entry here at
#               all: the organisers have struck his row from the sheet, so
#               read_exhibitors() no longer returns him. That is the tidier
#               fix, because his row carried Gauri Ganesh's number rather than
#               one of his own. His stall 137 is let again, to Garden Vareli.
#   Kalavilla   withdrew (organisers, 1 Sep 2026), and the bay that comes off
#               with them is 139 rather than the 136 this plan had seated them
#               on. Their block is two 3m x 12m bays, 136 and 139, against
#               them and Shakambari Lace House, and Shakambari have already
#               drawn 136 in the live lottery. Dropping 136 would leave the
#               plan showing a stall as free that Shakambari hold a slip for;
#               dropping 139 leaves the one bay for the one firm left, so the
#               draw seats Shakambari on the 136 they are already on.
#   Surat       was never confirmed and holds no bay, so None - see the plan
#   Saree House header, where Jyotsna hold the 60 they had drawn.
WITHDRAWN = {
    "Navdurga": "61",                         # 18M x 3M
    "Kalavilla": "139",                       # 12M x 3M, not the 136 they held
    "Surat Saree House": None,                # held no bay
}

# Firms that booked after the sheet was filed. They are on the floor but not in
# STE_data_sheet.xlsx, so they are written here the way read_exhibitors()
# returns a row - that list is the one they join.
#
# They join it only once size_pool_and_splits() has run. The saree pool end and
# the split bays are sized against the sheet's own saree list, and a late
# booking must not move either: a longer list can push the pool end out and cut
# a different pair of bays, which would pull brands off the numbers already on
# their slips. It is the same reasoning that keeps a withdrawal in the sizing -
# the sheet sizes the pool, and only the sheet.
#
# Each one is then seated by hand through RESERVED rather than drawn. The draw
# hands a band's free units out in order, so letting a late firm into it would
# reorder everyone behind them; and there is nothing to draw for in any case,
# because the organisers have already agreed the stall. RESERVED keys on the
# sheet's spelling of a brand, and a firm the sheet does not carry has none, so
# the name here is that key.
#
#   Anaya Designer  booked the 3m x 24m, 800 sqft anchor (organisers,
#                   31 Aug 2026) and is seated on stall 100 - the one bay of
#                   that size in the north hall saree band the draw left free,
#                   the band laying out three (35, 37, 100) against the two
#                   saree firms on the sheet that booked the size.
#   Garden Vareli   booked the 3m x 6m, 200 sqft bay Gopal Hari left
#                   (organisers, 1 Sep 2026) and is seated on stall 137. It is
#                   the only bay in its pool/size/trade block, so it was free
#                   the moment he withdrew and nobody else was ever in line
#                   for it. If a Garden Vareli row is ever added to
#                   STE_data_sheet.xlsx, this entry has to come out or the
#                   firm is counted twice.
#   Raghav Creation booked the bay made by throwing stalls 152 and 153
#                   together (organisers, 1 Sep 2026) and is seated on 152.
#                   Both squares were standing free, so the merge took nothing
#                   off anyone's slip, and they were the last pair on the
#                   floor, so nothing renumbers behind them.
#
#                   The merge is in the drawing, not here: the organisers draw
#                   the two squares as one merged block on the layout sheet,
#                   6 rows by 3 columns labelled "6M x 3M", so read_layout()
#                   reads one 3m x 6m, 200 sqft bay where there were two
#                   3m x 3m ones. The label has to agree with the block's own
#                   span, so a bay merged without relabelling stops the run
#                   rather than coming back the wrong size.
#
#
# A firm listed here is skipped when the sheet is read, so a row the organisers
# later add to STE_data_sheet.xlsx for the same firm does not count them twice
# - and, more importantly, does not let them into the pool sizing by the back
# door. The organisers have since written all three of these into the sheet
# (1 Sep 2026); the skip is what keeps that from moving the saree pool end and
# recutting the split bays underneath brands whose numbers are already on their
# slips. Take a firm out of this list only when their stall numbers no longer
# matter - never merely because the sheet has caught up with them.
#
# Keep registeredExhibitors.ts in step - that is the list the portal actually
# lets people in on - and seed the database, which stores its own copy of the
# guest list rather than reading that one.
LATE_ENTRANTS = [
    {"brand": "Anaya Designer", "category": "Saree", "sheetSize": "3m x 24m",
     "areaSqft": 800, "mobile": "9998023918", "isSaree": True,
     "group": "Saree"},
    {"brand": "Garden Vareli", "category": "Sarees / Dress Material",
     "sheetSize": "3m x 6m", "areaSqft": 200, "mobile": "6357238663",
     "isSaree": True, "group": "Saree"},
    {"brand": "Raghav Creation", "category": "Fabrics",
     "sheetSize": "3m x 6m", "areaSqft": 200, "mobile": "9830944345",
     "isSaree": False, "group": "Dress Material & Fabrics"},
]

LATE_ENTRANT_BRANDS = {e["brand"] for e in LATE_ENTRANTS}

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
#                    9810550285 (organisers, 29 Aug 2026), and it is their
#                    portal ID too since 1 Sep 2026 - the "SSS" they were
#                    registered under is retired. Worth carrying because 39 is
#                    held, and a held stall is looked up by mobile before
#                    brand name.
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

SIZE_TEXT = re.compile(r"(\d+)\s*M\s*[xX]\s*(\d+)\s*M", re.I)
# A sub-let bay inside the anchor block: "1 & 2 Pagriwala", "7 Miu-Miu".
SUB_LABEL = re.compile(r"^(\d+(?:\s*&\s*\d+)*)\s+(.*\S)$")


# --------------------------------------------------------------------------
# 1. Read the drawing
# --------------------------------------------------------------------------
def cell_text(sheet, row, col):
    value = sheet.cell_value(row, col)
    if isinstance(value, float) and value == int(value):
        value = int(value)
    return " ".join(str(value).split())


def region_text(sheet, rlo, rhi, clo, chi):
    """A merged block's label.

    Excel keeps it on the top-left cell, but a block drawn by merging over an
    older one can carry its label further in, so the whole block is read."""
    for row in range(rlo, rhi):
        for col in range(clo, chi):
            text = cell_text(sheet, row, col)
            if text:
                return text
    return ""


def to_plan(row, col, rows, cols):
    """A grid block's rectangle in the printed plan's own coordinate space."""
    ax, bx = GRID_X
    ay, by = GRID_Y
    return {"x": round(col * ax + bx, 2), "y": round(row * ay + by, 2),
            "w": round(cols * ax, 2), "h": round(rows * ay, 2)}


def describe(rows, cols):
    """The size fields a stall carries, from its footprint in metres."""
    area = rows * cols
    sqft, sheet_size, aliases = SHEET_SIZE_BY_SQM[area]
    return {"widthM": cols, "depthM": rows,
            "size": "%dM x %dM" % (max(rows, cols), min(rows, cols)),
            "areaSqm": area, "areaSqft": sqft,
            "sheetSize": sheet_size, "sheetAliases": list(aliases)}


def in_legend(row, col):
    top, bottom, left, right = LEGEND_BOX
    return top <= row < bottom and left <= col < right


def in_anchor(row, col):
    top, left, rows, cols = ANCHOR_CELL
    return top <= row < top + rows and left <= col < left + cols


def read_layout():
    """Split every merged block on the layout sheet into stalls and the rest.

    One cell is one metre, so a block's span is its real size. A block whose
    label names a size is a stall, and that label has to agree with the span:
    a drawing that says one thing and measures another is a mistake worth
    stopping for, not one to round away."""
    book = xlrd.open_workbook(SRC_XLS, formatting_info=True)
    sheet = book.sheet_by_name(SRC_SHEET)
    stalls, features = [], []
    for rlo, rhi, clo, chi in sheet.merged_cells:
        rows, cols = rhi - rlo, chi - clo
        label = region_text(sheet, rlo, rhi, clo, chi)
        size = SIZE_TEXT.search(label)
        if size and not in_legend(rlo, clo) and (rlo, clo) not in PARKED_CELLS:
            printed = sorted((int(size.group(1)), int(size.group(2))))
            if printed != sorted((rows, cols)):
                raise SystemExit(
                    "the block at row %d column %d measures %dM x %dM on the "
                    "grid but is labelled %r"
                    % (rlo, clo, rows, cols, label))
            stalls.append({"row": rlo, "col": clo, **describe(rows, cols),
                           **to_plan(rlo, clo, rows, cols)})
            continue
        if in_anchor(rlo, clo):
            # The anchor block's own cells - read_anchor() draws these as the
            # sub-let bays they are, so they are not loose furniture.
            continue
        if (rlo, clo) in PARKED_CELLS:
            # A block the organisers have dragged off the floor and left lying
            # beside the drawing. It is not part of the hall, and drawing it
            # would put an unnumbered stall on the plan.
            continue
        index = book.xf_list[sheet.cell_xf_index(rlo, clo)]
        colour = book.colour_map.get(index.background.pattern_colour_index)
        features.append({"row": rlo, "col": clo, "label": label,
                         "fill": "#%02x%02x%02x" % colour if colour else None,
                         **to_plan(rlo, clo, rows, cols)})
    stalls.append(read_anchor(sheet))
    return stalls, features


def read_anchor(sheet):
    """The 42M x 6M block, and the bays its holder has sub-let inside it.

    The drawing no longer labels the block with its own size - the sub-let
    bays cover it - so the block is named by ANCHOR_CELL and the bays are read
    out of the cells it spans. They are recorded, drawn and searchable, but
    they are not lettable units: the block is one stall on one number, already
    hand-allotted whole, and letting its parts out here would put 15 stalls
    into the draw that the organisers have not offered."""
    row, col, rows, cols = ANCHOR_CELL
    subs = []
    for rlo, rhi, clo, chi in sheet.merged_cells:
        if not (row <= rlo < row + rows and col <= clo < col + cols):
            continue
        parts = SUB_LABEL.match(region_text(sheet, rlo, rhi, clo, chi))
        if not parts:
            continue
        subs.append({"row": rlo, "col": clo,
                     "units": re.sub(r"\s*&\s*", " & ", parts.group(1)),
                     "brand": parts.group(2),
                     "size": "%dM x %dM" % (max(rhi - rlo, chi - clo),
                                            min(rhi - rlo, chi - clo)),
                     **to_plan(rlo, clo, rhi - rlo, chi - clo)})
    # Down each column in turn from the cross-aisle end back, which is the
    # order the block's own 1-28 numbering runs in.
    subs.sort(key=lambda s: (s["col"], -s["row"]))
    return {"row": row, "col": col, "subStalls": subs,
            **describe(rows, cols), **to_plan(row, col, rows, cols)}

# --------------------------------------------------------------------------
# 2. Assign the numbers
# --------------------------------------------------------------------------
def walk_order(stalls):
    """The floor walked once, west to east.

    This is the order a bay the plan has added takes its number in. It no
    longer re-cuts the numbers that are already out."""
    strip = sorted((s for s in stalls if s["row"] < STRIP_END_ROW),
                   key=lambda s: s["col"])
    north = [s for s in stalls if STRIP_END_ROW <= s["row"] < CROSS_AISLE_ROW]
    south = [s for s in stalls if s["row"] >= CROSS_AISLE_ROW]

    def by_column(group, from_cross_aisle_upward):
        """Columns west to east; inside a column, start at the cross-aisle end."""
        columns = defaultdict(list)
        for s in group:
            columns[s["col"]].append(s)
        ordered = []
        for col in sorted(columns):
            ordered.extend(sorted(
                columns[col],
                key=lambda s: -s["row"] if from_cross_aisle_upward else s["row"]))
        return ordered

    # frontEnd is the end the number is printed at: the stall's frontage on
    # the aisle it is entered from.
    for s in strip:
        s["zone"], s["frontEnd"] = "North Wall Strip", "centre"
    for s in north:
        s["zone"], s["frontEnd"] = "North Hall", "south"
    for s in south:
        s["zone"], s["frontEnd"] = "South Hall", "north"
    return strip + by_column(north, True) + by_column(south, False)


def carry_numbers(stalls):
    """Put back the number that is already on the slip, then number the rest.

    LOCKED_NUMBERS pins a number to the cell it occupies in this layout, so a
    stall the organisers slid up its column keeps it. A bay the table does not
    claim is one the plan has added, and takes the next number no stall on
    this floor has ever held."""
    walk = walk_order(stalls)
    for s in walk:
        s["stallNumber"] = LOCKED_NUMBERS.get((s["row"], s["col"]))

    taken = {s["stallNumber"] for s in walk if s["stallNumber"]}
    reissued = taken & RETIRED_NUMBERS
    if reissued:
        raise SystemExit("retired numbers are back on the floor: %s"
                         % sorted(reissued))
    nxt = max([FIRST_NEW_NUMBER - 1, *taken, *RETIRED_NUMBERS]) + 1
    for s in walk:
        if s["stallNumber"] is None:
            s["stallNumber"] = nxt
            nxt += 1

    numbers = [s["stallNumber"] for s in walk]
    if len(numbers) != len(set(numbers)):
        raise SystemExit("LOCKED_NUMBERS seats two stalls on one number")

    for s in walk:
        number = s["stallNumber"]
        if number in LEGACY_NUMBERS:
            s["legacyNumber"] = LEGACY_NUMBERS[number]
        if number in MAP_RESERVED:
            s["reservedFor"] = MAP_RESERVED[number]
        for i, sub in enumerate(s.get("subStalls", []), start=1):
            sub["id"] = "%d-%d" % (number, i)
    return sorted(walk, key=lambda s: s["stallNumber"])

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
        # A late entrant the organisers have since written into the sheet. The
        # LATE_ENTRANTS row is the one that counts, and it joins the list only
        # after the pool has been sized - see that list for why.
        if re.sub(r"\s+", " ", str(brand)).strip() in LATE_ENTRANT_BRANDS:
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


def unit_number(unit_id):
    """The stall a unit id sits on: "107B" -> 107, "137" -> 137."""
    return int(re.match(r"\d+", unit_id).group())


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
    this out, which leaves that stall empty without moving anyone else.

    RESERVED is seated first, off unit ids, so half a split bay can be let
    without taking the other half out of the draw with it."""
    order = [name for name, _ in TRADE_GROUPS]
    units = [u for u in build_units(stalls, split_bays)
             if u["unitId"] not in set(WITHDRAWN.values())]
    exhibitors = [e for e in exhibitors if e["brand"] not in WITHDRAWN]

    def in_saree_pool(number):
        return number <= pool_end and number not in SAREE_POOL_EXCLUDES

    allotments = []
    taken_units, taken_brands = set(), set()
    by_unit = {u["unitId"]: u for u in units}
    by_brand = {e["brand"]: e for e in exhibitors}
    for unit_id, brand in sorted(RESERVED.items(),
                                 key=lambda kv: (unit_number(kv[0]), kv[0])):
        unit = by_unit.get(unit_id)
        if unit is None:
            raise SystemExit("RESERVED holds unit %s, which this floor does "
                             "not lay out" % unit_id)
        ex = by_brand.get(brand)
        if not ex:
            continue
        allotments.append({"unitId": unit_id, "stall": unit["stall"], "ex": ex,
                           "held": True})
        taken_units.add(unit_id)
        taken_brands.add(brand)

    unplaced = []
    for saree_side in (True, False):
        free = defaultdict(list)
        for u in units:
            n = u["stall"]["stallNumber"]
            if u["unitId"] in taken_units or in_saree_pool(n) is not saree_side:
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
def xml_escape(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def draw_plan(stalls, features):
    """Draw the plan, then put the numbers on it.

    The layout is a spreadsheet now, so the plan is drawn from the same grid
    the numbers are cut from rather than annotated onto an export. A stall's
    badge and its rectangle come out of one rectangle, so the drawing and the
    numbering cannot drift apart."""
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s"'
           ' width="%s" height="%s"'
           ' font-family="Arial, Helvetica, sans-serif">'
           % (VIEW_W, VIEW_H, VIEW_W, VIEW_H),
           '<rect width="%s" height="%s" fill="#ffffff"/>' % (VIEW_W, VIEW_H)]

    def rect(box, fill, stroke=None):
        edge = ' stroke="%s" stroke-width="0.6"' % stroke if stroke else ""
        out.append('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f"'
                   ' fill="%s"%s/>'
                   % (box["x"], box["y"], box["w"], box["h"], fill, edge))

    def label(box, text, cap, colour="#1f2937", weight="normal", at=0.5):
        """Centre a label in its box, turned on its side if the box is tall.

        A label that will not fit legibly is left off rather than shrunk to a
        smear: the plan is read at arm's length off a printed sheet."""
        if not text:
            return
        turn = box["h"] > box["w"] * 1.6
        across, down = (box["h"], box["w"]) if turn else (box["w"], box["h"])
        size = min(cap, down * 0.62, across * 1.7 / len(text))
        if size < 2.3:
            return
        # `at` slides the label down its box to clear the number badge; a
        # turned box is narrow, so there is nowhere to slide it to.
        cx = box["x"] + box["w"] / 2
        cy = box["y"] + box["h"] * (0.5 if turn else at)
        spin = ' transform="rotate(-90 %.2f %.2f)"' % (cx, cy) if turn else ""
        out.append('<text x="%.2f" y="%.2f" font-size="%.2f" font-weight="%s"'
                   ' text-anchor="middle" fill="%s"%s>%s</text>'
                   % (cx, cy + size * 0.35, size, weight, colour, spin,
                      xml_escape(text)))

    # The hall itself: walls, aisles, entrances, the offices and the legend.
    for f in features:
        if f["fill"] and f["fill"] != "#ffffff":
            rect(f, f["fill"])
        label(f, f["label"], 7.5, weight="bold")

    for s in stalls:
        rect(s, COLOUR_BY_SIZE[s["size"]], "#000000")
        if "subStalls" not in s:
            # The north wall strip carries its badge in the middle, so its
            # size sits high in the bay rather than under the number.
            label(s, s["size"], 5.4,
                  at=0.24 if s["frontEnd"] == "centre" else 0.5)
    # The anchor block's sub-let bays, drawn over the block they sit in.
    for s in stalls:
        for sub in s.get("subStalls", []):
            rect(sub, COLOUR_BY_SIZE[sub["size"]], "#000000")
            label(sub, "%s %s" % (sub["units"], sub["brand"]), 4.6)

    out.append('<g id="stall-numbers">')

    def badge(cx, cy, text):
        bw, bh = 4.2 + 3.6 * len(text), 9.0
        out.append(
            '<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f" rx="2"'
            ' fill="#ffffff" stroke="#c00000" stroke-width="0.7"/>'
            '<text x="%.2f" y="%.2f" font-size="6.6" font-weight="bold"'
            ' text-anchor="middle" fill="#c00000">%s</text>'
            % (cx - bw / 2, cy - bh / 2, bw, bh, cx, cy + 2.4, text))

    for s in stalls:
        if "halves" in s:
            # A 200 sqft bay: label both 100 sqft modules and rule the split.
            for half in s["halves"]:
                badge(half["x"] + half["w"] / 2, half["y"] + half["h"] / 2,
                      half["id"])
            a, b = s["halves"]
            if a["y"] == b["y"]:                    # bay runs east-west
                x = max(a["x"], b["x"])
                out.append('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"'
                           ' stroke="#c00000" stroke-width="0.5"'
                           ' stroke-dasharray="2 1.6"/>'
                           % (x, s["y"], x, s["y"] + s["h"]))
            else:
                y = max(a["y"], b["y"])
                out.append('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"'
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
            # The strip is only 3M deep, so the badge sits low in the bay and
            # its size label rides above rather than under it.
            cy = s["y"] + s["h"] * 0.68
        badge(s["x"] + s["w"] / 2, cy, str(s["stallNumber"]))
    out.append("</g>")
    out.append("</svg>")
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text("\n".join(out) + "\n", encoding="utf-8")


def write_typescript(stalls):
    rows = []
    for s in stalls:
        legacy = '"%s"' % s["legacyNumber"] if "legacyNumber" in s else "undefined"
        rows.append(
            "  { stallNumber: %-4s size: %-12s sheetSize: %-12s areaSqm: %-5s"
            " areaSqft: %-6s zone: %-21s widthM: %2d,"
            " depthM: %2d, x: %7.2f, y: %6.2f, w: %6.2f, h: %6.2f,"
            " legacyNumber: %s%s%s%s%s },"
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
               if "halves" in s else "",
               (",\n    subStalls: [\n%s,\n    ]" % ",\n".join(
                   '      { id: "%s", units: "%s", brand: "%s", size: "%s",'
                   ' x: %.2f, y: %.2f, w: %.2f, h: %.2f }'
                   % (b["id"], b["units"], b["brand"], b["size"],
                      b["x"], b["y"], b["w"], b["h"])
                   for b in s["subStalls"]))
               if s.get("subStalls") else "")
        )
    totals = Counter(s["size"] for s in stalls)
    ordered_totals = sorted(totals.items(), key=lambda kv: -kv[1])
    breakdown = "\n".join(" *   %-10s %3d" % (k, v) for k, v in ordered_totals)
    counts = "\n".join('  "%s": %d,' % (k, v) for k, v in ordered_totals)
    highest = max(s["stallNumber"] for s in stalls)
    retired = sorted(RETIRED_NUMBERS)
    retired_note = ((", less %s - retired off the floor and never reissued"
                     % ", ".join(str(n) for n in retired)) if retired else "")
    nl = "\n"
    OUT_TS.write_text(
        "/**\n"
        " * STE 2026 master stall map - generated from the layout sheet\n"
        " * \"%s\" in Final-Layout-STE-2026.xls.\n"
        " *\n"
        " * Do not hand-edit. Regenerate with:  python scripts/number_stalls.py\n"
        " *\n"
        " * %d stalls, %d sqm:\n%s\n"
        " *\n"
        " * Numbers run 1-%d%s.\n"
        " *\n"
        " * A number belongs to the exhibitor holding it, not to a position on\n"
        " * the floor: a stall the organisers move keeps its number, a number\n"
        " * that comes off the floor is retired rather than reissued, and a bay\n"
        " * the plan adds is numbered from the end. See LOCKED_NUMBERS in the\n"
        " * generator for what is pinned where.\n"
        " *\n"
        " * x/y/w/h are the stall's rectangle in the floor plan's own\n"
        " * coordinate space (1 metre = %s units), so they can be used to draw\n"
        " * or hit-test the plan directly.\n"
        " */\n\n"
        'export type StallZone = "North Wall Strip" | "North Hall" | "South Hall";\n\n'
        "/** One 100 sqft module of a 200 sqft bay that was split. */\n"
        "export interface StallHalf {\n"
        "  /** The bay number with an A or B suffix, e.g. \"91A\". */\n"
        "  id: string;\n"
        "  /** The part's own size. Defaults to 3M x 3M, the half of a 200 sqft bay. */\n"
        "  size?: string;\n"
        "  x: number;\n"
        "  y: number;\n"
        "  w: number;\n"
        "  h: number;\n"
        "}\n\n"
        "/**\n"
        " * A bay the stall's holder has sub-let inside it. Recorded and drawn,\n"
        " * but never a lettable unit: the stall is let whole, on one number.\n"
        " */\n"
        "export interface SubStall {\n"
        "  /** The stall number with the bay's position, e.g. \"39-1\". */\n"
        "  id: string;\n"
        "  /** The block's own numbering for this bay, e.g. \"1 & 2\". */\n"
        "  units: string;\n"
        "  brand: string;\n"
        "  size: string;\n"
        "  x: number;\n"
        "  y: number;\n"
        "  w: number;\n"
        "  h: number;\n"
        "}\n\n"
        "export interface Stall2026 {\n"
        "  /** 1..%d, less any retired. Walked west to east: north wall strip,\n"
        "   *  north hall, south hall. */\n"
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
        "  /** Bays the holder has sub-let inside this stall. Not lettable. */\n"
        "  subStalls?: SubStall[];\n"
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
        % (SRC_SHEET, len(stalls), sum(s["areaSqm"] for s in stalls), breakdown,
           highest, retired_note, UNITS_PER_M, highest, nl.join(rows), counts),
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
    stalls, features = read_layout()
    stalls = carry_numbers(stalls)
    split_halves(stalls, LOCKED_SPLIT_BAYS)

    draw_plan(stalls, features)
    write_typescript(stalls)

    numbers = sorted(s["stallNumber"] for s in stalls)
    gaps = [n for n in range(1, numbers[-1]) if n not in set(numbers)]
    if gaps != sorted(RETIRED_NUMBERS):
        raise SystemExit("the numbering has gaps nobody retired: %s"
                         % sorted(set(gaps) - RETIRED_NUMBERS))

    print("%d stalls, %d sqm" % (len(stalls), sum(s["areaSqm"] for s in stalls)))
    for size, n in sorted(Counter(s["size"] for s in stalls).items(),
                          key=lambda kv: -kv[1]):
        print("  %-10s %3d" % (size, n))
    print("numbered 1-%d, retired %s"
          % (numbers[-1], sorted(RETIRED_NUMBERS) or "none"))
    print("bays split  %s" % (sorted(LOCKED_SPLIT_BAYS) or "none"))
    for path in (OUT_TS, OUT_SVG):
        print("wrote %s" % path.relative_to(ROOT))

    if "--allotment" not in sys.argv[1:]:
        print("\n%s left alone: it carries live draw results and hand-seated\n"
              "rows, and rebuilding it over a floor that has changed shape "
              "would move\nbrands off numbers already on their slips. Pass "
              "--allotment to rebuild it." % OUT_ALLOT.relative_to(ROOT))
        return

    exhibitors = read_exhibitors()
    saree = [e for e in exhibitors if e["isSaree"]]
    pool_end, split_bays = size_pool_and_splits(stalls, saree)
    if sorted(split_bays) != sorted(LOCKED_SPLIT_BAYS):
        raise SystemExit(
            "the saree pool now wants bays %s cut, not %s. Those halves are "
            "out as 91A/91B and 107A/107B, so settle it with the organisers "
            "before rebuilding." % (sorted(split_bays), sorted(LOCKED_SPLIT_BAYS)))
    # Only now, so a late booking cannot move the pool end or the split bays.
    exhibitors += LATE_ENTRANTS
    saree += [e for e in LATE_ENTRANTS if e["isSaree"]]
    allotments, unplaced = allot(stalls, exhibitors, pool_end, split_bays)
    write_allotment(allotments, pool_end, split_bays, exhibitors)

    print("\n%d exhibitors: %d saree, %d general"
          % (len(exhibitors), len(saree), len(exhibitors) - len(saree)))
    print("saree pool  stalls 1-%d less %s  (%d stalls)"
          % (pool_end, sorted(SAREE_POOL_EXCLUDES),
             pool_end - len(SAREE_POOL_EXCLUDES)))
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
    print("wrote %s" % OUT_ALLOT.relative_to(ROOT))


if __name__ == "__main__":
    main()
