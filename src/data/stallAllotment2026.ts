/**
 * STE 2026 demo allotment - generated from STE_data_sheet.xlsx and the
 * stall map. Do not hand-edit; rerun scripts/number_stalls.py.
 *
 * RENUMBERED 5 Sep 2026 to the organisers' approved final layout ("STE -
 * Proposed Layout 5.9.2026" in STE_FINAL_WITH_STALL_NUMBERS.xls), matched
 * brand-by-brand against that drawing rather than against
 * ste-final-stall-numbers.xlsx's own Old/New Stall No columns - those
 * turned out not to track this app's live numbers reliably (e.g. it lists
 * Abhiraj Fashion's "old" stall as 10 at 100 sqft; this app has them on
 * stall 2 at 200 sqft). Every brand below was instead matched against the
 * new drawing's own printed name for the position it occupies.
 *
 * Ten current stalls have no cell anywhere in the new drawing under a
 * recognisable name and are re-parked as "PENDING-<old unit>" rather than
 * dropped or left squatting on a number the new plan hands to someone else:
 * brand/mobile/category survive (still findable by mobile), stallNumber is
 * 0 and there is no matching stallMap2026 position, so they simply don't
 * plot on the floor until given a real one. In each case the new drawing's
 * number was legitimately claimed by a different, clearly-matched firm:
 *   4   Chandwani Silk Mills   - no matching name anywhere in the new drawing
 *   5   Divine Silk Mills      - no matching name anywhere in the new drawing
 *   7   Ganesh Fashion         - no matching name anywhere in the new drawing
 *   30  Sukhdev Textile        - no matching name anywhere in the new drawing
 *   39  SARAOGI SUPER SALES    - their own row on ste-final-stall-numbers.xlsx
 *                                gives a range ("36 TO 50"), not a number; the
 *                                new drawing has no "Saraogi" cell, and a
 *                                separate lettered A1-A17 sub-let cluster near
 *                                a "Premium Lounge" may or may not be theirs
 *   86  (unnamed placeholder) - was already unlet before this pass; nothing lost
 *   99  Saaj Creations         - this firm holds two current stalls (92 and 99,
 *                                same brand/mobile); the new drawing shows only
 *                                one "Saaj Creation" cell (unit 92 took new 112)
 *   106 Veemo Fashions         - printed on the source sheet as a stray label
 *                                with no number attached, directly under
 *                                stall "102 Nandini" - looks like a gap in the
 *                                organisers' own file
 *   141 Shiv Vardhaan          - holds two current stalls (18 and 141); the new
 *                                drawing shows only one bare "18 Shiv Vardhaan"
 *                                cell (unit 18 kept its number)
 *   151 Dream Delta            - lost a stall-139 clash to Alok Suit (both
 *                                claimed it on ste-final-stall-numbers.xlsx);
 *                                does not appear elsewhere in the new drawing
 *
 * 150 firms on 148 stalls: 149 of the 152 on the sheet - Navdurga, Kalavilla
 * and Surat Saree House have come off, so none of the three holds one - plus
 * Anaya Designer, who booked afterwards and is still not in it. Saree brands
 * (sarees, lehengas and the uniform-saree firms) draw from stalls 1-107 less
 * 27, 28, 29; everyone else takes the south hall and those three big blocks.
 *
 * The draw order is seeded, so the same floor comes back every run.
 * This is a demo allotment, not a live draw result.
 *
 * Rows with held: true are hand-allotted and sit outside the seeded draw, so
 * a rerun of scripts/number_stalls.py must not reassign them:
 *   43   Earth Fabrics, the stall the organisers have already allotted them
 *        (organisers, 29 Aug 2026). Both this row and 46 are held, so neither
 *        firm's number can move once it is on the slip.
 *   46   Bahubali, seated on the 43 they vacated - the same 3m x 18m,
 *        600 sqft size in the same north hall saree band, so the swap is an
 *        exchange rather than a resize.
 *   121  Radhey Silk Weaves, seated on the bay 111 vacated
 *   151  Dream Delta, on a 3m x 3m bay the draw had left empty
 *   60   Jyotsna, on a whole 3m x 6m bay rather than a cut piece of bay
 *        100 (organisers, 28 Aug 2026). Surat Saree House, who had drawn 60,
 *        was never confirmed and has now come off the list altogether.
 *   100  Anaya Designer, seated on the 800 sqft north hall anchor the draw
 *        had left empty (organisers, 31 Aug 2026)
 *   137  Garden Vareli, seated on the bay Gopal Hari left (organisers,
 *        1 Sep 2026)
 *   152  Raghav Creation, seated on the bay made by throwing 152 and 153
 *        together (organisers, 1 Sep 2026)
 *   107B Jagadamba Creation, on the half of bay 107 the saree draw left
 *        standing (organisers, 1 Sep 2026)
 *   30   SANKALP, moved up off the 200 sqft bay 18 onto the 3m x 12m,
 *        400 sqft bay the draw had left empty (organisers, 3 Sep 2026).
 *        A resize, not a swap: they book 400 sqft now, so
 *        registeredExhibitors.ts carries the new size too.
 *   18   Charchita Designer, moved up off the 100 sqft bay 92 onto the
 *        3m x 6m, 200 sqft bay SANKALP vacated (organisers, 3 Sep 2026).
 *        A resize as well, and registeredExhibitors.ts carries it.
 *   92   Hariom Trendz, seated on the 3m x 3m bay Charchita Designer
 *        vacated (organisers, 3 Sep 2026). They are not on
 *        STE_data_sheet.xlsx, so the draw had no row to seat them.
 *
 * The three moves are one chain and are held together. Each firm steps onto
 * the bay the one before it left, so the floor gains and loses nothing: no
 * bay stands empty at the end that did not before, and no firm outside the
 * chain changes number. Held is what keeps it that way - drawn, the vacated
 * bays would go back into their blocks and be handed out in draw order,
 * pulling brands off numbers already on their slips.
 *
 * Stall 114 stands empty. Sweety Fashion holds stall 112 (Suits), and the
 * duplicate/extra stall 114 (8141335505) allotment was removed (organisers, 3 Sep 2026),
 * leaving the 800 sqft bay free/unallotted.
 *
 * Stall 30 is now let. In the live draw, Abhaar Vastram were allotted stall 31
 * (slip STE-2026-31-0730-5198) and Bharti Sarees stall 44, which left 30 - one
 * of the two 3m x 12m, 400 sqft bays at the head of the north hall - standing
 * free. SANKALP (7719063355) take it, moving up from the 200 sqft bay 18
 * (organisers, 3 Sep 2026), and 18 and 92 move with them: Charchita Designer
 * (9408990045) take 18, and Hariom Trendz (9586746162) take the 100 sqft bay
 * 92 Charchita leave. All three rows are held.
 *
 * Nobody outside the chain moves. 30 was the bay nobody drew, so seating
 * SANKALP on it costs no one a number; 18 and 92 are then filled by the firm
 * stepping up behind, so neither goes back into its block to be redrawn. Two
 * of the three are resizes rather than swaps - SANKALP 200 -> 400 sqft and
 * Charchita 100 -> 200 sqft - so registeredExhibitors.ts carries the new sizes
 * as well, the way it does for Shiv Vardhaan on 141. Hariom Trendz are not on
 * STE_data_sheet.xlsx at all; they join the guest list here, and 92 is a bay
 * inside the saree band that only a hand-seating can reach.
 *
 * Stall 117 stands empty. JMJ Creations (9414141810) stall allotment was
 * removed (organisers, 3 Sep 2026), leaving the 200 sqft bay free/unallotted.
 *
 * Stall 61 stands empty. Navdurga withdrew (organisers, 31 Aug 2026) and the
 * bay is not reallotted: the draw hands a band's stalls out in order, so
 * filling 61 would pull every 600 sqft saree brand behind it one number
 * forward, off the stall already on their slip. WITHDRAWN in
 * scripts/number_stalls.py takes the firm and the bay out together, so a rerun
 * leaves 61 empty rather than drawing someone onto it.
 *
 * Stall 139 stands empty too. Gopal Hari and Kalavilla both pulled out
 * (organisers, 1 Sep 2026) and, like Navdurga, neither bay was reallotted -
 * WITHDRAWN takes the firm and a bay out of the draw together, so the brands
 * behind them keep the numbers already on their slips. Gopal Hari's 137 has
 * since been let again, to Garden Vareli; Kalavilla's 139 has not.
 *
 * Gopal Hari alone is gone from the sheet as well as the floor (organisers,
 * 1 Sep 2026), which is why he wants no WITHDRAWN entry: the row is not there
 * to withdraw. Striking him is the tidier fix in his case, because the row
 * carried Gauri Ganesh's number rather than one of his own, and 9601700354 now
 * answers for one firm only. Navdurga, Kalavilla and Surat Saree House stay in
 * the sheet - it is the list the organisers drew up, not the floor.
 *
 * Stall 137 is let to Garden Vareli (6357238663), a 200 sqft saree and dress
 * material firm who booked after the sheet was filed and have since been
 * written into it (organisers, 1 Sep 2026). Seating them costs nobody their
 * number, for the same reason Gopal Hari's leaving cost nobody theirs: 137 is
 * the only bay in its pool/size/trade block, so no other firm could ever have
 * drawn it. The row is held rather than drawn - the floor was settled before
 * they booked, and letting them into the draw now would hand a band's free
 * units out in a different order - and heldUnitFor() gives them 137 with
 * nothing to draw for.
 *
 * Their sheet row changes none of that. LATE_ENTRANTS in
 * scripts/number_stalls.py is what seats a late firm, and read_exhibitors()
 * skips the sheet row of any firm named there, so a firm the organisers have
 * caught up on is still counted once and still joins the list only after the
 * saree pool has been sized. That is the point of the skip rather than a
 * tidiness: Garden Vareli are a saree firm, and letting them into the sizing
 * could push the pool end out and cut a different pair of bays, pulling brands
 * off numbers already on their slips.
 *
 * Which bay comes off with Kalavilla is not the one the plan had them on. The
 * 400 sqft dress-material block is two bays, 136 and 139, against Kalavilla
 * and Shakambari Lace House; Shakambari have already drawn 136 in the live
 * lottery, so the bay Kalavilla's exit actually frees is 139, and 136 is
 * written to the firm sitting on it. Taking 139 out instead of 136 is what
 * keeps this plan and the live draw saying the same thing - dropping 136
 * would advertise as free a stall Shakambari hold a slip for.
 *
 * Surat Saree House take no bay off the floor with them: they were never
 * confirmed and held none to begin with.
 *
 * Stall 100 is now let. The saree band lays out three 3m x 24m, 800 sqft bays
 * - 35, 37 and 100 - and the sheet's saree list held only two firms that size,
 * so the draw filled 35 and 37 and left 100 standing. Anaya Designer
 * (9998023918) booked it after the sheet was filed (organisers, 31 Aug 2026).
 * They are not on the sheet, so the draw could never have seated them; the
 * organisers seated them by hand instead, which is why the row is held. It
 * costs no one their number: 100 was the bay nobody drew, and 35 and 37 keep
 * the firms already on them. Bay 100 is let whole, not in halves - see
 * SPLIT_BAYS_2026 below.
 *
 * Stall 153 no longer exists. 152 and 153 were the last two 3m x 3m squares
 * at the foot of the east column of the south hall, and the organisers threw
 * them together into one 3m x 6m, 200 sqft bay under the lower number
 * (organisers, 1 Sep 2026). Raghav Creation (9830944345) take it, held.
 *
 * The merge costs nobody a number. Both squares were standing free - nobody
 * had drawn either, and no firm on the sheet was in line for them - so joining
 * them takes nothing off anyone's slip, and it is the last pair on the floor,
 * so no stall renumbers behind it: the floor now runs 1..152 with no gap.
 *
 * The drawing carries the merge, not just this table. A stall on this plan is
 * marked off by the black border lines around it and sized by the colour it is
 * painted, so the line between 152 and 153 is deleted from
 * Final-Layout-STE-2026.svg and the bay is repainted in the legend's 6M x 3M
 * pink instead of its 3M x 3M pink. Both are what a rerun of
 * scripts/number_stalls.py reads, so the merged bay survives one; leaving the
 * colour alone would have made classify() throw the bay away as a 3m x 3m
 * region measuring 3m x 6m.
 *
 * Raghav Creation are a fabrics firm, which the sheet gives as their trade
 * (organisers, 1 Sep 2026), so the row sits in Dress Material & Fabrics. The
 * bay is held, so the group buys them nothing in the draw; it is what the
 * plan colours them by and what the fascia and the export read.
 *
 * Stall 107B is let. 107 is the 3m x 6m bay at the head of the south hall, one
 * of the two the saree pool needed cut in half (see SPLIT_BAYS_2026), and its
 * two 100 sqft halves went out separately: Amaya drew 107A, and 107B stood
 * empty as the half the saree list never reached. Jagadamba Creation
 * (9998675623), a 100 sqft fabrics firm, take it (organisers, 1 Sep 2026).
 *
 * They take no LATE_ENTRANTS entry, unlike the three firms above. That list
 * carries a firm the sheet did not hold when the floor was settled, and skips
 * their sheet row if one is added later, so a late saree booking cannot
 * lengthen the saree list and recut the pool underneath numbers already on
 * slips. Jagadamba Creation are on the sheet and their row is safe to read
 * straight: the pool is sized off the saree list alone, and a fabrics firm is
 * not in it.
 *
 * The row is held all the same, and has to be. Every 100 sqft unit outside the
 * saree pool is already drawn, and the only two standing empty - 103 and 107B
 * - are both inside it, where a general firm's draw cannot reach. Left to the
 * draw, Jagadamba Creation would have come out unplaced rather than seated.
 *
 * 107B rather than 103 is what keeps the trade runs whole. Inside the 100 sqft
 * band the floor reads saree, then lehenga on 107A, then fabrics from 124 to
 * 148: 107B is the last unit before that fabrics run and joins the head of it,
 * while 103 sits in the middle of the north hall saree squares and would have
 * cut them in two. Shiv Vardhaan vacated 103 when they were moved up to the 200 sqft
 * bay 141; stall 103 was later hand-allotted to Siyaram Fabrics (7874253511, 100 sqft Fabrics).
 *
 * Nobody loses a number for it: 107B is a half nobody drew, and 107A keeps
 * Amaya. The row carries pool "General" although the bay it sits on was cut
 * for the saree pool, because pool is the block the firm would draw from
 * rather than the pool the bay was cut for - and a held row draws from none.
 *
 * Six rows correct the sheet rather than following it:
 *   1    Aalingan Art / Nidhanam, not the "Aalingan Art (Nidhidham)" the sheet
 *        spells (organisers, 29 Aug 2026) - the second name is Nidhanam, and
 *        the firm writes the pair with a slash, the way every other joint name
 *        on this floor is written.
 *   39   Saraogi Super Sales answer on 9810550285, where the sheet gives no
 *        number at all (organisers, 29 Aug 2026). The number is now their
 *        portal ID as well (organisers, 1 Sep 2026); the "SSS" they were
 *        registered under for want of one is retired and no longer opens the
 *        portal. Retired rather than kept as an alias because two ways in
 *        made two profiles: the firm signed in on the number and set a
 *        password there, and the ID's own row sat beside it holding the brand
 *        name, so the admin console had the firm twice and neither row was
 *        whole. The number is on this row so the hold on 39 - the anchor,
 *        the largest stall on the floor, booked at 2800 sqft (organisers,
 *        5 Sep 2026; was 2600) - is found by mobile rather than by brand
 *        name alone.
 *   38   Apple lifestyle answer on 9825398582, not the 9099140404 the sheet
 *        carries (organisers, 29 Aug 2026). The old number has been given up
 *        and may be reassigned, so it is retired rather than kept as an
 *        alias - it no longer opens the portal. MOBILE_CORRECTIONS in
 *        scripts/number_stalls.py holds the new number so a rerun does not
 *        put the dead one back.
 *   60   Jyotsna, not the "Jyotsana" the sheet spells (organisers,
 *        28 Aug 2026). BRAND_CORRECTIONS in scripts/number_stalls.py holds
 *        the spelling, so a rerun no longer brings the sheet's back.
 *   122  Vaani NX, not the "Vani NX" the sheet spells (organisers,
 *        28 Aug 2026) - the firm's own fascia name reads Vaani.
 *        BRAND_CORRECTIONS in scripts/number_stalls.py holds the spelling,
 *        so a rerun no longer brings the sheet's back.
 *   141  Shiv Vardhaan books 200 sqft, not the 100 the sheet carries
 *        (organisers, 28 Aug 2026). Moved off the 3m x 3m bay 103 onto 141,
 *        the 200 sqft bay the draw had left empty, and kept in the saree pool
 *        so 141 belongs to the saree 200 block and the draw - not the
 *        organisers - decides who ends up in the south hall. A rerun of
 *        scripts/number_stalls.py must not send them back to 100 sqft.
 *   136A Shakambari Lace House, downsized to 200 sqft on the north half of bay 136
 *        (organisers, 5 Sep 2026). Held so their downsized stall is locked.
 *   136B Raghav Creation, moved off bay 152 onto the south half of bay 136 (200 sqft)
 *        (organisers, 5 Sep 2026). Held so their move is locked.
 *   28A..28H Eight-way split of bay 28 along its lobby-facing frontage (organisers, 5 Sep 2026):
 *        28A: YKDK (100 sqft, placeholder, held)
 *        28B: Ruby (300 sqft, moved off bay 88, held)
 *        28C: Vaishnavi Sarees (100 sqft, placeholder, held)
 *        28D: Shivay (100 sqft, placeholder, held)
 *        28E: Sonia (100 sqft, placeholder, held)
 *        28F: Shubh Laxmi (100 sqft, placeholder, held)
 *        28G: Mercury (100 sqft, placeholder, held)
 *        28H: Om Ganesh (100 sqft, placeholder, held)
 *        Mohilya (9722771233) removed from bay 28 with registered sqft (1000) intact.
 *   61   Libaas Fashion (AK TRENDZ), upsized to 600 sqft and moved off bay 132 onto 61
 *        (organisers, 5 Sep 2026). Held so their move & upsize is locked.
 *   62   Triveni (600 sqft placeholder, organisers, 5 Sep 2026). Replaces stale
 *        Nidhivan / Yogayaa row whose real live stall is 53.
 *   88, 132, 152 stand empty / vacated. Ruby moved 88 -> 28B; Libaas Fashion moved
 *        132 -> 61; Raghav Creation moved 152 -> 136B. Clearing 88 also fixes the
 *        stale Swarnpari Design entry.
 *
 *   Durability note: unlike standard single-unit held rows, the split into multiple units
 *   for bays 136 and 28 is outside number_stalls.py's standard 2-piece saree generator logic.
 *   If scripts/number_stalls.py --allotment is ever rerun, these split units and the hand-edited
 *   SVG must be reapplied by hand.
 */

