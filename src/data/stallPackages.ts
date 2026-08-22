export interface StallPackage {
  size_sqft: number;
  package_name: string;
  mannequin: number;
  hanger_stand: number;
  exhibition_chairs: number;
  sofa: number;
  reception_table: number;
  rectangular_table: number;
  metal_lights: number;
  plug_points: number;
  dust_bin: number;
  invitation_cards: number;
  digital_invitation_designs: number;
  logo_animated_videos: number;
  newspaper_coverage: number;
  magazine_advertisement: number;
  corner_stall: boolean;
  video_interview: boolean;
  podcast_shoot: boolean;
  reels_5: boolean;
}

export const STALL_PACKAGES: StallPackage[] = [
  {
    size_sqft: 100,
    package_name: "Starter",
    mannequin: 0,
    hanger_stand: 1,
    exhibition_chairs: 2,
    sofa: 0,
    reception_table: 0,
    rectangular_table: 1,
    metal_lights: 2,
    plug_points: 1,
    dust_bin: 1,
    invitation_cards: 10,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: false,
    video_interview: false,
    podcast_shoot: false,
    reels_5: false
  },
  {
    size_sqft: 200,
    package_name: "Basic",
    mannequin: 1,
    hanger_stand: 2,
    exhibition_chairs: 6,
    sofa: 0,
    reception_table: 1,
    rectangular_table: 2,
    metal_lights: 4,
    plug_points: 1,
    dust_bin: 1,
    invitation_cards: 20,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: false,
    video_interview: false,
    podcast_shoot: false,
    reels_5: false
  },
  {
    size_sqft: 300,
    package_name: "Standard",
    mannequin: 2,
    hanger_stand: 3,
    exhibition_chairs: 9,
    sofa: 0,
    reception_table: 1,
    rectangular_table: 3,
    metal_lights: 6,
    plug_points: 1,
    dust_bin: 1,
    invitation_cards: 30,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: false,
    video_interview: false,
    podcast_shoot: false,
    reels_5: false
  },
  {
    size_sqft: 400,
    package_name: "Premium",
    mannequin: 3,
    hanger_stand: 4,
    exhibition_chairs: 12,
    sofa: 1,
    reception_table: 1,
    rectangular_table: 4,
    metal_lights: 8,
    plug_points: 2,
    dust_bin: 1,
    invitation_cards: 40,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: false,
    video_interview: false,
    podcast_shoot: false,
    reels_5: false
  },
  {
    size_sqft: 600,
    package_name: "Pro",
    mannequin: 5,
    hanger_stand: 6,
    exhibition_chairs: 14,
    sofa: 1,
    reception_table: 2,
    rectangular_table: 8,
    metal_lights: 12,
    plug_points: 3,
    dust_bin: 2,
    invitation_cards: 60,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: true,
    video_interview: false,
    podcast_shoot: false,
    reels_5: false
  },
  {
    size_sqft: 800,
    package_name: "Pro Max",
    mannequin: 7,
    hanger_stand: 8,
    exhibition_chairs: 16,
    sofa: 2,
    reception_table: 2,
    rectangular_table: 8,
    metal_lights: 16,
    plug_points: 4,
    dust_bin: 2,
    invitation_cards: 80,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: true,
    video_interview: true,
    podcast_shoot: true,
    reels_5: true
  },
  {
    size_sqft: 1000,
    package_name: "Ultra Pro Max",
    mannequin: 9,
    hanger_stand: 10,
    exhibition_chairs: 20,
    sofa: 2,
    reception_table: 2,
    rectangular_table: 10,
    metal_lights: 20,
    plug_points: 4,
    dust_bin: 2,
    invitation_cards: 100,
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: true,
    video_interview: true,
    podcast_shoot: true,
    reels_5: true
  }
];

/**
 * Given a sqft string (e.g., "200 sq ft", "400", "1200 sq ft") or number,
 * calculates the stall package inclusions additively for sizes > 1000 sq ft.
 */
export function getStallPackageBySqft(sqftInput: string | number | undefined): StallPackage {
  if (!sqftInput) return STALL_PACKAGES[0];

  let numericSqft = typeof sqftInput === "number" ? sqftInput : 0;
  if (typeof sqftInput === "string") {
    const match = sqftInput.match(/\d+/);
    if (match) {
      numericSqft = parseInt(match[0], 10);
    }
  }

  if (isNaN(numericSqft) || numericSqft <= 0) {
    return STALL_PACKAGES[0];
  }

  // Exact match in base list (100, 200, 300, 400, 600, 800, 1000)
  const exact = STALL_PACKAGES.find((pkg) => pkg.size_sqft === numericSqft);
  if (exact) return exact;

  // If numericSqft < 1000 and not an exact match, find closest lower package
  if (numericSqft < 1000) {
    let closest = STALL_PACKAGES[0];
    for (const pkg of STALL_PACKAGES) {
      if (pkg.size_sqft <= numericSqft) {
        closest = pkg;
      }
    }
    return closest;
  }

  // If numericSqft > 1000 (e.g. 1200, 1400, 1500, 1600, 2000):
  // Calculate additively: blocks of 1000 sq ft + remainder block
  const thousandBlocks = Math.floor(numericSqft / 1000);
  const remainderSqft = numericSqft % 1000;

  const pkg1000 = STALL_PACKAGES.find((p) => p.size_sqft === 1000)!;
  const remainderPkg = remainderSqft > 0 ? getStallPackageBySqft(remainderSqft) : null;

  return {
    size_sqft: numericSqft,
    package_name: `Ultra Pro Max (${numericSqft} sq ft)`,
    mannequin: pkg1000.mannequin * thousandBlocks + (remainderPkg ? remainderPkg.mannequin : 0),
    hanger_stand: pkg1000.hanger_stand * thousandBlocks + (remainderPkg ? remainderPkg.hanger_stand : 0),
    exhibition_chairs: pkg1000.exhibition_chairs * thousandBlocks + (remainderPkg ? remainderPkg.exhibition_chairs : 0),
    sofa: pkg1000.sofa * thousandBlocks + (remainderPkg ? remainderPkg.sofa : 0),
    reception_table: pkg1000.reception_table * thousandBlocks + (remainderPkg ? remainderPkg.reception_table : 0),
    rectangular_table: pkg1000.rectangular_table * thousandBlocks + (remainderPkg ? remainderPkg.rectangular_table : 0),
    metal_lights: pkg1000.metal_lights * thousandBlocks + (remainderPkg ? remainderPkg.metal_lights : 0),
    plug_points: pkg1000.plug_points * thousandBlocks + (remainderPkg ? remainderPkg.plug_points : 0),
    dust_bin: pkg1000.dust_bin * thousandBlocks + (remainderPkg ? remainderPkg.dust_bin : 0),
    invitation_cards: pkg1000.invitation_cards * thousandBlocks + (remainderPkg ? remainderPkg.invitation_cards : 0),
    digital_invitation_designs: 2,
    logo_animated_videos: 2,
    newspaper_coverage: 1,
    magazine_advertisement: 1,
    corner_stall: true,
    video_interview: true,
    podcast_shoot: true,
    reels_5: true,
  };
}
