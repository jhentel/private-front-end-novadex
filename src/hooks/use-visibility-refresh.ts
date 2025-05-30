"use client";

import { useEffect, useRef } from "react";

const useVisibilityRefresh = ({ ms = 15 }: { ms?: number }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimeRef.current = Date.now();
        console.warn("RFS ✨ - TAB HIDDEN - WATCHING... 👁️");

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        const now = Date.now();
        const hiddenTime = hiddenTimeRef.current;

        if (hiddenTime && now - hiddenTime > ms) {
          console.warn(
            `RFS ✨ - TAB WAS HIDDEN FOR > ${ms}ms - REFRESHING... 🟢`,
          );
          timeoutRef.current = setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          console.warn(
            `RFS ✨ - TAB WAS NOT HIDDEN FOR > ${ms}ms - RESETTING... 🔴`,
          );
        }

        hiddenTimeRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ms]);
};

export default useVisibilityRefresh;
