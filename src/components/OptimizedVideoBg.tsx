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
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    // Immediately load video or use IntersectionObserver with 400px margin
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            lazyObserver.disconnect();
          }
        });
      },
      { rootMargin: "400px" }
    );
    lazyObserver.observe(container);

    return () => lazyObserver.disconnect();
  }, [isMounted]);

  useEffect(() => {
    if (!shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    playVideo();
    video.addEventListener("canplay", playVideo);
    video.addEventListener("loadeddata", playVideo);
    window.addEventListener("touchstart", playVideo, { once: true });
    window.addEventListener("click", playVideo, { once: true });

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("loadeddata", playVideo);
      window.removeEventListener("touchstart", playVideo);
      window.removeEventListener("click", playVideo);
    };
  }, [shouldLoadVideo, src]);

  return (
    <div ref={containerRef} className={`${className} relative overflow-hidden`} style={style}>
      {fallbackImage && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none -z-10"
          style={{ backgroundImage: `url('${fallbackImage}')` }}
        />
      )}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          src={src}
          poster={poster || fallbackImage}
          preload="auto"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          className="w-full h-full object-cover relative z-0"
        />
      )}
    </div>
  );
}
