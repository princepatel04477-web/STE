import { useEffect, useState } from "react";

export function useMobileAnimation() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    // Defer the set state to avoid synchronous state update in effect body
    setTimeout(checkMobile, 0);
    
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
