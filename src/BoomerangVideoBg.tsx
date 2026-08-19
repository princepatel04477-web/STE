"use client";

import { useEffect, useRef, useState } from "react";
import { masterRAF } from "@/hooks/useMasterRAF";

interface BoomerangVideoBgProps {
  src: string;
  className?: string;
  /** Poster still. Rendered immediately and used as the LCP element. */
  fallbackImage?: string;
}

type Mode = "poster" | "video";

/** requestIdleCallback with a setTimeout fallback for Safari. */
function onIdle(cb: () => void, timeout = 2000): () => void {
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (h: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const handle = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(cb, 200);
  return () => window.clearTimeout(handle);
}

export const BoomerangVideoBg: React.FC<BoomerangVideoBgProps> = ({
  src,
  className = "",
  fallbackImage = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const [useNativeVideo, setUseNativeVideo] = useState(false);

  // Nothing loads until the client has decided this device should get video at
  // all. A background video is decorative; on a mid-range Android it is the
  // single most expensive thing on the page, and the boomerang capture below
  // decodes 90 frames into ImageBitmaps on top of that.
  const [mode, setMode] = useState<Mode>("poster");
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  const stateRef = useRef({
    capturing: false,
    framesReady: false,
    index: 0,
    direction: 1,
    lastTick: 0,
    lastCapTime: -1,
  });

  const PLAYBACK_FPS = 30;
  const FRAME_MS = 1000 / PLAYBACK_FPS;
  const MAX_WIDTH = 960;
  const MAX_FRAMES = 90; // max 3 seconds at 30fps

  // ── Decide: poster-only, or video? ──
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 768;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData
    );

    if (coarse || narrow || reduced || saveData) return; // stay on the poster
    setMode("video");
  }, []);

  // ── Load video bytes only once visible, and only when the main thread is idle ──
  useEffect(() => {
    if (mode !== "video") return;
    const container = containerRef.current;
    if (!container) return;

    let cancelIdle: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        cancelIdle = onIdle(() => setShouldLoadVideo(true));
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [mode]);

  // ── CAPTURE PHASE ──
  useEffect(() => {
    if (!shouldLoadVideo) return;
    const el = videoRef.current;
    if (!el) return;

    const s = stateRef.current;
    s.capturing = true;
    s.framesReady = false;
    s.index = 0;
    s.direction = 1;
    s.lastCapTime = -1;

    let captureFrameCount = 0;

    const captureFrame = async () => {
      if (!s.capturing) return;
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2) return;
      if (vid.currentTime === s.lastCapTime) return;
      s.lastCapTime = vid.currentTime;

      captureFrameCount++;
      if (captureFrameCount % 2 !== 0) return; // skip odd frames

      const vw = vid.videoWidth;
      const vh = vid.videoHeight;
      if (!vw || !vh) return;

      const scale = Math.min(1, MAX_WIDTH / vw);
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);

      if (framesRef.current.length >= MAX_FRAMES) {
        s.capturing = false;
        s.framesReady = true;
        const canvas = canvasRef.current;
        if (canvas && framesRef.current[0]) {
          canvas.width = framesRef.current[0].width;
          canvas.height = framesRef.current[0].height;
          canvas.style.display = "block";
        }
        if (vid) {
          vid.style.display = "none";
          vid.pause();
        }
        return;
      }

      try {
        const bitmap = await createImageBitmap(vid, {
          resizeWidth: w,
          resizeHeight: h,
          resizeQuality: "medium",
        });
        framesRef.current.push(bitmap);
      } catch {
        // Fallback to native HTML5 video if canvas bitmap capture fails
        s.capturing = false;
        setUseNativeVideo(true);
      }
    };

    let rafCapId = 0;
    const rafCapLoop = () => {
      captureFrame();
      if (s.capturing) {
        rafCapId = requestAnimationFrame(rafCapLoop);
      }
    };

    const onEnded = () => {
      s.capturing = false;
      cancelAnimationFrame(rafCapId);
      if (framesRef.current.length > 0) {
        s.framesReady = true;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && framesRef.current[0]) {
          canvas.width = framesRef.current[0].width;
          canvas.height = framesRef.current[0].height;
          canvas.style.display = "block";
        }
        if (video) {
          video.style.display = "none";
        }
      } else {
        setUseNativeVideo(true);
      }
    };

    // We start playback ourselves, after first paint — the element carries
    // neither autoplay nor preload="auto".
    const onLoaded = () => {
      el.muted = true;
      el.play().catch(() => {});
      rafCapId = requestAnimationFrame(rafCapLoop);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    el.load();
    if (el.readyState >= 1) onLoaded();

    return () => {
      s.capturing = false;
      cancelAnimationFrame(rafCapId);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
      framesRef.current.forEach((bm) => bm.close());
      framesRef.current = [];
    };
  }, [shouldLoadVideo, src]);

  // ── PLAYBACK PHASE via masterRAF ──
  useEffect(() => {
    if (!shouldLoadVideo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) return;

    const s = stateRef.current;

    const unsubscribe = masterRAF.subscribe((timestamp: number) => {
      if (!s.framesReady || useNativeVideo) return;
      const frames = framesRef.current;
      if (frames.length === 0) return;

      if (timestamp - s.lastTick < FRAME_MS) return;
      s.lastTick = timestamp;

      ctx.drawImage(frames[s.index], 0, 0);

      s.index += s.direction;
      if (s.index >= frames.length - 1) {
        s.index = frames.length - 1;
        s.direction = -1;
      } else if (s.index <= 0) {
        s.index = 0;
        s.direction = 1;
      }
    });

    return unsubscribe;
  }, [shouldLoadVideo, useNativeVideo]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
    >
      {/* The poster paints first and is the LCP candidate. It stays behind the
          video so a failed/absent video degrades to a still, never to black. */}
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {shouldLoadVideo && (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={fallbackImage || undefined}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: useNativeVideo ? "block" : undefined }}
            aria-hidden="true"
            loop
            muted
            playsInline
            preload="none"
            onError={() => setUseNativeVideo(true)}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
};

export default BoomerangVideoBg;
