/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { waapi } from "animejs";
import { X, Eye } from "lucide-react";

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
  aspect: string;
}

const galleryData: GalleryImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    title: "Traditional Saree Pavilion",
    category: "Sarees",
    aspect: "aspect-[4/3]"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    title: "Luxury Lehenga Exhibition",
    category: "Lehenga",
    aspect: "aspect-[3/4]"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800&auto=format&fit=crop",
    title: "Designer Kurti Showcase",
    category: "Kurti",
    aspect: "aspect-[1/1]"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1594552072648-b4004a7a598f?q=80&w=800&auto=format&fit=crop",
    title: "Exquisite Bridal Fabrics",
    category: "Wedding Market",
    aspect: "aspect-[3/4]"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
    title: "Corporate B2B Buyer Meet",
    category: "Networking",
    aspect: "aspect-[4/3]"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    title: "Men's Sherwani & Ethnic Sourcing",
    category: "Sherwani",
    aspect: "aspect-[1/1]"
  }
];

export default function GallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);

  // Stagger reveal on scroll
  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll(".gallery-item");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(Array.from(items) as any, {
                opacity: [0, 1],
                scale: [0.95, 1],
                translate: ["0 30px", "0 0px"],
                delay: (el, i) => i * 80,
                duration: 700,
                ease: "outExpo"
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05 }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section id="gallery" className="relative w-full py-32 px-6 bg-expo-black">
      
      {/* Background Visual Enhancements */}
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-[30%] right-[10%] w-[450px] h-[450px] bg-expo-copper/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-expo-gold font-medium mb-3">Expo Showroom</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-expo-warm mb-6">
            EXHIBITION GALLERY
          </h2>
          <div className="w-20 h-[1.5px] bg-expo-gold" />
          <p className="mt-6 text-sm text-expo-warm/50 max-w-lg font-sans">
            Glimpse into the scale, precision machinery, high-volume sourcing pavilions, and premium textiles of past events.
          </p>
        </div>

        {/* Masonry Columns Layout / Mobile Snap Scroll */}
        <div className="relative w-full">
          {/* Edge Fade Gradients on Mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none sm:hidden" />

          <div 
            ref={containerRef} 
            className="flex gap-6 overflow-x-auto sm:block sm:columns-2 lg:columns-3 sm:space-y-6 gap-y-0 sm:gap-6 snap-x snap-mandatory scrollbar-none pb-6 sm:pb-0 w-full"
            style={{
              overscrollBehaviorX: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {galleryData.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImg(img)}
                className={`gallery-item scroll-snap-card opacity-0 flex-shrink-0 w-[78vw] sm:w-auto snap-start sm:snap-none group relative overflow-hidden rounded-xl border border-expo-border/50 bg-expo-midnight cursor-pointer transition-all duration-700 hover:border-expo-gold/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${img.aspect} break-inside-avoid sm:mb-6`}
              >
                {/* Image Component */}
                <div className="relative w-full h-full">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-all duration-1000 ease-luxury group-hover:scale-105 filter brightness-[0.8] group-hover:brightness-100"
                  />
                </div>

                {/* Hover Dark Overlay and Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-expo-midnight via-expo-midnight/40 to-transparent opacity-0 group-hover:opacity-95 transition-opacity duration-500 flex flex-col justify-end p-6 select-none">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-expo-gold font-semibold mb-1">
                        {img.category}
                      </span>
                      <h4 className="font-display text-lg tracking-wide text-expo-warm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-luxury">
                        {img.title}
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-expo-gold flex items-center justify-center text-expo-midnight transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-luxury">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Grid outline highlights */}
                <div className="absolute inset-0 border border-transparent group-hover:border-expo-gold/20 rounded-xl pointer-events-none transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-expo-midnight/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImg(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-expo-warm/65 hover:text-expo-warm p-2 bg-expo-black/60 rounded-full border border-expo-border hover:border-expo-gold transition-colors z-55"
            onClick={() => setSelectedImg(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Image Container */}
          <div 
            className="relative w-full max-w-4xl h-[75vh] md:h-[80vh] overflow-hidden rounded-2xl border border-expo-border/80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImg.src}
              alt={selectedImg.title}
              fill
              className="object-contain"
            />
            {/* Overlay Details */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-expo-midnight/90 via-expo-midnight/50 to-transparent p-6">
              <span className="text-xs uppercase tracking-widest text-expo-gold font-bold mb-1 block">
                {selectedImg.category}
              </span>
              <h3 className="font-display text-xl md:text-2xl tracking-wide text-expo-warm">
                {selectedImg.title}
              </h3>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </section>
  );
}
