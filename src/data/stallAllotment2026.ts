/**
 * STE 2026 final roster - rebuilt 5 Sep 2026 from ste_final_stall_numbers.xlsx
 * (176 rows: Brand Name / Stall Size / Stall Number / Mobile Number), the
 * organisers' own final list, matched by stall/unit id against the geometry
 * already in stallMap2026.ts (unchanged by this pass - every unit id the new
 * roster names already had a rectangle on the floor). Do not hand-edit;
 * rerun scripts/build_final_2026.py then scripts/build_final_allotment.py.
 *
 * Changes this pass:
 *   - 149 exhibitors carried straight across (same unit, same brand).
 *   - 24 rows updated in place: mostly spelling/mobile corrections; two are
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
 * RESOLVED 6 Sep 2026 (organiser confirmation, not from the sheet):
 *   50   SSS / Saraogi Super Sales - the sheet's own row for unit 50 (brand
 *        "SSS") had no mobile; the organisers confirmed 9810550285 (Saraogi's
 *        known number) belongs here, not on unit 39 (Miu-Miu, which keeps
 *        its own prior mobile untouched). PENDING-39 removed - this is the
 *        same firm, now on a real unit.
 *   104  YKDK - the sheet lists YKDK against unit 102 with no mobile, but
 *        102 already has a different, mobile-bearing claimant (Nandani
 *        Regent) elsewhere in the same sheet - a duplicate stall number in
 *        the organisers' own file. They confirmed YKDK's real unit is 104
 *        (already on the floor, previously mobile-less) and that unit 145's
 *        sheet row (Aakashdip) was carrying YKDK's mobile (7728088199) by
 *        mistake - moved here; Aakashdip's own mobile is still unknown.
 *   15   Divine Silk Mills trades as "Tikza fashion hub" now - same firm,
 *        same mobile (9909789088), already correctly seated here by this
 *        pass (matched on the new name). PENDING-5 removed - it was a
 *        stale duplicate of this same row under the old name, not a
 *        second exhibitor.
 *
 * STILL UNRESOLVED - left exactly as they were, not touched by this pass:
 *   145         Aakashdip - real mobile still unknown since 7728088199
 *               turned out to be YKDK's (see above). No portal access until
 *               a number is collected.
 *   136A        Jai Shree Krishna - no mobile anywhere in the source sheet.
 *               No portal access until a number is collected.
 *
 * RESOLVED 6 Sep 2026 (organiser confirmation, not from the sheet):
 *   79   Geeta Readymade / Kingsman, a HAND-CONFIRMED (held: true) assignment
 *        entirely absent from the new roster with no replacement named for
 *        the unit - brand spelling fixed ("Geeta Readumade / King,s Man" was
 *        a transcription typo) and mobile 9503522336 added, closing the gap
 *        this pass left open.
 *
 * 176 exhibitors on 167 stalls (22 hand-allotted to Triveni Sarees post-pass).
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
  /** Hand-allotted / organiser-issued rather than drawn. */
  held: boolean;
}

