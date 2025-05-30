"use client";

import { useEffect, useState } from "react";

export function useTabVisibility() {
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isTabActive;
}
