import { useEffect, useState } from "react";

type ScreenSize = "desktop" | "mobile";

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>("mobile");

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setScreenSize(width >= 1280 ? "desktop" : "mobile");
      }
    });

    observer.observe(document.documentElement);
    setScreenSize(window.innerWidth >= 1280 ? "desktop" : "mobile");

    return () => {
      observer.disconnect();
    };
  }, []);

  return screenSize;
};
