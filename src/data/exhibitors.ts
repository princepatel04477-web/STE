export interface Exhibitor {
  id: string;
  companyName: string;
  slug: string;
  categories: string[];
  stallNumber: string;
  hall: string;
  city: string;
  description?: string;
  logo?: string;
  website?: string;
  isConfirmed: boolean;
}

export const EXHIBITORS_DATA: Exhibitor[] = [
  {
    id: "ex-01",
    companyName: "Vraj Creation Pvt Ltd",
    slug: "vraj-creation",
    categories: ["Sarees", "Heritage Drapes"],
    stallNumber: "A-05",
    hall: "Hall A",
    city: "Surat",
    description: "Leading manufacturer of designer Jacquard silk sarees, printed georgette sarees, and traditional Bandhani collections with nationwide wholesale distribution.",
    isConfirmed: true,
  },
  {
    id: "ex-02",
    companyName: "Shree Ramdev Synthetics",
    slug: "shree-ramdev-synthetics",
    categories: ["Fabrics & Greige", "Dress Material"],
    stallNumber: "A-12",
    hall: "Hall A",
    city: "Surat",
    description: "Specializing in premium polyester greige fabric, micro-velvet, organza, and schiffli base fabrics for garment manufacturers.",
    isConfirmed: true,
  },
  {
    id: "ex-03",
    companyName: "Kala Fashions & Laces",
    slug: "kala-fashions-laces",
    categories: ["Embroidery & Laces"],
    stallNumber: "A-18",
    hall: "Hall A",
    city: "Surat",
    description: "Pioneers in high-density Multi-head embroidery laces, zari borders, handwork mirrors, and bridal garment trims.",
    isConfirmed: true,
  },
  {
    id: "ex-04",
    companyName: "Mahavir Couture Lehengas",
    slug: "mahavir-couture",
    categories: ["Lehengas & Bridal Wear"],
    stallNumber: "A-24",
    hall: "Hall A",
    city: "Surat",
    description: "Wholesale manufacturers of heavy bridal lehengas, semi-stitched festive chaniya choli sets, and designer Anarkali suits.",
    isConfirmed: true,
  },
  {
    id: "ex-05",
    companyName: "Navkar Print & Dyeing Mills",
    slug: "navkar-print-dyeing",
    categories: ["Dress Material", "Sarees"],
    stallNumber: "B-03",
    hall: "Hall B",
    city: "Surat",
    description: "High-capacity digital textile printing unit specializing in digital silk dupattas, rayon suit sets, and kurti fabrics.",
    isConfirmed: true,
  },
  {
    id: "ex-06",
    companyName: "Parasmani Home Furnishings",
    slug: "parasmani-home-furnishings",
    categories: ["Home Textiles"],
    stallNumber: "B-15",
    hall: "Hall B",
    city: "Surat",
    description: "Manufacturers of jacquard sofa covers, blackout curtains, embroidered cushion covers, and hotel linen supplies.",
    isConfirmed: true,
  },
];

export function getConfirmedExhibitors(): Exhibitor[] {
  return EXHIBITORS_DATA.filter((e) => e.isConfirmed);
}
