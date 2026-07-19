"use client";

import React from "react";

const particles = [
  { size: 3, top: "15%", left: "8%",  duration: "7s",  delay: "0s"   },
  { size: 4, top: "72%", left: "15%", duration: "9s",  delay: "1s"   },
  { size: 2, top: "35%", left: "88%", duration: "8s",  delay: "2s"   },
  { size: 5, top: "58%", left: "78%", duration: "11s", delay: "0.5s" },
  { size: 3, top: "22%", left: "55%", duration: "6s",  delay: "3s"   },
  { size: 2, top: "85%", left: "45%", duration: "10s", delay: "1.5s" },
  { size: 4, top: "45%", left: "25%", duration: "8s",  delay: "2.5s" },
  { size: 3, top: "10%", left: "70%", duration: "7s",  delay: "0.8s" },
];

export const GoldParticles = () => (
  <div 
    aria-hidden="true"
    style={{ 
      position: "absolute", 
      inset: 0, 
      pointerEvents: "none",
      overflow: "hidden"
    }}
  >
    {particles.map((p, i) => (
      <span
        key={i}
        className="particle"
        style={{
          width: `${p.size}px`,
          height: `${p.size}px`,
          top: p.top,
          left: p.left,
          "--duration": p.duration,
          "--delay": p.delay,
        } as React.CSSProperties}
      />
    ))}
  </div>
);