export type AllotmentPool = "Saree" | "General";

export interface Allotment2026 {
  /** Stall number, or a bay half such as "106A". */
  unitId: string;
  stallNumber: number;
  brand: string;
  category: string;
  /** Trade group the floor is laid out by. */
  group: string;
  mobile: string;
  sheetSize: string;
  areaSqft: number;
  pool: AllotmentPool;
  zone: string;
  /** Hand-allotted before the draw rather than drawn. */
  held: boolean;
}

export const ALLOTMENTS_2026: Allotment2026[] = [
  { unitId: "1", stallNumber: 1, brand: "Tithi Designer", category: "Saree",
    group: "Saree", mobile: "9662399969", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "2", stallNumber: 2, brand: "CSM", category: "",
    group: "General", mobile: "", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Wall Strip", held: true },
  { unitId: "3", stallNumber: 3, brand: "Shreeji Designer / Khushi Fashion", category: "Saree",
    group: "Saree", mobile: "9687014347", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "4", stallNumber: 4, brand: "Vani Designer", category: "Sarees",
    group: "Saree", mobile: "9328539215", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "PENDING-4", stallNumber: 4, brand: "Chandwani Silk Mills", category: "Saree",
    group: "Saree", mobile: "9377418152", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "5", stallNumber: 5, brand: "Omkar / Shivrudra", category: "Saree/Lehanga",
    group: "Saree", mobile: "9327465454", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "PENDING-5", stallNumber: 5, brand: "Divine Silk Mills", category: "Sarees",
    group: "Saree", mobile: "9909789088", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "6", stallNumber: 6, brand: "Nirvana (Kiran)", category: "Saree",
    group: "Saree", mobile: "9898106273", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "7", stallNumber: 7, brand: "Vivah Textile", category: "Saree",
    group: "Saree", mobile: "9537841621", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "8", stallNumber: 8, brand: "Nidhi Creation", category: "",
    group: "General", mobile: "", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Wall Strip", held: true },
  { unitId: "9", stallNumber: 9, brand: "Kokilla fashion", category: "Sarees",
    group: "Saree", mobile: "9825385509", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "10", stallNumber: 10, brand: "Abhiraj Fashion", category: "Sarees",
    group: "Saree", mobile: "9506455565", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "11", stallNumber: 11, brand: "Mahadev Silk Mills (Chaudhary)", category: "Saree",
    group: "Saree", mobile: "9327452161", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "12", stallNumber: 12, brand: "Vihanaa Prints", category: "Sarees",
    group: "Saree", mobile: "9913313866", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "13", stallNumber: 13, brand: "Sitaram Creations", category: "Sarees",
    group: "Saree", mobile: "9913314440", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "14", stallNumber: 14, brand: "Charchita Designer", category: "Saree",
    group: "Saree", mobile: "9408990045", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: true },
  { unitId: "15", stallNumber: 15, brand: "Tigza Fashion Hub", category: "",
    group: "General", mobile: "", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Wall Strip", held: true },
  { unitId: "16", stallNumber: 16, brand: "Aalingan Art / Nidhanam", category: "Saree",
    group: "Saree", mobile: "9824886668", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "17", stallNumber: 17, brand: "Gauri Ganesh", category: "Sarees",
    group: "Saree", mobile: "9601700354", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "18", stallNumber: 18, brand: "Durga Textiles / Durga Silk Mills", category: "Sarees",
    group: "Saree", mobile: "9978889174", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "19", stallNumber: 19, brand: "Shiv Vardhaan", category: "Saree",
    group: "Saree", mobile: "7874363994", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "20", stallNumber: 20, brand: "Inder silk mills", category: "Sarees",
    group: "Saree", mobile: "9824150667", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "21", stallNumber: 21, brand: "Amyraa Trends / Pagaria Fashion", category: "Saree",
    group: "Saree", mobile: "9265618713", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Wall Strip", held: false },
  { unitId: "22", stallNumber: 22, brand: "Triveni", category: "Sarees",
    group: "Saree", mobile: "", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "North Hall", held: false },
  { unitId: "23", stallNumber: 23, brand: "Bansi Sarees", category: "Uniform Saree",
    group: "Saree", mobile: "9377609280", sheetSize: "3m x 30m", areaSqft: 1000, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "24", stallNumber: 24, brand: "Shiv Tex", category: "Sarees",
    group: "Saree", mobile: "9638143399", sheetSize: "3m x 30m", areaSqft: 1000, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "25", stallNumber: 25, brand: "Abhaar Vastram", category: "Sarees",
    group: "Saree", mobile: "9979940730", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "26", stallNumber: 26, brand: "Shubh Saachi/Shiv Ganges", category: "Sarees",
    group: "Saree", mobile: "7405442380", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "27", stallNumber: 27, brand: "Indian Women", category: "Sarees",
    group: "Saree", mobile: "9727256154", sheetSize: "3m x 30m", areaSqft: 1000, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "28", stallNumber: 28, brand: "Abhivadan Fashion", category: "Saree , Lehengha",
    group: "Saree", mobile: "9429222300", sheetSize: "3m x 30m", areaSqft: 1000, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "29", stallNumber: 29, brand: "Pikasho", category: "Saree",
    group: "Saree", mobile: "9825267689", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "30", stallNumber: 30, brand: "Jindal Saree Center", category: "Sarees",
    group: "Saree", mobile: "9999991375", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "31", stallNumber: 31, brand: "Sur Shyam/Girraj", category: "Lehenga",
    group: "Lehenga", mobile: "9879892623", sheetSize: "3m x 30m", areaSqft: 1000, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "32", stallNumber: 32, brand: "Suparshva", category: "Saree",
    group: "Saree", mobile: "6353582439", sheetSize: "3m x 24m", areaSqft: 800, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "33", stallNumber: 33, brand: "Mahadev Creations", category: "Sarees",
    group: "Saree", mobile: "9825505610", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "34", stallNumber: 34, brand: "Kodas fashion", category: "Sarees",
    group: "Saree", mobile: "9377012023", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "35", stallNumber: 35, brand: "Sambhav Saree (Samita & Dharaa)", category: "Saree",
    group: "Saree", mobile: "9316721800", sheetSize: "3m x 24m", areaSqft: 800, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "36", stallNumber: 36, brand: "Pagriwala", category: "",
    group: "General", mobile: "9310797518", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "37", stallNumber: 37, brand: "Taani / Turkish Boy", category: "",
    group: "General", mobile: "9999478191", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "38", stallNumber: 38, brand: "Rich Rang", category: "",
    group: "General", mobile: "8750204126", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "39", stallNumber: 39, brand: "Miu-Miu / I Laila / Little Girls / Laila Gold", category: "",
    group: "General", mobile: "8017437639", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "PENDING-39", stallNumber: 39, brand: "SARAOGI SUPER SALES PRIVATE LIMITED", category: "Sarees",
    group: "Saree", mobile: "9810550285", sheetSize: "42m x 6m", areaSqft: 2800, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "40", stallNumber: 40, brand: "Softcore Infotech", category: "",
    group: "General", mobile: "8130017615", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "41", stallNumber: 41, brand: "Metal Bird / Eureca / Nyasia", category: "",
    group: "General", mobile: "9216586012", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "42", stallNumber: 42, brand: "Signature Club", category: "",
    group: "General", mobile: "7456833341", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "43", stallNumber: 43, brand: "Mr.Ethnic", category: "",
    group: "General", mobile: "9839425959", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "44", stallNumber: 44, brand: "Happy Boy / 5G Jeans", category: "",
    group: "General", mobile: "7678947481", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "45", stallNumber: 45, brand: "Ketely", category: "",
    group: "General", mobile: "9582312435", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "46", stallNumber: 46, brand: "Zylo", category: "",
    group: "General", mobile: "7021115281", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "47", stallNumber: 47, brand: "RKF Studio (Men's Ethnic)", category: "",
    group: "General", mobile: "7874954427", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "48", stallNumber: 48, brand: "24 Street", category: "",
    group: "General", mobile: "9883009021", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "49", stallNumber: 49, brand: "Wow Lotus", category: "",
    group: "General", mobile: "9007387489", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "50", stallNumber: 50, brand: "SSS (Saraogi Super Sales)", category: "",
    group: "General", mobile: "9810550285", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "51", stallNumber: 51, brand: "Murtidhara Sarees / Shyamraj", category: "Lehenga",
    group: "Lehenga", mobile: "9016588151", sheetSize: "30m x 6m", areaSqft: 2000, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "52", stallNumber: 52, brand: "Swamee", category: "Saree",
    group: "Saree", mobile: "9374818499", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "53", stallNumber: 53, brand: "Sristi Sarees", category: "Sarees",
    group: "Saree", mobile: "9913590154", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "54", stallNumber: 54, brand: "Surekha", category: "Saree",
    group: "Saree", mobile: "9654554518", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "55", stallNumber: 55, brand: "Bharti Sarees", category: "Sarees",
    group: "Saree", mobile: "9825156704", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "56", stallNumber: 56, brand: "Earth Fabrics", category: "Sarees",
    group: "Saree", mobile: "9820935033", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "57", stallNumber: 57, brand: "Bahubali", category: "Sarees",
    group: "Saree", mobile: "9825231170", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "58", stallNumber: 58, brand: "Samta Sarees", category: "Sarees",
    group: "Saree", mobile: "6353511883", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "59", stallNumber: 59, brand: "Prabhuji", category: "Lehenga",
    group: "Lehenga", mobile: "9909095200", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "60", stallNumber: 60, brand: "Todi Creation", category: "Lehanga",
    group: "Lehenga", mobile: "8141014006", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "61", stallNumber: 61, brand: "Gauri Putra", category: "Lehanga",
    group: "Lehenga", mobile: "9586899777", sheetSize: "3m x 12m", areaSqft: 400, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "62", stallNumber: 62, brand: "Shree Laxmi", category: "Lehenga/Saree",
    group: "Saree", mobile: "9825182005", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "63", stallNumber: 63, brand: "Akashleela", category: "Sarees",
    group: "Saree", mobile: "9879861191", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "64", stallNumber: 64, brand: "Mangal Jyoti", category: "Sarees",
    group: "Saree", mobile: "7574971032", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "65", stallNumber: 65, brand: "Nidhivan / Yogyaa", category: "",
    group: "General", mobile: "7052577725", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "North Hall", held: true },
  { unitId: "66", stallNumber: 66, brand: "Kayaan Prints", category: "Sarees",
    group: "Saree", mobile: "9909313004", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "67", stallNumber: 67, brand: "Radhya Designer", category: "Sarees",
    group: "Saree", mobile: "9510064200", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "68", stallNumber: 68, brand: "Heirlooms", category: "Saree",
    group: "Saree", mobile: "8866666650", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "69", stallNumber: 69, brand: "Krishnam Art", category: "Saree",
    group: "Saree", mobile: "9712972601", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "70", stallNumber: 70, brand: "Jyotsna", category: "Saree",
    group: "Saree", mobile: "9898866093", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "71", stallNumber: 71, brand: "Kesari Nandan", category: "Sarees",
    group: "Saree", mobile: "9825127946", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "73", stallNumber: 73, brand: "Laxmi Creation", category: "Saree",
    group: "Saree", mobile: "9825363009", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "74", stallNumber: 74, brand: "Roots Fabrics", category: "Sarees",
    group: "Saree", mobile: "9825424890", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "75", stallNumber: 75, brand: "Nishcay Sarees / Naisha Synthetics", category: "Saree",
    group: "Saree", mobile: "9377191978", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "76", stallNumber: 76, brand: "Shalini Fashions", category: "Sarees",
    group: "Saree", mobile: "9898297092", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "77", stallNumber: 77, brand: "Satyavachan", category: "Sarees",
    group: "Saree", mobile: "9099941185", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "78", stallNumber: 78, brand: "Kala Shree", category: "Saree",
    group: "Saree", mobile: "9374954037", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "79", stallNumber: 79, brand: "Geeta Readumade / King,s Man", category: "",
    group: "General", mobile: "", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "North Hall", held: true },
  { unitId: "80", stallNumber: 80, brand: "Sarv Kala (V.D)", category: "Sarees",
    group: "Saree", mobile: "9978655007", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "81", stallNumber: 81, brand: "Apple lifestyle", category: "Sarees",
    group: "Saree", mobile: "9825398582", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "82", stallNumber: 82, brand: "Yukti Fashion", category: "Sarees",
    group: "Saree", mobile: "9978524326", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "83", stallNumber: 83, brand: "Rachit Group", category: "Saree",
    group: "Saree", mobile: "9825146981", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "84", stallNumber: 84, brand: "Mintu Fashion", category: "Sarees",
    group: "Saree", mobile: "9913165411", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "85", stallNumber: 85, brand: "Satish Dresses", category: "Uniform Saree",
    group: "Saree", mobile: "9825122634", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "86", stallNumber: 86, brand: "Shangar Tex", category: "Sarees",
    group: "Saree", mobile: "8758832184", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "PENDING-86", stallNumber: 86, brand: "", category: "",
    group: "Saree", mobile: "", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "87", stallNumber: 87, brand: "R.Rudra Creation", category: "Sarees",
    group: "Saree", mobile: "9979691230", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "88", stallNumber: 88, brand: "Hanumanta Lehanga", category: "Lehanga",
    group: "Lehenga", mobile: "9909648249", sheetSize: "3m x 18m", areaSqft: 600, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "89", stallNumber: 89, brand: "Shritik Designer", category: "Saree",
    group: "Saree", mobile: "9081277726", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "90", stallNumber: 90, brand: "Janani Designer World / Janani Dreams Texfab Ltd", category: "Saree / Lengha",
    group: "Saree", mobile: "9586921213", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "91", stallNumber: 91, brand: "Vimarsh Prints", category: "Saree",
    group: "Saree", mobile: "7874442888", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "92", stallNumber: 92, brand: "P.G. Sarees", category: "Sarees",
    group: "Saree", mobile: "9879158404", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "93", stallNumber: 93, brand: "Kairadhya", category: "Sarees",
    group: "Saree", mobile: "9426923797", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "94", stallNumber: 94, brand: "Nirvana Designer", category: "Lehenga",
    group: "Lehenga", mobile: "8347324372", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "95", stallNumber: 95, brand: "Anjali Creation", category: "Sarees",
    group: "Saree", mobile: "9726603807", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "96", stallNumber: 96, brand: "Keshrag PVT.LTD", category: "Saree",
    group: "Saree", mobile: "9824686050", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "97", stallNumber: 97, brand: "Dinesh Textile (D.T)", category: "Sarees",
    group: "Saree", mobile: "9974125112", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "98", stallNumber: 98, brand: "Mahadev NX", category: "Sarees",
    group: "Saree", mobile: "9909220833", sheetSize: "3m x 9m", areaSqft: 300, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "99", stallNumber: 99, brand: "Khatu Shyam", category: "Lehanga Choli",
    group: "Lehenga", mobile: "9825550213", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "PENDING-99", stallNumber: 99, brand: "Saaj Creations", category: "Saree/other",
    group: "Saree", mobile: "9737404150", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "100", stallNumber: 100, brand: "Israni Entertainment", category: "Entertainment",
    group: "Men's Wear", mobile: "9821349444", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "North Hall", held: false },
  { unitId: "101", stallNumber: 101, brand: "Swarnpari Designer / Shiv Ambey Designer", category: "",
    group: "General", mobile: "9099448676", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "North Hall", held: true },
  { unitId: "102", stallNumber: 102, brand: "Nandani Regent", category: "Sarees",
    group: "Saree", mobile: "9924222001", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "103", stallNumber: 103, brand: "K.K. Garments", category: "Fabric/Garment",
    group: "Dress Material & Fabrics", mobile: "9586621717", sheetSize: "3m x 36m", areaSqft: 1200, pool: "General", zone: "North Hall", held: true },
  { unitId: "104", stallNumber: 104, brand: "YKDK", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "105", stallNumber: 105, brand: "Ruby", category: "Saree",
    group: "Saree", mobile: "9829085935", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "North Hall", held: true },
  { unitId: "106", stallNumber: 106, brand: "Vaishnavi Sarees", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "102A", stallNumber: 102, brand: "Veemo Fashions", category: "Saree",
    group: "Saree", mobile: "9979907076", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "107", stallNumber: 107, brand: "Shivay", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "108", stallNumber: 108, brand: "Sonia", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "109", stallNumber: 109, brand: "Shubh Laxmi", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "110", stallNumber: 110, brand: "Mercury", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "111", stallNumber: 111, brand: "Om Ganesh", category: "Kurties",
    group: "Kurti", mobile: "", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "112", stallNumber: 112, brand: "Saaj Creations", category: "Saree",
    group: "Saree", mobile: "9737404150", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "113", stallNumber: 113, brand: "Shankh Designer", category: "Sarees",
    group: "Saree", mobile: "8619183572", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "114", stallNumber: 114, brand: "Reyansh Creation", category: "Saree",
    group: "Saree", mobile: "7383001130", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "115", stallNumber: 115, brand: "Shreya Silk Sarees", category: "Saree",
    group: "Saree", mobile: "7487991498", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "116", stallNumber: 116, brand: "Amipara Sarees", category: "Sarees",
    group: "Saree", mobile: "9898016566", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "117", stallNumber: 117, brand: "Raghav Silk Mills", category: "Sarees",
    group: "Saree", mobile: "7818968985", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "118", stallNumber: 118, brand: "Alokraj Fashion", category: "Saree",
    group: "Saree", mobile: "9374498302", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "119", stallNumber: 119, brand: "Dhanlaxmi Silk Mills", category: "Sarees",
    group: "Saree", mobile: "9375793060", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "120", stallNumber: 120, brand: "Geeta Tex (Ambika)", category: "Suit",
    group: "Suits", mobile: "9879688431", sheetSize: "3m x 30m", areaSqft: 1000, pool: "General", zone: "North Hall", held: false },
  { unitId: "121", stallNumber: 121, brand: "Anaya Designer", category: "Saree",
    group: "Saree", mobile: "9998023918", sheetSize: "3m x 24m", areaSqft: 800, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "122", stallNumber: 122, brand: "Hariom Trendz", category: "Saree",
    group: "Saree", mobile: "9586746162", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: true },
  { unitId: "123", stallNumber: 123, brand: "Talreeja Sarees", category: "Sarees",
    group: "Saree", mobile: "9377404494", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "124", stallNumber: 124, brand: "Siyaram Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "7874253511", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "125", stallNumber: 125, brand: "Sahil Creation", category: "",
    group: "General", mobile: "9825130650", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "North Hall", held: true },
  { unitId: "126", stallNumber: 126, brand: "Ganga Sarees", category: "Sarees",
    group: "Saree", mobile: "9375022000", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "127", stallNumber: 127, brand: "Kanak Priya Art", category: "Sarees",
    group: "Saree", mobile: "9537886611", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "North Hall", held: false },
  { unitId: "128", stallNumber: 128, brand: "Shiv Fashion C K", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9924438132", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "129", stallNumber: 129, brand: "Kunj Bihari Creations", category: "Dress Matterial",
    group: "Dress Material & Fabrics", mobile: "9627868411", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "130", stallNumber: 130, brand: "Mojasia Texo Fab", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "7878536330", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "131", stallNumber: 131, brand: "Vikram Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9537420562", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "132", stallNumber: 132, brand: "Mahadev Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9819582727", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "133", stallNumber: 133, brand: "Ashirwad Textiles", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9725147177", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "134", stallNumber: 134, brand: "Dev Mata Creation", category: "Rajputi Poshak",
    group: "Ethnic & Poshak", mobile: "7878279828", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "135", stallNumber: 135, brand: "Bhagvad Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9377855666", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "136", stallNumber: 136, brand: "Narmada Weavetech", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9375511910", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "137", stallNumber: 137, brand: "Ganesh Fashion", category: "Sarees",
    group: "Saree", mobile: "8980835552", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "South Hall", held: false },
  { unitId: "138", stallNumber: 138, brand: "Pearly Pink", category: "Kids Wear",
    group: "Kids Wear", mobile: "9998862777", sheetSize: "3m x 12m", areaSqft: 400, pool: "General", zone: "South Hall", held: false },
  { unitId: "139", stallNumber: 139, brand: "Dream Delta", category: "Books",
    group: "Home & Other", mobile: "8200203732", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: true },
  { unitId: "139A", stallNumber: 139, brand: "Alok Suit", category: "Suit",
    group: "Suits", mobile: "8469000011", sheetSize: "3m x 12m", areaSqft: 400, pool: "General", zone: "South Hall", held: false },
  { unitId: "140", stallNumber: 140, brand: "Mohilya", category: "",
    group: "General", mobile: "", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: true },
  { unitId: "141", stallNumber: 141, brand: "Raghav Creation", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9830944345", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: true },
  { unitId: "142", stallNumber: 142, brand: "Garden Vareli", category: "Sarees / Dress Material",
    group: "Saree", mobile: "6357238663", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: true },
  { unitId: "143", stallNumber: 143, brand: "NS Fashion", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9737762086", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "143A", stallNumber: 143, brand: "Aashirwad Creation (Aahira)", category: "Men's Wear / Ethnic Fabric",
    group: "Dress Material & Fabrics", mobile: "9274669399", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "143B", stallNumber: 143, brand: "Abhilasha Enterprises", category: "Home Furnishing",
    group: "Home & Other", mobile: "9824131004", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: false },
  { unitId: "144", stallNumber: 144, brand: "J B Designer", category: "Kurti",
    group: "Kurti", mobile: "9545612026", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "South Hall", held: false },
  { unitId: "145", stallNumber: 145, brand: "THe Aakshvik", category: "",
    group: "General", mobile: "", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "South Hall", held: true },
  { unitId: "146", stallNumber: 146, brand: "Dharam Art (S)", category: "Dress Matterial, Kurtie",
    group: "Kurti", mobile: "9879360089", sheetSize: "3m x 12m", areaSqft: 400, pool: "General", zone: "South Hall", held: false },
  { unitId: "147", stallNumber: 147, brand: "Kuhu Creation (Kesari Creation)", category: "Kurti",
    group: "Kurti", mobile: "9925557740", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "South Hall", held: false },
  { unitId: "148", stallNumber: 148, brand: "Poonam Designer", category: "Kurties",
    group: "Kurti", mobile: "9377062128", sheetSize: "3m x 9m", areaSqft: 300, pool: "General", zone: "South Hall", held: false },
  { unitId: "149", stallNumber: 149, brand: "Kama Print N Pack (NBD)", category: "Pack",
    group: "Home & Other", mobile: "9825129301", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "150", stallNumber: 150, brand: "Vighnakarta / Seemaya", category: "Other",
    group: "Home & Other", mobile: "7573975665", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "151", stallNumber: 151, brand: "Siddharth Blouse", category: "Blouses",
    group: "Blouses", mobile: "9998626756", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: false },
  { unitId: "152", stallNumber: 152, brand: "Radhey Silk Weaves", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9374072626", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: true },
  { unitId: "153", stallNumber: 153, brand: "Etallica", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9979883010", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "154", stallNumber: 154, brand: "Shaurya Silk Mills", category: "Men's Wear",
    group: "Men's Wear", mobile: "7359330135", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "155", stallNumber: 155, brand: "Shayam Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9099009117", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "156", stallNumber: 156, brand: "Shakambari Lace House", category: "Lace Materials",
    group: "Dress Material & Fabrics", mobile: "9982170219", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: true },
  { unitId: "157", stallNumber: 157, brand: "Mittoo Suits (Khantil E Com)", category: "Kurties/Suit",
    group: "Kurti", mobile: "9925633987", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: false },
  { unitId: "158", stallNumber: 158, brand: "Ramsha (Gouri Impex)", category: "Kurti / Suits",
    group: "Kurti", mobile: "9374049925", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: false },
  { unitId: "159", stallNumber: 159, brand: "Samarth Creations", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "8980254587", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "160", stallNumber: 160, brand: "Vaani NX", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9726277110", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "161", stallNumber: 161, brand: "Libaas Fashion (AK TRENDZ)", category: "Kurti",
    group: "Kurti", mobile: "9374739383", sheetSize: "3m x 18m", areaSqft: 600, pool: "General", zone: "South Hall", held: true },
  { unitId: "161A", stallNumber: 161, brand: "Sankalp / Jham Fashion", category: "",
    group: "General", mobile: "7719063355", sheetSize: "3m x 12m", areaSqft: 400, pool: "General", zone: "South Hall", held: true },
  { unitId: "162", stallNumber: 162, brand: "Ethnico by Laxmi", category: "Men's Wear",
    group: "Men's Wear", mobile: "9712366161", sheetSize: "3m x 24m", areaSqft: 800, pool: "General", zone: "South Hall", held: false },
  { unitId: "163", stallNumber: 163, brand: "Sweety Fashion", category: "Suits",
    group: "Suits", mobile: "9376711888", sheetSize: "3m x 24m", areaSqft: 800, pool: "General", zone: "South Hall", held: false },
  { unitId: "163A", stallNumber: 163, brand: "Dream Home Fab", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "7016067015", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "164", stallNumber: 164, brand: "Glorry Creation", category: "Kurtis",
    group: "Kurti", mobile: "9638338014", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "165", stallNumber: 165, brand: "Nirham Club Wear", category: "Kurti",
    group: "Kurti", mobile: "8141335579", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: false },
  { unitId: "166", stallNumber: 166, brand: "Jagadamba Creation", category: "Fabrics",
    group: "Dress Material & Fabrics", mobile: "9998675623", sheetSize: "3m x 3m", areaSqft: 100, pool: "General", zone: "South Hall", held: true },
  { unitId: "166A", stallNumber: 166, brand: "Amaya", category: "Lehanga",
    group: "Lehenga", mobile: "8980018801", sheetSize: "3m x 3m", areaSqft: 100, pool: "Saree", zone: "South Hall", held: false },
  { unitId: "167", stallNumber: 167, brand: "Univastra Sarees", category: "Sarees (200)",
    group: "Saree", mobile: "7285010000", sheetSize: "3m x 6m", areaSqft: 200, pool: "Saree", zone: "South Hall", held: false },
  { unitId: "168", stallNumber: 168, brand: "Kushagra", category: "",
    group: "General", mobile: "", sheetSize: "3m x 6m", areaSqft: 200, pool: "General", zone: "South Hall", held: true },
];

/** Stalls the saree brands drew from. */
export const SAREE_POOL_STALLS: number[] = [1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 102, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 123, 126, 127, 166, 167];

/** Bays cut into lettable parts: the 200 sqft bays 91, 107, 136, and 1000 sqft bay 28.
 *  Bay 100 is left whole - the organisers want the 800 sqft anchor let as one stall, not in parts. */
/** Bays cut into lettable parts. Synthetic container numbers (9001+) - not printed anywhere, just an internal grouping key so each half can carry its own real stall id via `halves`. */
export const SPLIT_BAYS_2026: number[] = [9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008];

export function findAllotmentByMobile(mobile: string) {
  const key = mobile.replace(/\D/g, "").slice(-10);
  return ALLOTMENTS_2026.find((a) => a.mobile === key);
}

export function findAllotmentByUnit(unitId: string) {
  const key = unitId.trim().toUpperCase();
  return ALLOTMENTS_2026.find((a) => a.unitId.toUpperCase() === key);
}
