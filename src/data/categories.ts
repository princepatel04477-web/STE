export interface CategoryItem {
  slug: string;
  name: string;
  nameHi: string;
  nameGu: string;
  h1: string;
  intro: string;
  buyerNote: string;
  exhibitorCount: string;
  subSegments: string[];
  priceBands: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    slug: "sarees",
    name: "Sarees & Heritage Drapes",
    nameHi: "साड़ियां और पारंपरिक परिधान",
    nameGu: "સાડીઓ અને પરંપરાગત વસ્ત્રો",
    h1: "Saree Wholesalers & Manufacturers at Surat Textile Exhibition 2026",
    intro: "Surat is the premier saree manufacturing hub of India. At STE 2026, over 180 leading saree weavers and print mills showcase Jacquard silk, Banarasi silk weaves, printed georgette, chiffon, organza, and festive wedding saree collections directly to trade buyers.",
    buyerNote: "Direct factory pricing with minimum order quantities (MOQ) tailored for wholesalers, showroom owners, and retail chain buyers.",
    exhibitorCount: "180+ Stalls",
    subSegments: ["Jacquard Silk Sarees", "Printed Georgette & Chiffon", "Organza & Tissue Sarees", "Bandhani & Patola Prints", "Embroidered Wedding Sarees"],
    priceBands: "₹350 to ₹15,000+ per piece (Wholesale)",
  },
  {
    slug: "lehengas",
    name: "Lehengas & Bridal Wear",
    nameHi: "लहंगे और ब्राइडल वियर",
    nameGu: "લહેંગા અને બ્રાઇડલ વિયર્સ",
    h1: "Lehenga Manufacturers at Surat Textile Exhibition 2026",
    intro: "Explore 140+ specialized bridal and festive lehenga manufacturers at STE 2026. Featuring heavy zari work, handwork mirror work, velvet lehengas, and semi-stitched designer chaniya choli sets for the 2026–2027 wedding and festival season.",
    buyerNote: "Exclusive preview of upcoming bridal color palettes, heavy dupatta sets, and customizable designer pieces for boutique owners.",
    exhibitorCount: "140+ Stalls",
    subSegments: ["Bridal Velvet Lehengas", "Silk & Organza Chaniya Cholis", "Designer Anarkali Suit Sets", "Gowns & Indo-Western Wear"],
    priceBands: "₹1,500 to ₹45,000+ per set (Wholesale)",
  },
  {
    slug: "dress-material",
    name: "Dress Material & Unstitched Suits",
    nameHi: "ड्रेस मटेरियल और अनस्टिच सूट",
    nameGu: "ડ્રેસ મટિરિયલ અને અનસ્ટીચ શૂટ્સ",
    h1: "Dress Material Wholesalers at Surat Textile Exhibition 2026",
    intro: "Surat processes millions of meters of unstitched dress material daily. STE 2026 brings together 120+ dress material manufacturers offering pure cotton, chanderi, silk, rayon, and digital printed suit fabrics with matching dupattas.",
    buyerNote: "High-volume catalog sets, wholesale bundle packing, and custom dye-to-order manufacturing for garment brand buyers.",
    exhibitorCount: "120+ Stalls",
    subSegments: ["Catalog Suit Sets", "Digital Printed Rayon & Cotton", "Chanderi & Pashmina Suit Fabric", "Heavy Embroidered Dress Material"],
    priceBands: "₹250 to ₹3,500 per catalog set",
  },
  {
    slug: "embroidery-laces",
    name: "Embroidery, Laces & Trims",
    nameHi: "कढ़ाई, लेस और ट्रिम्स",
    nameGu: "એમ્બ્રોઇડરી, લેસ અને ટ્રીમ્સ",
    h1: "Embroidery & Lace Manufacturers at Surat Textile Exhibition 2026",
    intro: "Surat houses India's highest concentration of multi-head schiffli and computerized embroidery machines. STE 2026 displays 90+ embroidery and lace specialists featuring zari borders, cutwork laces, sequins trims, and garment patches.",
    buyerNote: "Essential sourcing stop for garment exporters, saree manufacturers, and fashion designers seeking custom lace rolls.",
    exhibitorCount: "90+ Stalls",
    subSegments: ["Schiffli Cutwork Laces", "Multi-Head Zari Borders", "Sequin & Mirror Trims", "Crochet & Gota Patti Laces"],
    priceBands: "₹15 to ₹450 per meter",
  },
  {
    slug: "fabrics-greige",
    name: "Synthetic Fabrics & Greige",
    nameHi: "सिंथेटिक फैब्रिक्स और ग्रेज",
    nameGu: "સિન્થેટીક ફેબ્રિક્સ અને ગ્રેજ",
    h1: "Synthetic Fabric Weavers at Surat Textile Exhibition 2026",
    intro: "Raw fabric supply is the engine of Surat's textile industry. STE 2026 hosts 70+ weaving mills showcasing polyester greige, satin, georgette, crepe, organza, and technical synthetic fabrics for processing and printing mills.",
    buyerNote: "Direct mill roll sourcing, customized GSM weaving specifications, and bulk contract pricing for textile processors.",
    exhibitorCount: "70+ Stalls",
    subSegments: ["Polyester Greige Fabric", "Micro-Velvet Base", "Silk-Blend Satin & Organza", "Technical Synthetic Textiles"],
    priceBands: "₹25 to ₹180 per meter (Mill rate)",
  },
  {
    slug: "home-textiles",
    name: "Home Textiles & Furnishings",
    nameHi: "होम टेक्सटाइल और फर्निशिंग",
    nameGu: "હોમ ટેક્સટાઇલ અને ફર્નિશિંગ",
    h1: "Home Textile Manufacturers at Surat Textile Exhibition 2026",
    intro: "Discover 50+ home textile manufacturers presenting jacquard upholstery fabrics, blackout curtains, embroidered cushion covers, table linen, and hotel bedding solutions at STE 2026.",
    buyerNote: "Targeted at home decor retail chains, hospitality procurement managers, and export buying houses.",
    exhibitorCount: "50+ Stalls",
    subSegments: ["Jacquard Upholstery & Cushion Covers", "Blackout Curtains & Drapery", "Bedding & Sheet Sets", "Hotel & Linen Supplies"],
    priceBands: "₹120 to ₹1,200 per meter / piece",
  },
];
