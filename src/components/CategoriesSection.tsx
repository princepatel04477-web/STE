/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { waapi } from "animejs";

interface Category {
  name: string;
  colSpan: string;
  rowSpan: string;
  image: string;
}

const categoriesData: Category[] = [
  {
    name: "Sarees",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-2",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Lehenga Choli",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Kurti",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Salwar Suit",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-2",
    image: "https://images.unsplash.com/photo-1631857455684-a54a2f03665f?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Readymade",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Value Added Fabrics",
    colSpan: "md:col-span-2",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Kids Wear",
    colSpan: "md:col-span-1",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Sherwani & Men's Ethnic Wear",
    colSpan: "md:col-span-3",
    rowSpan: "md:row-span-1",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop"
  }
];

export default function CategoriesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stagger reveal entrance animation on scroll
  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".category-card");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(Array.from(cards) as any, {
                opacity: [0, 1],
                translate: ["0 30px", "0 0px"],
                delay: (el, i) => i * 80,
                duration: 800,
                ease: "outExpo"
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // 3D Tilt interactive mouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Rotate relative to pointer coordinates
    card.style.transform = `perspective(1000px) rotateY(${x / 14}deg) rotateX(${-y / 14}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "transform 0.1s ease-out";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    card.style.transition = "transform 0.5s ease";
  };

  return (
    <section id="categories" className="relative w-full bg-expo-black py-32 px-6 overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-expo-copper/5 via-transparent to-transparent opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-20">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-24">
          <span className="text-xs uppercase tracking-[0.3em] text-expo-gold font-medium mb-3">Sourcing Sectors</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-expo-warm mb-6">
            TEXTILE CATEGORIES
          </h2>
          <div className="w-20 h-[1.5px] bg-expo-gold" />
          <p className="mt-6 text-sm text-expo-warm/50 max-w-lg font-sans">
            Explore dedicated exhibition segments showcasing traditional craftsmanship, designer fabrics, and high-volume ethnic wear sourcing.
          </p>
        </div>

        {/* Categories Bento Grid */}
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6"
        >
          {categoriesData.map((cat) => (
            <div
              key={cat.name}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`category-card opacity-0 border border-expo-border/50 rounded-xl relative overflow-hidden bg-expo-midnight group cursor-pointer shadow-lg ${cat.colSpan} ${cat.rowSpan}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Image background */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 768px) 30vw, 90vw"
                  className="object-cover opacity-40 group-hover:opacity-75 transition-all duration-1000 ease-luxury group-hover:scale-105 filter brightness-[0.8] group-hover:brightness-95"
                />
              </div>

              {/* Gradient cover */}
              <div className="absolute inset-0 bg-gradient-to-t from-expo-midnight via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-expo-gold/0 group-hover:bg-expo-gold/10 transition-colors duration-500 ease-luxury" />

              {/* Animated shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />

              {/* Glass overlay label with depth */}
              <div 
                className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto z-20"
                style={{ transform: "translateZ(30px)" }}
              >
                <div className="glass-panel px-6 py-3 rounded-lg border border-expo-border/50 group-hover:border-expo-gold/40 bg-expo-black/60 backdrop-blur-md transition-colors duration-300">
                  <h3 className="font-display text-base md:text-lg tracking-wider text-expo-warm group-hover:text-expo-gold transition-colors duration-300">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Subtle hover grid highlight overlay */}
              <div className="absolute inset-0 border border-transparent group-hover:border-expo-gold/25 rounded-xl pointer-events-none transition-colors duration-500" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
