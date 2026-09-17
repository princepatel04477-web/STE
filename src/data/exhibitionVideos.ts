export interface ExhibitionReel {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  category: "all" | "ceremony" | "fashion" | "exhibition" | "bts";
  tagEn: string;
  tagHi: string;
  duration: string;
  videoSrc: string;
  posterSrc: string;
  descriptionEn: string;
  descriptionHi: string;
}

export type ExhibitionVideo = ExhibitionReel;

export const EXHIBITION_REELS: ExhibitionReel[] = [
  {
    id: "ste-anthem",
    titleEn: "STE 2026 Grand Anthem & Teaser",
    titleHi: "STE 2026 भव्य गान और टीज़र",
    subtitleEn: "Surat Textile Expo Official Theme",
    subtitleHi: "सूरत टेक्सटाइल एक्सपो आधिकारिक थीम",
    category: "exhibition",
    tagEn: "Official Anthem",
    tagHi: "आधिकारिक थीम",
    duration: "0:20",
    videoSrc: "/assets/video/reels/ste-anthem.mp4",
    posterSrc: "/assets/images/reels/ste-anthem.webp",
    descriptionEn: "Feel the vibrant pulse of India's textile capital with the official Surat Textile Expo 2026 anthem.",
    descriptionHi: "सूरत टेक्सटाइल एक्सपो 2026 के आधिकारिक थीम गान के साथ भारत की कपड़ा राजधानी की ऊर्जा को महसूस करें।",
  },
  {
    id: "ribbon-cutting",
    titleEn: "Grand Inauguration & Ribbon Cutting",
    titleHi: "भव्य उद्घाटन और रिबन कटिंग",
    subtitleEn: "Official Opening at Sarsana Dome",
    subtitleHi: "सरसाना डोम में आधिकारिक उद्घाटन समारोह",
    category: "ceremony",
    tagEn: "Inauguration",
    tagHi: "उद्घाटन समारोह",
    duration: "0:25",
    videoSrc: "/assets/video/reels/ribbon-cutting.mp4",
    posterSrc: "/assets/images/reels/ribbon-cutting.webp",
    descriptionEn: "Dignitaries and textile industry stalwarts cutting the inaugural ribbon to open Surat Textile Expo 2026.",
    descriptionHi: "सूरत टेक्सटाइल एक्सपो 2026 के भव्य शुभारंभ के लिए गणमान्य अतिथि और उद्योग के दिग्गज रिबन काटते हुए।",
  },
  {
    id: "vip-welcome",
    titleEn: "VIP Welcome & Dignitaries Delegation",
    titleHi: "वीआईपी स्वागत और गणमान्य अतिथि",
    subtitleEn: "Garland Ceremony & Industry Leaders",
    subtitleHi: "माला समारोह और उद्योग के दिग्गज",
    category: "ceremony",
    tagEn: "VIP Reception",
    tagHi: "वीआईपी स्वागत",
    duration: "0:37",
    videoSrc: "/assets/video/reels/vip-welcome.mp4",
    posterSrc: "/assets/images/reels/vip-welcome.webp",
    descriptionEn: "Traditional welcoming of national wholesale delegates and federation leaders with garlands and fanfare.",
    descriptionHi: "माला और पारंपरिक उत्साह के साथ राष्ट्रीय थोक प्रतिनिधियों और उद्योग संघ के नेताओं का स्वागत।",
  },
  {
    id: "fashion-show-01",
    titleEn: "Runway Fashion Gala — Part 1",
    titleHi: "रनवे फैशन शो — भाग 1",
    subtitleEn: "Designer Sarees & Ethnic Grandeur",
    subtitleHi: "डिजाइनर साड़ियाँ और एथनिक परिधान",
    category: "fashion",
    tagEn: "Runway Showcase",
    tagHi: "रनवे फैशन",
    duration: "0:41",
    videoSrc: "/assets/video/reels/fashion-show-01.mp4",
    posterSrc: "/assets/images/reels/fashion-show-01.webp",
    descriptionEn: "Models grace the STE runway unveiling Surat's finest woven sarees, embroidered fabrics, and ethnic collections.",
    descriptionHi: "मॉडल STE रनवे पर सूरत की बेहतरीन बुनी हुई साड़ियों, कढ़ाई वाले कपड़ों और एथनिक परिधानों का प्रदर्शन करते हुए।",
  },
  {
    id: "fashion-show-02",
    titleEn: "Runway Fashion Gala — Part 2",
    titleHi: "रनवे फैशन शो — भाग 2",
    subtitleEn: "Bridal Couture & Contemporary Drapes",
    subtitleHi: "ब्राइडल परिधान और आधुनिक ड्रेप्स",
    category: "fashion",
    tagEn: "Bridal Couture",
    tagHi: "ब्राइडल कौटूर",
    duration: "1:04",
    videoSrc: "/assets/video/reels/fashion-show-02.mp4",
    posterSrc: "/assets/images/reels/fashion-show-02.webp",
    descriptionEn: "Exclusive bridal lehengas, fusion gowns, and high-fashion textile artistry showcased under the dome spotlights.",
    descriptionHi: "सरसाना डोम की रोशनी में प्रदर्शित विशेष ब्राइडल लहंगे, फ्यूजन गाउन और उच्च-स्तरीय कपड़ा कला।",
  },
  {
    id: "day-2-highlights",
    titleEn: "Day 2 Highlights & Mill Deals",
    titleHi: "दूसरे दिन की मुख्य बातें और मिल सौदे",
    subtitleEn: "Peak Trading Hours & Contract Signings",
    subtitleHi: "व्यापार का चरम समय और अनुबंध",
    category: "exhibition",
    tagEn: "Day 2 Highlights",
    tagHi: "दिन 2 मुख्य बातें",
    duration: "0:53",
    videoSrc: "/assets/video/reels/day-2-highlights.mp4",
    posterSrc: "/assets/images/reels/day-2-highlights.webp",
    descriptionEn: "Record-breaking buyer footfall, on-the-spot container bookings, and energetic trade negotiations across stalls.",
    descriptionHi: "स्टॉलों पर रिकॉर्ड तोड़ खरीदारों की संख्या, ऑन-द-स्पॉट कंटेनर बुकिंग और सक्रिय व्यापार सौदे।",
  },
  {
    id: "visitors-highlight",
    titleEn: "8,000+ Trade Buyers & Visitor Rush",
    titleHi: "8,000+ व्यापार खरीदार और आगंतुक",
    subtitleEn: "PAN-India Wholesalers & Retail Chains",
    subtitleHi: "अखिल भारतीय थोक व्यापारी और रिटेल चेन",
    category: "exhibition",
    tagEn: "Buyer Rush",
    tagHi: "खरीदारों की भीड़",
    duration: "0:40",
    videoSrc: "/assets/video/reels/visitors-highlight.mp4",
    posterSrc: "/assets/images/reels/visitors-highlight.webp",
    descriptionEn: "Massive crowd of genuine wholesale purchasers, boutique owners, and institutional sourcing heads exploring the pavilions.",
    descriptionHi: "सूरत एक्सपो के विभिन्न पवेलियनों का अन्वेषण करते वास्तविक थोक खरीदारों और बुटीक मालिकों की भारी भीड़।",
  },
  {
    id: "surat-expo-israni",
    titleEn: "Exclusive Trade & Fabric Showcase",
    titleHi: "विशेष व्यापार और फैब्रिक शोकेस",
    subtitleEn: "Premium Stall Walkthrough & Collections",
    subtitleHi: "प्रीमियम स्टॉल वॉकथ्रू और कलेक्शन",
    category: "exhibition",
    tagEn: "Trade Walkthrough",
    tagHi: "ट्रेड वॉकथ्रू",
    duration: "0:38",
    videoSrc: "/assets/video/reels/surat-expo-israni.mp4",
    posterSrc: "/assets/images/reels/surat-expo-israni.webp",
    descriptionEn: "Curated walkthrough capturing luxury exhibitor booths, fabric drape displays, and buyer interactions.",
    descriptionHi: "लक्जरी प्रदर्शक बूथों, फैब्रिक ड्रेप डिस्प्ले और खरीदार संवादों को दर्शाता विशेष वॉकथ्रू।",
  },
  {
    id: "bts-dome-setup",
    titleEn: "Behind The Scenes & Dome Build",
    titleHi: "पर्दे के पीछे और डोम की तैयारी",
    subtitleEn: "Building Surat's Largest Textile Arena",
    subtitleHi: "सूरत के सबसे बड़े टेक्सटाइल क्षेत्र का निर्माण",
    category: "bts",
    tagEn: "Behind The Scenes",
    tagHi: "पर्दे के पीछे",
    duration: "1:06",
    videoSrc: "/assets/video/reels/bts-dome-setup.mp4",
    posterSrc: "/assets/images/reels/bts-dome-setup.webp",
    descriptionEn: "The monumental effort behind engineering the 650+ stall floorplan, acoustic rigging, and luxury VIP lounges.",
    descriptionHi: "650+ स्टॉल फ्लोरप्लान, लाइटिंग और लक्जरी वीआईपी लाउंज तैयार करने के पीछे की भव्य तैयारी।",
  },
];

export const EXHIBITION_VIDEOS: ExhibitionVideo[] = EXHIBITION_REELS;
