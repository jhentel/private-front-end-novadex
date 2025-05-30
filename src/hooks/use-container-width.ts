"use client";

import { useState, useEffect, useRef, MutableRefObject } from "react";

export function useContainerWidth<T extends HTMLElement>(): [
  number,
  MutableRefObject<T | null>,
] {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return [containerWidth, containerRef];
}