export const ALLOTMENTS_2026: Allotment2026[] = [
  { unitId: "1",       stallNumber: 1,    brand: "TITHI DESIGNER", category: "Saree",
    group: "Saree",                     mobile: "8511573752",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "2",       stallNumber: 2,    brand: "Chandwani Silk Mills", category: "",
    group: "General",                   mobile: "9377418152",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Wall Strip",   held: true },
  { unitId: "3",       stallNumber: 3,    brand: "Shreeji Designer / Khushi Fashion", category: "Saree",
    group: "Saree",                     mobile: "9687014347",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "4",       stallNumber: 4,    brand: "Vani Designer", category: "Sarees",
    group: "Saree",                     mobile: "9328539215",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "5",       stallNumber: 5,    brand: "Omkar / Shivrudra", category: "Saree/Lehanga",
    group: "Saree",                     mobile: "9327465454",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "6",       stallNumber: 6,    brand: "Nirvana (Kiran)", category: "Saree",
    group: "Saree",                     mobile: "9898106273",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "7",       stallNumber: 7,    brand: "Vivah Textile", category: "Saree",
    group: "Saree",                     mobile: "9537841621",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "8",       stallNumber: 8,    brand: "Nidhi Creations", category: "",
    group: "General",                   mobile: "9601258092",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Wall Strip",   held: true },
  { unitId: "9",       stallNumber: 9,    brand: "Kokilla fashion", category: "Sarees",
    group: "Saree",                     mobile: "9825385509",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "10",      stallNumber: 10,   brand: "Abhiraj Fashion", category: "Sarees",
    group: "Saree",                     mobile: "9506455565",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "11",      stallNumber: 11,   brand: "Mahadev Silk Mills (Chaudhary)", category: "Saree",
    group: "Saree",                     mobile: "9327452161",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "12",      stallNumber: 12,   brand: "Vihanaa Prints", category: "Sarees",
    group: "Saree",                     mobile: "9913313866",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "13",      stallNumber: 13,   brand: "Sitaram Creations", category: "Sarees",
    group: "Saree",                     mobile: "9913314440",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "14",      stallNumber: 14,   brand: "Charchita Designer", category: "Saree",
    group: "Saree",                     mobile: "9408990045",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: true },
  { unitId: "15",      stallNumber: 15,   brand: "Tikza fashion hub", category: "",
    group: "General",                   mobile: "9909789088",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Wall Strip",   held: true },
  { unitId: "16",      stallNumber: 16,   brand: "Aalingan Art / Nidhanam", category: "Saree",
    group: "Saree",                     mobile: "9824886668",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "17",      stallNumber: 17,   brand: "Gauri Ganesh", category: "Sarees",
    group: "Saree",                     mobile: "9601700354",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "18",      stallNumber: 18,   brand: "Shiv Vardhaan", category: "Sarees",
    group: "Saree",                     mobile: "8804754940",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "19",      stallNumber: 19,   brand: "Durga Textiles / Durga Silk Mills", category: "Saree",
    group: "Saree",                     mobile: "9978889174",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "20",      stallNumber: 20,   brand: "Inder silk mills", category: "Sarees",
    group: "Saree",                     mobile: "9824150667",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "21",      stallNumber: 21,   brand: "Amyraa Trends / Pagaria Fashion", category: "Saree",
    group: "Saree",                     mobile: "9265618713",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Wall Strip",   held: false },
  { unitId: "22",      stallNumber: 22,   brand: "Triveni Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9712720963",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "23",      stallNumber: 23,   brand: "Bansi Sarees", category: "Uniform Saree",
    group: "Saree",                     mobile: "9377609280",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "24",      stallNumber: 24,   brand: "Shiv Tex", category: "Sarees",
    group: "Saree",                     mobile: "9638143399",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "25",      stallNumber: 25,   brand: "Abhaar Vastram", category: "Sarees",
    group: "Saree",                     mobile: "9979940730",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "26",      stallNumber: 26,   brand: "Subh Saachi/Shiv Ganges", category: "Sarees",
    group: "Saree",                     mobile: "9687609749",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "27",      stallNumber: 27,   brand: "Indian Women", category: "Sarees",
    group: "Saree",                     mobile: "9727256154",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "28",      stallNumber: 28,   brand: "Abhivadan Fashion", category: "Saree , Lehengha",
    group: "Saree",                     mobile: "9429222300",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "29",      stallNumber: 29,   brand: "Pikasho", category: "Saree",
    group: "Saree",                     mobile: "9825267689",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "30",      stallNumber: 30,   brand: "Jindal Saree Center", category: "Sarees",
    group: "Saree",                     mobile: "9999991375",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "31",      stallNumber: 31,   brand: "Sur Shyam/Girraj", category: "Lehenga",
    group: "Lehenga",                   mobile: "9879892623",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "32",      stallNumber: 32,   brand: "Suparshva", category: "Saree",
    group: "Saree",                     mobile: "6353582439",  sheetSize: "3m x 24m",  areaSqft: 800,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "33",      stallNumber: 33,   brand: "Mahadev Creations", category: "Sarees",
    group: "Saree",                     mobile: "9825505610",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "34",      stallNumber: 34,   brand: "Kodas", category: "Sarees",
    group: "Saree",                     mobile: "9377012023",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "35",      stallNumber: 35,   brand: "Sambhav Saree (Samita & Dharaa)", category: "Saree",
    group: "Saree",                     mobile: "9316721800",  sheetSize: "3m x 24m",  areaSqft: 800,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "36",      stallNumber: 36,   brand: "Pagriwala", category: "",
    group: "General",                   mobile: "9310797518",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "37",      stallNumber: 37,   brand: "Taani / Turkish Boy", category: "",
    group: "General",                   mobile: "9999478191",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "38",      stallNumber: 38,   brand: "Rich Rang", category: "",
    group: "General",                   mobile: "8750204126",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "39",      stallNumber: 39,   brand: "Miu-Miu", category: "",
    group: "General",                   mobile: "8017437639",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "40",      stallNumber: 40,   brand: "Rajnish Computer", category: "",
    group: "General",                   mobile: "8130017615",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "41",      stallNumber: 41,   brand: "Metal Bird / Eureca / Nyasia", category: "",
    group: "General",                   mobile: "9216586012",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "42",      stallNumber: 42,   brand: "Signature Club", category: "",
    group: "General",                   mobile: "7456833341",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "43",      stallNumber: 43,   brand: "Mr.Ethnic", category: "",
    group: "General",                   mobile: "9839425959",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "44",      stallNumber: 44,   brand: "Happy Boy / 5G Jeans", category: "",
    group: "General",                   mobile: "7678947481",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "45",      stallNumber: 45,   brand: "Ketely", category: "",
    group: "General",                   mobile: "9582312435",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "46",      stallNumber: 46,   brand: "Zylo", category: "",
    group: "General",                   mobile: "7021115281",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "47",      stallNumber: 47,   brand: "RKF Studio (Men's Ethnic)", category: "",
    group: "General",                   mobile: "7874954427",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "48",      stallNumber: 48,   brand: "24 Street", category: "",
    group: "General",                   mobile: "9883009021",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "49",      stallNumber: 49,   brand: "Wow Lotus", category: "",
    group: "General",                   mobile: "9007387489",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "50",      stallNumber: 50,   brand: "SSS", category: "Sarees",
    group: "Saree",                     mobile: "9810550285",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "51",      stallNumber: 51,   brand: "Murtidhara Sarees / Shyamraj", category: "Lehenga",
    group: "Lehenga",                   mobile: "9016588151",  sheetSize: "30m x 6m",  areaSqft: 2000,  pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "52",      stallNumber: 52,   brand: "Swamee", category: "Saree",
    group: "Saree",                     mobile: "9374818499",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "53",      stallNumber: 53,   brand: "Sristi Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9913590154",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "54",      stallNumber: 54,   brand: "Surekha", category: "Saree",
    group: "Saree",                     mobile: "9654554518",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "55",      stallNumber: 55,   brand: "Bharti Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9825156704",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "56",      stallNumber: 56,   brand: "Earth Fabrics", category: "Sarees",
    group: "Saree",                     mobile: "9820935033",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "57",      stallNumber: 57,   brand: "Bahubali", category: "Sarees",
    group: "Saree",                     mobile: "9825231170",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "58",      stallNumber: 58,   brand: "Samta Sarees", category: "Sarees",
    group: "Saree",                     mobile: "6353511883",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "59",      stallNumber: 59,   brand: "Prabhuji", category: "Lehenga",
    group: "Lehenga",                   mobile: "9909095200",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "60",      stallNumber: 60,   brand: "Todi Creation", category: "Lehanga",
    group: "Lehenga",                   mobile: "8141014006",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "61",      stallNumber: 61,   brand: "Gauri Putra", category: "Lehanga",
    group: "Lehenga",                   mobile: "9586899777",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "62",      stallNumber: 62,   brand: "Shree Laxmi", category: "Lehenga/Saree",
    group: "Saree",                     mobile: "9825182005",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "63",      stallNumber: 63,   brand: "Akashleela", category: "Sarees",
    group: "Saree",                     mobile: "9879861191",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "64",      stallNumber: 64,   brand: "Mangal Jyoti Sarees", category: "Sarees",
    group: "Saree",                     mobile: "7574971032",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "65",      stallNumber: 65,   brand: "Nidhivan / Yogayaa", category: "",
    group: "General",                   mobile: "7052577725",  sheetSize: "3m x 9m",   areaSqft: 600,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "66",      stallNumber: 66,   brand: "Kayaan Prints", category: "Sarees",
    group: "Saree",                     mobile: "9909313004",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "67",      stallNumber: 67,   brand: "Radhya Designer", category: "Sarees",
    group: "Saree",                     mobile: "9510064200",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "68",      stallNumber: 68,   brand: "Heirlooms", category: "Saree",
    group: "Saree",                     mobile: "8866666650",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "69",      stallNumber: 69,   brand: "Krishnam Art", category: "Saree",
    group: "Saree",                     mobile: "9712972601",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "70",      stallNumber: 70,   brand: "Jyotsna", category: "Saree",
    group: "Saree",                     mobile: "9898866093",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "71",      stallNumber: 71,   brand: "Kesari Nandan", category: "Sarees",
    group: "Saree",                     mobile: "9825127946",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "73",      stallNumber: 73,   brand: "Laxmi Creation", category: "Saree",
    group: "Saree",                     mobile: "9825363099",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "74",      stallNumber: 74,   brand: "Roots Fabrics", category: "Sarees",
    group: "Saree",                     mobile: "9825424890",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "75",      stallNumber: 75,   brand: "Nishcay Sarees / Naisha Synthetics", category: "Saree",
    group: "Saree",                     mobile: "9377191978",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "76",      stallNumber: 76,   brand: "Shalini Fashions", category: "Sarees",
    group: "Saree",                     mobile: "9898297092",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "77",      stallNumber: 77,   brand: "Satyavachan", category: "Sarees",
    group: "Saree",                     mobile: "9099941185",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "78",      stallNumber: 78,   brand: "Kala Shree", category: "Saree",
    group: "Saree",                     mobile: "9374954037",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "79",      stallNumber: 79,   brand: "Geeta Readymade / Kingsman", category: "",
    group: "General",                   mobile: "9503522336",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "80",      stallNumber: 80,   brand: "Sarv Kala (V.D)", category: "Sarees",
    group: "Saree",                     mobile: "9978655007",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "81",      stallNumber: 81,   brand: "Apple lifestyle", category: "Sarees",
    group: "Saree",                     mobile: "9825398582",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "82",      stallNumber: 82,   brand: "Yukti Fashion", category: "Sarees",
    group: "Saree",                     mobile: "9978524326",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "83",      stallNumber: 83,   brand: "Rachit Group", category: "Saree",
    group: "Saree",                     mobile: "9825146981",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "84",      stallNumber: 84,   brand: "Mintu Fashion", category: "Sarees",
    group: "Saree",                     mobile: "9913165411",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "85",      stallNumber: 85,   brand: "Satish Silk Mills", category: "Uniform Saree",
    group: "Saree",                     mobile: "9825122634",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "86",      stallNumber: 86,   brand: "Shangar Tex", category: "Sarees",
    group: "Saree",                     mobile: "8758832184",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "87",      stallNumber: 87,   brand: "R.RUDRA CREATION LLP", category: "Sarees",
    group: "Saree",                     mobile: "9979691230",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "88",      stallNumber: 88,   brand: "Hanumanta Lehanga", category: "Lehanga",
    group: "Lehenga",                   mobile: "9909648249",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "89",      stallNumber: 89,   brand: "Shritik Designer", category: "Saree",
    group: "Saree",                     mobile: "9978912068",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "90",      stallNumber: 90,   brand: "Janani Designer World / Janani Dreams Texfab Ltd", category: "Saree / Lengha",
    group: "Saree",                     mobile: "9586921213",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "91",      stallNumber: 91,   brand: "Vimarsh Prints", category: "Saree",
    group: "Saree",                     mobile: "7874442888",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "92",      stallNumber: 92,   brand: "P.G. Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9879158404",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "92A",     stallNumber: 92,   brand: "Prabhukripa Synthetics", category: "",
    group: "Home & Other",              mobile: "9374555439",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "93",      stallNumber: 93,   brand: "Kairadhya", category: "Sarees",
    group: "Saree",                     mobile: "9426923797",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "94",      stallNumber: 94,   brand: "Nirvana Designer", category: "Lehenga",
    group: "Lehenga",                   mobile: "8347324372",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "95",      stallNumber: 95,   brand: "Anjali Creation", category: "Sarees",
    group: "Saree",                     mobile: "9726603807",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "96",      stallNumber: 96,   brand: "Keshrag PVT.LTD", category: "Saree",
    group: "Saree",                     mobile: "9824686050",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "97",      stallNumber: 97,   brand: "Dinesh Textile (D.T)", category: "Sarees",
    group: "Saree",                     mobile: "9974125112",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "98",      stallNumber: 98,   brand: "Mahadev NX", category: "Sarees",
    group: "Saree",                     mobile: "9909220833",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "99",      stallNumber: 99,   brand: "Khatu Shyam", category: "Lehanga Choli",
    group: "Lehenga",                   mobile: "9825550213",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "100",     stallNumber: 100,  brand: "Israni Entertainment", category: "Entertainment",
    group: "Men's Wear",                mobile: "9821349444",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "North Hall",         held: false },
  { unitId: "101",     stallNumber: 101,  brand: "Swarnpari Design", category: "",
    group: "General",                   mobile: "9099448676",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "102",     stallNumber: 102,  brand: "Nandani Regent", category: "Sarees",
    group: "Saree",                     mobile: "9924222001",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "102A",    stallNumber: 102,  brand: "Veemoo Fashions", category: "Saree",
    group: "Saree",                     mobile: "9979907076",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "103",     stallNumber: 103,  brand: "K.K. Garments", category: "Fabric/Garment",
    group: "Dress Material & Fabrics",  mobile: "9586621717",  sheetSize: "3m x 36m",  areaSqft: 1200,  pool: "General",  zone: "North Hall",         held: true },
  { unitId: "104",     stallNumber: 104,  brand: "YKDK", category: "Kurties",
    group: "Kurti",                     mobile: "7728088199",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "105",     stallNumber: 105,  brand: "Ruby", category: "Saree",
    group: "Saree",                     mobile: "9829085935",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "106",     stallNumber: 106,  brand: "Vaishnavi Sarees", category: "Kurties",
    group: "Kurti",                     mobile: "9983545202",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "107",     stallNumber: 107,  brand: "Shivaay Cotoure", category: "Kurties",
    group: "Kurti",                     mobile: "8882750260",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "108",     stallNumber: 108,  brand: "Soniya creation", category: "Kurties",
    group: "Kurti",                     mobile: "8003772130",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "109",     stallNumber: 109,  brand: "Shubh laxmi", category: "Kurties",
    group: "Kurti",                     mobile: "9352924452",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "110",     stallNumber: 110,  brand: "Mercury Fashion", category: "Kurties",
    group: "Kurti",                     mobile: "6376473726",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "111",     stallNumber: 111,  brand: "Om Ganesh Fashion", category: "Kurties",
    group: "Kurti",                     mobile: "9829084015",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "112",     stallNumber: 112,  brand: "Saaj Creations", category: "Saree",
    group: "Saree",                     mobile: "9737404150",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "113",     stallNumber: 113,  brand: "SHANKH DESIGNER", category: "Sarees",
    group: "Saree",                     mobile: "8619183572",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "114",     stallNumber: 114,  brand: "Reyansh Creation", category: "Saree",
    group: "Saree",                     mobile: "7383001130",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "115",     stallNumber: 115,  brand: "Shreya Silk Sarees", category: "Saree",
    group: "Saree",                     mobile: "7487991498",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "116",     stallNumber: 116,  brand: "Amipara Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9898016566",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "117",     stallNumber: 117,  brand: "Raghav Silk Mills", category: "Sarees",
    group: "Saree",                     mobile: "7818968985",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "118",     stallNumber: 118,  brand: "Alokraj Fashion", category: "Saree",
    group: "Saree",                     mobile: "9374498302",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "119",     stallNumber: 119,  brand: "Dhanlaxmi Silk Mills", category: "Sarees",
    group: "Saree",                     mobile: "9375793060",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "120",     stallNumber: 120,  brand: "Geeta Tex (Ambika)", category: "Suit",
    group: "Suits",                     mobile: "9879688431",  sheetSize: "3m x 30m",  areaSqft: 1000,  pool: "General",  zone: "North Hall",         held: false },
  { unitId: "121",     stallNumber: 121,  brand: "Anaya Designer", category: "Saree",
    group: "Saree",                     mobile: "9998023918",  sheetSize: "3m x 24m",  areaSqft: 800,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "122",     stallNumber: 122,  brand: "Hariom Trendz", category: "Saree",
    group: "Saree",                     mobile: "9586746162",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: true },
  { unitId: "123",     stallNumber: 123,  brand: "Talreja Saree", category: "Sarees",
    group: "Saree",                     mobile: "9377404494",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "124",     stallNumber: 124,  brand: "Siyaram Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "7874253511",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "125",     stallNumber: 125,  brand: "Sahil Creation", category: "",
    group: "General",                   mobile: "9825130650",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "North Hall",         held: true },
  { unitId: "126",     stallNumber: 126,  brand: "Ganga Sarees", category: "Sarees",
    group: "Saree",                     mobile: "9375022000",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "127",     stallNumber: 127,  brand: "Kanak Priya Art", category: "Sarees",
    group: "Saree",                     mobile: "9537886611",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "North Hall",         held: false },
  { unitId: "128",     stallNumber: 128,  brand: "Shiv Fashion C K", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9924438132",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "129",     stallNumber: 129,  brand: "Kunj Bihari Creations", category: "Dress Matterial",
    group: "Dress Material & Fabrics",  mobile: "9627868411",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "130",     stallNumber: 130,  brand: "Mojasia Texo Fab", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "7878536330",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "131",     stallNumber: 131,  brand: "Vikram Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9537420562",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "132",     stallNumber: 132,  brand: "Mahadev Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9819582727",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "133",     stallNumber: 133,  brand: "Ashirwad Textiles", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9725147177",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "134",     stallNumber: 134,  brand: "Dev Mata Creation", category: "Rajputi Poshak",
    group: "Ethnic & Poshak",           mobile: "7878279828",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "135",     stallNumber: 135,  brand: "Bhagvad Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9377855666",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "136",     stallNumber: 136,  brand: "Narmada Weavetech", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9375511910",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "136A",    stallNumber: 136,  brand: "Jai Shree Krishna", category: "",
    group: "Home & Other",              mobile: "",            sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "137",     stallNumber: 137,  brand: "SAHVIKA", category: "Sarees",
    group: "Saree",                     mobile: "8980835552",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "Saree",    zone: "South Hall",         held: false },
  { unitId: "138",     stallNumber: 138,  brand: "Pearly Pink", category: "Kids Wear",
    group: "Kids Wear",                 mobile: "9998862777",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "139",     stallNumber: 139,  brand: "Dream Delta", category: "Books",
    group: "Home & Other",              mobile: "8200203732",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "139A",    stallNumber: 139,  brand: "Alok Suit", category: "Suit",
    group: "Suits",                     mobile: "8469000011",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "140",     stallNumber: 140,  brand: "Mohilya", category: "",
    group: "General",                   mobile: "9722771233",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "141",     stallNumber: 141,  brand: "Raghav Creation", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9830944345",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "142",     stallNumber: 142,  brand: "Garden Vareli", category: "Sarees / Dress Material",
    group: "Saree",                     mobile: "6357238663",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "143",     stallNumber: 143,  brand: "NS Fashion", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9737762086",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "143A",    stallNumber: 143,  brand: "Aashirwad Creation  (Aahira)", category: "Men's Wear / Ethnic Fabric",
    group: "Dress Material & Fabrics",  mobile: "9274669399",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "143B",    stallNumber: 143,  brand: "Abhilasha Enterprises", category: "Home Furnishing",
    group: "Home & Other",              mobile: "9824131004",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "144",     stallNumber: 144,  brand: "J B Designer", category: "Kurti",
    group: "Kurti",                     mobile: "9545612026",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "145",     stallNumber: 145,  brand: "Aakashdip", category: "",
    group: "General",                   mobile: "",            sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "146",     stallNumber: 146,  brand: "Dharam Art (S)", category: "Dress Matterial, Kurtie",
    group: "Kurti",                     mobile: "9879360089",  sheetSize: "3m x 12m",  areaSqft: 400,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "147",     stallNumber: 147,  brand: "Kuhu Creation (Kesari Creation)", category: "Kurti",
    group: "Kurti",                     mobile: "9925557740",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "148",     stallNumber: 148,  brand: "Poonam Designer", category: "Kurties",
    group: "Kurti",                     mobile: "9377062128",  sheetSize: "3m x 9m",   areaSqft: 300,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "149",     stallNumber: 149,  brand: "NBD MARKET HUB PRIVATE LIMITED", category: "Pack",
    group: "Home & Other",              mobile: "9825129301",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "150",     stallNumber: 150,  brand: "Vighnakarta / Seemaya", category: "Other",
    group: "Home & Other",              mobile: "7573975665",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "151",     stallNumber: 151,  brand: "Siddharth Blouse", category: "Blouses",
    group: "Blouses",                   mobile: "9998626756",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "152",     stallNumber: 152,  brand: "RADHEY GROUP", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9374072626",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "153",     stallNumber: 153,  brand: "Etallica", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9979883010",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "154",     stallNumber: 154,  brand: "Shaurya Silk Mills", category: "Men's Wear",
    group: "Men's Wear",                mobile: "7359330135",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "155",     stallNumber: 155,  brand: "Shayam Fabrics", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9099009117",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "156",     stallNumber: 156,  brand: "Shakambari Lace House", category: "Lace Materials",
    group: "Dress Material & Fabrics",  mobile: "9982170219",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "157",     stallNumber: 157,  brand: "Mittoo Suits (Khantil E Com)", category: "Kurties/Suit",
    group: "Kurti",                     mobile: "9925633987",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "158",     stallNumber: 158,  brand: "Ramsha (Gouri Impex)", category: "Kurti / Suits",
    group: "Kurti",                     mobile: "9374049925",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "159",     stallNumber: 159,  brand: "Samarth Creations", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "8980254587",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "160",     stallNumber: 160,  brand: "Vaani NX", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9726277110",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "161",     stallNumber: 161,  brand: "Libaas Fashion (AK TRENDZ)", category: "Kurti",
    group: "Kurti",                     mobile: "9374739383",  sheetSize: "3m x 18m",  areaSqft: 600,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "161A",    stallNumber: 161,  brand: "SANKALP", category: "",
    group: "General",                   mobile: "7719063355",  sheetSize: "3m x 12m",  areaSqft: 200,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "162",     stallNumber: 162,  brand: "Ethnico by Laxmi", category: "Men's Wear",
    group: "Men's Wear",                mobile: "9712366161",  sheetSize: "3m x 24m",  areaSqft: 800,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "163",     stallNumber: 163,  brand: "Sweety Fashion", category: "Suits",
    group: "Suits",                     mobile: "9376711888",  sheetSize: "3m x 24m",  areaSqft: 800,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "163A",    stallNumber: 163,  brand: "Dream Home Fab", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "7016067015",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "164",     stallNumber: 164,  brand: "Glorry Creation", category: "Kurtis",
    group: "Kurti",                     mobile: "9638338014",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "165",     stallNumber: 165,  brand: "Nirham Club Wear", category: "Kurti",
    group: "Kurti",                     mobile: "8141335579",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
  { unitId: "166",     stallNumber: 166,  brand: "Jagadamba Creation", category: "Fabrics",
    group: "Dress Material & Fabrics",  mobile: "9998675623",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "General",  zone: "South Hall",         held: true },
  { unitId: "166A",    stallNumber: 166,  brand: "Amaya", category: "Lehanga",
    group: "Lehenga",                   mobile: "8980018801",  sheetSize: "3m x 3m",   areaSqft: 100,   pool: "Saree",    zone: "South Hall",         held: false },
  { unitId: "167",     stallNumber: 167,  brand: "Univastra Sarees", category: "Sarees (200)",
    group: "Saree",                     mobile: "7285010000",  sheetSize: "3m x 6m",   areaSqft: 400,   pool: "Saree",    zone: "South Hall",         held: false },
  { unitId: "168",     stallNumber: 168,  brand: "Kushagra", category: "",
    group: "General",                   mobile: "9151060275",  sheetSize: "3m x 6m",   areaSqft: 200,   pool: "General",  zone: "South Hall",         held: false },
];

/** Stalls the saree brands drew from (unchanged by this pass). */
export const SAREE_POOL_STALLS: number[] = [1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 102, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 123, 126, 127, 166, 167];

/**
 * Every bay stallOccupancy.ts must expand into its own lettered halves
 * rather than count as one unit keyed by its bare stall number: 91 and 107
 * from the original layout, plus the eight synthetic 9001-9008 container
 * keys the 5 Sep 2026 layout introduced for a lettered pair/solo that no
 * longer shares its numeral with a real bare stall (136A, 139A, 166A,
 * 163A, 143A/143B, 161A, 92A, 102A - see stallMap2026.ts's own header).
 * Leaving the 9000s out of this list was the bug behind /admin/lottery
 * showing them as still-free: every one of those halves already has a
 * real exhibitor on stallAllotment2026.ts, but nothing has ever been
 * allotted against the literal id "9001", so the occupancy join found no
 * match and reported the whole container empty.
 */
export const SPLIT_BAYS_2026: number[] = [91, 107, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008];

export function findAllotmentByMobile(mobile: string) {
  const key = mobile.replace(/\D/g, "").slice(-10);
  return ALLOTMENTS_2026.find((a) => a.mobile === key);
}

export function findAllotmentByUnit(unitId: string) {
  const key = unitId.trim().toUpperCase();
  return ALLOTMENTS_2026.find((a) => a.unitId.toUpperCase() === key);
}
