/**
 * Surat Textile Exhibition — Official Company & Banking Details
 * Single source of truth for bill generation, invoices, receipts, and order forms.
 */

export const STE_COMPANY_DETAILS = {
  name: "Surat textile exhibition",
  legalName: "SURAT TEXTILE EXHIBITION",
  shortName: "STE 2026",
  address: "5TH FLOOR SHOP NO.-B/503 TEXTILE MARKET MAGOB Surat",
  phone: "9950787787",
  email: "surattextileexhibition@gmail.com",
  gstin: "24AFOFS4061C1Z3",
  state: "24-Gujarat",
  stateCode: "24",
  bankDetails: {
    accountName: "SURAT TEXTILE EXHIBITION",
    accountNumber: "183805503938",
    ifscCode: "ICIC0001838",
    bankName: "ICICI Bank",
    branch: "Surat",
  },
  eventDetails: {
    eventName: "Surat Textile Exhibition (STE) 2026",
    dates: "September 12-13, 2026",
    venue: "Surat International Exhibition and Convention Centre (SIECC), Sarsana Dome, Surat",
  },
  terms: [
    "100% advance payment is mandatory for confirming additional booth requirements.",
    "All extra item rates are per day and exclude 18% GST (CGST 9% + SGST 9% for Gujarat / IGST 18% for other states).",
    "Bookings are subject to product availability and strict deadline cutoff (5th September 2026, 12:00 PM).",
    "The images in catalog are for booking reference only; final physical product may slightly vary.",
    "Rental items damaged or lost during exhibition period shall be charged at full replacement cost.",
    "All disputes are subject to Surat jurisdiction.",
  ],
} as const;

/**
 * Converts Indian currency numbers to English words (INR standard)
 * E.g. 18500 -> "Eighteen Thousand Five Hundred Rupees Only"
 */
export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(num: number): string {
    if (num === 0) return "";
    if (num < 20) return a[num] + " ";
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "") + " ";
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred " + inWords(num % 100);
    if (num < 100000) return inWords(Math.floor(num / 1000)) + "Thousand " + inWords(num % 1000);
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + "Lakh " + inWords(num % 100000);
    return inWords(Math.floor(num / 10000000)) + "Crore " + inWords(num % 10000000);
  }

  const result = inWords(rounded).trim().replace(/\s+/g, " ");
  return `Rupees ${result} Only`;
}
