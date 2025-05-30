"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const MEMORY_CHECK_INTERVAL = 10000; // 10 seconds
const MEMORY_THRESHOLD = 350; // 400MB
const NAVIGATION_THRESHOLD = 2; // Force cleanup after 5 page changes

interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

declare global {
  interface Window {
    performance: Performance;
    gc?: () => void;
  }
}

export default function GarbageCollector() {
  const pathname = usePathname();
  const lastCleanupTime = useRef<number>(Date.now());
  const cleanupInProgress = useRef<boolean>(false);
  const navigationCount = useRef<number>(0);
  const lastPathname = useRef<string | null>(pathname);
  const initialCleanupDone = useRef<boolean>(false);

  const checkMemoryUsage = () => {
    if (!window.performance?.memory) return;

    const used = window.performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    return used;
  };

  const forceCleanup = async () => {
    if (cleanupInProgress.current) return;

    try {
      cleanupInProgress.current = true;

      // Clear image cache
      const images = document.getElementsByTagName("img");
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.dataset.src) {
          img.src = "";
        }
      }

      // Clear unused objects
      if (window.gc) {
        window.gc();
      }

      // Reset cleanup timer and navigation count
      lastCleanupTime.current = Date.now();
      navigationCount.current = 0;
    } finally {
      cleanupInProgress.current = false;
    }
  };

  useEffect(() => {
    const tokenCosmoCleanup = setTimeout(() => {
      const memoryUsage = checkMemoryUsage();
      if (
        (pathname.includes("/cosmo") || pathname.includes("/token")) &&
        !initialCleanupDone.current &&
        memoryUsage &&
        memoryUsage > MEMORY_THRESHOLD
      ) {
        forceCleanup();
        initialCleanupDone.current = true;
        return;
      }
    }, 2000);

    // Track navigation changes
    if (pathname !== lastPathname.current) {
      navigationCount.current++;
      lastPathname.current = pathname;

      // Force cleanup if navigation threshold is reached
      if (navigationCount.current >= NAVIGATION_THRESHOLD) {
        forceCleanup();
      }
    }

    const memoryUsage = checkMemoryUsage();
    const memoryInterval = setInterval(() => {
      const memoryUsage = checkMemoryUsage();
      if (memoryUsage && memoryUsage > MEMORY_THRESHOLD) {
        forceCleanup();
      }
    }, MEMORY_CHECK_INTERVAL);

    // Clean up on route change if memory usage is high
    if (memoryUsage && memoryUsage > MEMORY_THRESHOLD) {
      forceCleanup();
    }

    return () => {
      clearInterval(memoryInterval);
      clearTimeout(tokenCosmoCleanup);
    };
  }, [pathname]);

  useEffect(() => {
    const visibilityHandler = () => {
      if (
        !document.hidden &&
        Date.now() - lastCleanupTime.current > MEMORY_CHECK_INTERVAL
      ) {
        forceCleanup();
      }
    };

    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, []);

  return null;
}