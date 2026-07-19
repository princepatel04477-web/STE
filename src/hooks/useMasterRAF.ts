type Callback = (timestamp: number) => void;

// Global registry of all RAF subscribers
const subscribers = new Set<Callback>();
let rafId = 0;
let running = false;

const tick = (timestamp: number) => {
  subscribers.forEach((cb) => cb(timestamp));
  rafId = requestAnimationFrame(tick);
};

const start = () => {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
};

const stop = () => {
  running = false;
  cancelAnimationFrame(rafId);
};

// Pause on tab hidden — saves battery + GPU
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
}

export const masterRAF = {
  subscribe: (cb: Callback) => {
    subscribers.add(cb);
    if (!running) start();
    return () => {
      subscribers.delete(cb);
      if (subscribers.size === 0) stop();
    };
  },
};

// React hook wrapper
import { useEffect } from "react";

export function useMasterRAF(callback: Callback) {
  useEffect(() => {
    const unsubscribe = masterRAF.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}
