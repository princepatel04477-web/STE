"use client";

import React, { useEffect, useRef, useState } from "react";

interface OptimizedVideoBgProps {
  src: string;
  className?: string;
  fallbackImage?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  style?: React.CSSProperties;
}

export default function OptimizedVideoBg({
  src,
  className = "",
  fallbackImage = "",
  poster = "",
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  style = {},
}: OptimizedVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !isMounted) return;

    const container = containerRef.current;
    if (!container) return;

    let isVisible = false;
    let isTabActive = !document.hidden;

    const updatePlayState = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isVisible && isTabActive) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    // Lazy load the video source when container is close to the viewport (200px)
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            lazyObserver.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    lazyObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          updatePlayState();
        });
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(container);

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      updatePlayState();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      lazyObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMobile, isMounted]);

  if (!isMounted) {
    return (
      <div ref={containerRef} className={className} style={{ ...style, position: "relative" }}>
        {fallbackImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${fallbackImage}')` }}
          />
        )}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div ref={containerRef} className={className} style={{ ...style, position: "relative" }}>
        {fallbackImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${fallbackImage}')` }}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ ...style, position: "relative" }}>
      {shouldLoadVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster || fallbackImage}
          preload="metadata"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          className="w-full h-full object-cover"
        />
      ) : (
        fallbackImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${fallbackImage}')` }}
          />
        )
      )}
    </div>
  );
}
