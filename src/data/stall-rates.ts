export interface StallRate {
  id: string;
  sizeLabel: string;
  areaSqm: number;
  earlyBirdRate: string;
  standardRate: string;
  isPerStall: boolean;
  inclusions: string[];
  exclusions: string[];
}

export interface StallRatesData {
  earlyBirdDeadline: string;
  gstPercentage: number;
  paymentSchedule: {
    advancePercentage: number;
    advanceDeadline: string;
    balancePercentage: number;
    balanceDeadline: string;
  };
  cancellationPolicy: string;
  rates: StallRate[];
}

export const STALL_RATES_DATA: StallRatesData = {
  earlyBirdDeadline: "31 October 2026",
  gstPercentage: 18,
  paymentSchedule: {
    advancePercentage: 50,
    advanceDeadline: "Upon booking confirmation",
    balancePercentage: 50,
    balanceDeadline: "15 November 2026",
  },
  cancellationPolicy: "50% refund for cancellations before 31 October 2026. No refunds after 31 October 2026.",
  rates: [
    {
      id: "shell-9",
      sizeLabel: "3m x 3m",
      areaSqm: 9,
      earlyBirdRate: "₹85,000 + GST",
      standardRate: "₹95,000 + GST",
      isPerStall: true,
      inclusions: [
        "Octanorm shell scheme with carpet",
        "Fascia name board (white letters)",
        "3 spotlights (100W each)",
        "1 5A power socket (500W load)",
        "1 information counter table & 2 chairs",
        "1 waste basket",
      ],
      exclusions: ["Compressed air line", "High-power 3-phase connection (>1kW)", "Extra furniture"],
    },
    {
      id: "shell-18",
      sizeLabel: "6m x 3m",
      areaSqm: 18,
      earlyBirdRate: "₹1,60,000 + GST",
      standardRate: "₹1,80,000 + GST",
      isPerStall: true,
      inclusions: [
        "Octanorm shell scheme with carpet",
        "Fascia name board on open sides",
        "6 spotlights (100W each)",
        "2 5A power sockets (1kW total load)",
        "2 information counters & 4 chairs",
        "2 waste baskets",
      ],
      exclusions: ["Compressed air line", "Extra power load above 1kW", "Custom wooden backdrop"],
    },
    {
      id: "bare-36",
      sizeLabel: "6m x 6m (Bare Space)",
      areaSqm: 36,
      earlyBirdRate: "₹8,500 / sqm + GST",
      standardRate: "₹9,500 / sqm + GST",
      isPerStall: false,
      inclusions: [
        "Bare hall floor space marked on floor plan",
        "1 15A power connection (2kW load)",
        "Exhibitor badges (8 nos)",
        "Entry in official exhibition directory",
      ],
      exclusions: ["Shell scheme octanorm walls", "Carpet flooring", "Furniture & lighting (must fabricate stand)"],
    },
  ],
};
