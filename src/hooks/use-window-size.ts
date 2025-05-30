"use client";

import { useState, useEffect, useRef } from "react";
import throttle from "lodash/throttle";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export function useWindowSize(): {
  width: number | undefined;
  height: number | undefined;
} {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  const setWindowSizeStore = useWindowSizeStore((state) => state.setSize);
  const setRemainingScreenWidth = usePopupStore(
    (state) => state.setRemainingScreenWidth,
  );
  const width = useWindowSizeStore((state) => state.width);
  const popups = usePopupStore((state) => state.popups);

  useEffect(() => {
    const updateSize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setWindowSizeStore({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // const snapWidth = (popupsRef.current as typeof popups).reduce(
      //   (acc, p) => {
      //     if (p.isOpen && p.snappedSide !== "none") {
      //       return acc + p.size.width;
      //     }
      //     return acc;
      //   },
      //   0,
      // );
    }, 200);

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => {
      // setRemainingScreenWidth(() => window.innerWidth);
      window.removeEventListener("resize", updateSize);
      updateSize.cancel();
    };
  }, []);

  useEffect(() => {
    const totalSnappedWidth = popups
      .filter((p) => p.snappedSide !== "none" && p.isOpen)
      .reduce((acc, p) => acc + p.size.width, 0);

    setRemainingScreenWidth(
      () => (width || window.innerWidth) - totalSnappedWidth,
    );
  }, [
    popups
      .map((p) => `${p.name}-${p.snappedSide}-${p.isOpen}-${p.size.width}`)
      .join("|"),
    width,
  ]);

  return windowSize;
}
