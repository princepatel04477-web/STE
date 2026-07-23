"use client";

import { useEffect, useRef, useState } from "react";
import { masterRAF } from "@/hooks/useMasterRAF";

interface BoomerangVideoBgProps {
  src: string;
  className?: string;
  fallbackImage?: string;
}

export const BoomerangVideoBg: React.FC<BoomerangVideoBgProps> = ({
  src,
  className = "",
  fallbackImage = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  
  const stateRef = useRef({
    capturing: true,
    framesReady: false,
    index: 0,
    direction: 1,
    lastTick: 0,
    lastCapTime: -1,
  });

  const [loadError, setLoadError] = useState(false);

  const PLAYBACK_FPS = 30;
  const FRAME_MS = 1000 / PLAYBACK_FPS;
  const MAX_WIDTH = 960;
  const MAX_FRAMES = 90; // max 3 seconds at 30fps

  useEffect(() => {
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
        // Fallback to canvas capture if createImageBitmap fails
        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const ctx = offscreen.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(vid, 0, 0, w, h);
        const fallback = await createImageBitmap(offscreen);
        framesRef.current.push(fallback);
      }
    };

    // VFC loop for capture (most accurate)
    type VFCVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    const vfc = el as VFCVideo;
    const hasVFC = typeof vfc.requestVideoFrameCallback === "function";

    let rafCapId = 0;

    const rafCapLoop = () => {
      captureFrame();
      if (s.capturing) {
        rafCapId = requestAnimationFrame(rafCapLoop);
      }
    };

    const vfcLoop = () => {
      captureFrame();
      if (s.capturing && vfc.requestVideoFrameCallback) {
        vfc.requestVideoFrameCallback(vfcLoop);
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
      }
    };

    const onLoaded = () => {
      el.play().catch(() => {});
      const startCapture = () => {
        if (!s.capturing) return;
        if (hasVFC) {
          vfc.requestVideoFrameCallback!(vfcLoop);
        } else {
          rafCapId = requestAnimationFrame(rafCapLoop);
        }
      };
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(startCapture, { timeout: 1500 });
      } else {
        setTimeout(startCapture, 400);
      }
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    if (el.readyState >= 1) onLoaded();

    return () => {
      s.capturing = false;
      cancelAnimationFrame(rafCapId);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
      // Cleanup ImageBitmaps to free GPU memory
      framesRef.current.forEach((bm) => bm.close());
      framesRef.current = [];
    };
  }, [src]);

  // ── PLAYBACK PHASE via masterRAF ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use 2d context with alpha: false for faster compositing
    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true, // reduces latency on supported browsers
    });
    if (!ctx) return;

    const s = stateRef.current;

    const unsubscribe = masterRAF.subscribe((timestamp: number) => {
      if (!s.framesReady) return;
      const frames = framesRef.current;
      if (frames.length === 0) return;

      // Throttle to PLAYBACK_FPS
      if (timestamp - s.lastTick < FRAME_MS) return;
      s.lastTick = timestamp;

      // Draw current frame
      ctx.drawImage(frames[s.index], 0, 0);

      // Advance boomerang index
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
  }, []);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1 }}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        crossOrigin="anonymous"
        onError={() => setLoadError(true)}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ display: "none" }}
      />
      {/* Image fallback for mobile or load errors */}
      {loadError && fallbackImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${fallbackImage}')` }}
        />
      )}
    </div>
  );
};

export default BoomerangVideoBg;
