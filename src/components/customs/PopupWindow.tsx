import { motion, AnimatePresence } from "framer-motion";
import { Resizable, ResizableProps } from "re-resizable";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Image from "next/image";
import {
  defaultPopupState,
  PopupState,
  usePopupStore,
  WindowName,
  WindowPosition,
  WindowSize,
  WindowType,
} from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useAnnouncementStore } from "@/stores/use-announcement.store";
import { Paused } from "./cards/partials/Paused";
import { cn } from "@/libraries/utils";

type ResizeHandler = NonNullable<ResizableProps["onResizeStop"]>;

interface LockedWalletTrackerProps {
  title: string;
  windowName: WindowName;
  disableSnap?: boolean;
  maxSnapWidth?: number; // 0 - 1
  maxWidth?: number; // 0 - 1
  minWidth?: number;
  headerRightContent?: React.ReactNode;
  children: React.ReactNode;
  isPaused?: boolean;
}

export function PopupWindow({
  title,
  windowName,
  children,
  disableSnap = false,
  maxWidth = 0.7,
  maxSnapWidth = 0.4,
  minWidth = 560,
  headerRightContent,
  isPaused,
}: LockedWalletTrackerProps) {
  const isAnnouncementExist = useAnnouncementStore(
    (state) => state.isAnnouncementExist,
  );

  // Constants
  const MIN_DRAG_DISTANCE = 2;
  const SNAP_THRESHOLD = 5;
  const HEADER_HEIGHT = 88;
  const FOOTER_HEIGHT = 48.8;
  const PAGE_MARGIN = 5;
  const TOTAL_PAGE_HEIGHT = HEADER_HEIGHT + FOOTER_HEIGHT + PAGE_MARGIN;

  // Get window size
  const { width, height } = useWindowSizeStore();

  // Get popup state
  const popups = usePopupStore((state) => state.popups);
  const setPopupState = usePopupStore((state) => state.setPopupState);
  const togglePopup = usePopupStore((state) => state.togglePopup);
  const addSnappedPopup = usePopupStore((state) => state.addSnappedPopup);
  const removeSnappedPopup = usePopupStore((state) => state.removeSnappedPopup);
  const setRemainingScreenWidth = usePopupStore(
    (state) => state.setRemainingScreenWidth,
  );
  const currentSnappedPopup = usePopupStore(
    (state) => state.currentSnappedPopup,
  );

  const popup = popups.find((p) => p.name === windowName) as PopupState;
  const { name, isOpen, size, position, isInitialized, mode, snappedSide } =
    popup;

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [nearSnappedSide, setNearSnappedSide] = useState<
    "none" | "left" | "right"
  >("none");

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const resizeStartRef = useRef({
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });
  const previousSizeRef = useRef<typeof size>({
    width: defaultPopupState(name).size.width,
    height: defaultPopupState(name).size.height,
  });
  const isSnappedRef = useRef(false);
  const animationFrameRef = useRef<number>(undefined);

  // ==== Initialize Popup ====
  const initializePosition = useCallback(() => {
    if (width && height && mode !== "footer" && !isInitialized) {
      /* console.log("SNAP: initializePosition triggered") */;
      const newPos = {
        x: Math.round((width - size.width) / 2),
        y: Math.round((height - size.height) / 2),
      };

      setPopupState(name, (p) => ({
        ...p,
        position: newPos,
        isInitialized: true,
      }));
      setLocalPosition(newPos);
      setLocalSize(size);
    }
  }, [
    width,
    height,
    mode,
    isInitialized,
    size.width,
    size.height,
    name,
    setPopupState,
  ]);

  useEffect(() => {
    if (!isInitialized) initializePosition();
  }, [initializePosition, isInitialized]);

  // ==== Mouse Move Popup ====
  const [localPosition, setLocalPosition] = useState<WindowPosition>(
    popup.position,
  );
  const [localSize, setLocalSize] = useState<WindowSize>(popup.size);
  const snapDetectTimeoutRef = useRef<number | null>(null);

  const showSnapHint = useCallback(
    (side: string) => {
      const snapHint = document.getElementById(`${side}-snap-hint`);
      if (snapHint) {
        snapHint.style.display = "block";

        // Force reflow before setting styles that trigger transition
        void snapHint.offsetWidth;

        snapHint.style.transition = ""; // use CSS transition
        snapHint.style.opacity = "1";
        snapHint.style.width = `${minWidth}px`;
      }
    },
    [minWidth],
  );
  const hideSnapHintTimoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideSnapHint = useCallback((side: string, instant = false) => {
    const snapHint = document.getElementById(`${side}-snap-hint`);
    if (snapHint) {
      if (instant) {
        // Instantly hide without animation
        snapHint.style.transition = "none";
        snapHint.style.width = "0px";
        snapHint.style.opacity = "0";
        snapHint.style.display = "none";
      } else {
        // Animate hide
        snapHint.style.transition = ""; // restore default
        snapHint.style.width = "0px";
        snapHint.style.opacity = "0";

        // Delay hiding from DOM until animation completes
        if (hideSnapHintTimoutRef.current)
          clearTimeout(hideSnapHintTimoutRef.current);
        hideSnapHintTimoutRef.current = setTimeout(() => {
          snapHint.style.display = "none";
        }, 75); // match your CSS transition duration
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hideSnapHintTimoutRef.current) {
        clearTimeout(hideSnapHintTimoutRef.current);
        hideSnapHintTimoutRef.current = null;
      }
    };
  }, []);

  // useEffect(() => {
  //   const isLeftSnapped = popups.some(
  //     (popup) => popup.isOpen && popup.snappedSide === "left",
  //   );

  //   const isRightSnapped = popups.some(
  //     (popup) => popup.isOpen && popup.snappedSide === "right",
  //   );

  //   if (!isDragging) {
  //     hideSnapHint("left");
  //     hideSnapHint("right");
  //     return;
  //   }

  //   if (!isLeftSnapped) showSnapHint("left");
  //   if (!isRightSnapped) showSnapHint("right");
  // }, [isDragging]);

  useEffect(() => {
    const isLeftSnapped = popups.some(
      (popup) =>
        popup.name === name && popup.isOpen && popup.snappedSide === "left",
    );

    const isRightSnapped = popups.some(
      (popup) =>
        popup.name === name && popup.isOpen && popup.snappedSide === "right",
    );

    if (nearSnappedSide === "left" && !isLeftSnapped) {
      showSnapHint("left");
      return;
    }
    if (nearSnappedSide === "right" && !isRightSnapped) {
      showSnapHint("right");
      return;
    }

    hideSnapHint("left");
    hideSnapHint("right");

    if (!isDragging) {
      return;
    }
  }, [isDragging, nearSnappedSide]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && e.button !== 0) return;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        const hasDraggedEnough =
          Math.abs(deltaX) > MIN_DRAG_DISTANCE ||
          Math.abs(deltaY) > MIN_DRAG_DISTANCE;

        if (!hasDraggedEnough) return;

        if (snappedSide !== "none") {
          /* console.log("SNAP - handleMouseMove triggered") */;
          const offsetX = snappedSide === "left" ? 10 : -10;
          const unsnappedX = dragStartRef.current.posX + deltaX + offsetX;
          const maxX = window.innerWidth - previousSizeRef.current.width;

          const clampedX = Math.max(0, Math.min(unsnappedX, maxX));
          const clampedY = HEADER_HEIGHT;
          setNearSnappedSide("none");

          // ✅ Commit unsnap to global state
          setPopupState(name, (p) => ({
            ...p,
            snappedSide: "none" as const,
            size: previousSizeRef.current,
            mode: "popup" as const,
            position: {
              x: clampedX,
              y: clampedY,
            },
          }));
          removeSnappedPopup(name);

          const snappedPopups = popups.filter(
            (p) => p.name !== name && p.snappedSide !== "none" && p.isOpen,
          );
          const totalSnappedWidth = snappedPopups.reduce(
            (acc, p) => acc + p.size.width,
            0,
          );
          setRemainingScreenWidth(
            () => (width || window.innerWidth) - totalSnappedWidth,
          );

          isSnappedRef.current = false;
          return;
        }

        let newX = Math.round(dragStartRef.current.posX + deltaX);
        let newY = Math.round(dragStartRef.current.posY + deltaY);

        const popupWidth = previousSizeRef.current.width;
        const popupHeight = previousSizeRef.current.height;

        const maxX = window.innerWidth - popupWidth;
        const maxY = window.innerHeight - popupHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // ✅ Save to local refs only
        setLocalPosition((prev) => {
          if (prev.x === newX && prev.y === newY) return prev;
          return { x: newX, y: newY };
        });

        setLocalSize((prev) => {
          if (
            prev.width === previousSizeRef.current.width &&
            prev.height === previousSizeRef.current.height
          ) {
            return prev;
          }
          return {
            width: previousSizeRef.current.width,
            height: previousSizeRef.current.height,
          };
        });

        // Snap detection
        /* console.log("SNAP - isDragging", isDraggingRef.current) */;
        if (!isDragging) return;
        if (!isDraggingRef.current) return;

        const nearLeftSnap = newX <= SNAP_THRESHOLD * 4.5;
        const nearRightSnap = newX >= maxX - SNAP_THRESHOLD * 4.5;
        const side = nearLeftSnap ? "left" : nearRightSnap ? "right" : "none";

        if (snapDetectTimeoutRef.current !== null && side !== "none") {
          clearTimeout(snapDetectTimeoutRef.current);
          snapDetectTimeoutRef.current = null;
        }

        snapDetectTimeoutRef.current = window.setTimeout(() => {
          setNearSnappedSide(side);
        }, 50);
      });
    },
    [
      isDragging,
      name,
      snappedSide,
      disableSnap,
      localPosition,
      localSize,
      width,
    ],
  );

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ==== Mouse Leaving Popup ====
  const handleMouseUp = useCallback(() => {
    /* console.log("SNAP - HandleMouseUp triggered") */;
    setIsDragging(false);
    isDraggingRef.current = false;
    document.body.style.userSelect = "";
    /* console.log("SNAP - isDragging", isDraggingRef.current) */;
    if (!isDraggingRef.current && snapDetectTimeoutRef.current) {
      clearTimeout(snapDetectTimeoutRef.current);
      snapDetectTimeoutRef.current = null;
    }

    const container = document.getElementById("main-component");
    if (container) container.style.pointerEvents = "auto";

    let finalPos = localPosition;
    let finalSize = localSize;
    let mode: WindowType = "popup";

    if (snappedSide !== "none") return;

    // ✅ Handle snapping
    if (nearSnappedSide !== "none") {
      const defaultSize = defaultPopupState(name).size;
      const newWidth = Math.min(
        defaultSize.width,
        window.innerWidth * maxSnapWidth,
      );
      mode = "snap";

      const snappedLeftPopups = popups.filter(
        (p) => p.name !== name && p.snappedSide === "left" && p.isOpen,
      );
      const snappedRightPopups = popups.filter(
        (p) => p.name !== name && p.snappedSide === "right" && p.isOpen,
      );

      const totalLeftWidth = snappedLeftPopups.reduce(
        (acc, p) => acc + p.size.width,
        0,
      );
      const totalRightWidth = snappedRightPopups.reduce(
        (acc, p) => acc + p.size.width,
        0,
      );
      finalPos.x =
        nearSnappedSide === "left"
          ? totalLeftWidth
          : window.innerWidth - newWidth - totalRightWidth;
      finalSize.width = minWidth;

      const calculatedTotalPageHeight = isAnnouncementExist
        ? TOTAL_PAGE_HEIGHT + 40
        : TOTAL_PAGE_HEIGHT;

      finalSize.height = window.innerHeight - calculatedTotalPageHeight;

      finalPos.y = HEADER_HEIGHT;
      isSnappedRef.current = true;

      addSnappedPopup(nearSnappedSide, name);
      if (
        currentSnappedPopup.left.length > 0 ||
        currentSnappedPopup.right.length > 0
      ) {
        const updatedSnappedPopups = [
          ...popups.filter((p) => p.snappedSide !== "none" && p.isOpen),
          {
            ...popup,
            size: { ...popup.size, width: finalSize.width },
            isOpen: true,
            snappedSide: nearSnappedSide,
          },
        ];

        const totalSnappedWidth = updatedSnappedPopups.reduce(
          (acc, p) => acc + p.size.width,
          0,
        );

        setRemainingScreenWidth(
          () => (width || window.innerWidth) - totalSnappedWidth,
        );
      }
    }

    setLocalPosition(finalPos);
    setLocalSize(finalSize);
    /* console.log("SNAP: triggered - localSize", localSize) */;

    // ✅ Commit snap to global state
    setPopupState(name, (p) => ({
      ...p,
      position: finalPos,
      size: finalSize,
      snappedSide: nearSnappedSide,
      mode: mode,
    }));
  }, [
    // name,
    // isDragging,
    nearSnappedSide,
    snappedSide,
    popups,
    popup,
    localPosition,
    localSize,
    isAnnouncementExist,
  ]);

  useEffect(() => {
    const otherPopup = popups.find((p) => p.name !== name);
    if (!isInitialized) return;

    if (
      (otherPopup && otherPopup.snappedSide !== "none") ||
      (otherPopup && !otherPopup.isOpen)
    ) {
      const defaultSize = Math.max(otherPopup.size.width, minWidth);
      const snappedWidth = Math.min(
        defaultSize,
        window.innerWidth * maxSnapWidth,
      );
      const snappedX =
        otherPopup.snappedSide === "left"
          ? 0
          : window.innerWidth - snappedWidth;

      setPopupState(otherPopup.name, (p) => ({
        ...p,
        position: {
          ...p.position,
          x: snappedX,
        },
        size: {
          ...p.size,
          width: snappedWidth,
        },
      }));
    }
  }, [isOpen, mode, name, isInitialized]);

  // ==== Dragging Listeners ====
  useEffect(() => {
    if (isDragging) {
      /* console.log("SNAP: isDragging triggered") */;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ==== Resize Popup ====
  const handleResize = useCallback<ResizeHandler>(
    (_event, direction, _ref, d) => {
      /* console.log("SNAP - handleResize triggered") */;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const isSnap = mode === "snap";
      const maxAllowedWidth =
        viewportWidth * (isSnap ? maxSnapWidth : maxWidth);

      // Raw new dimensions
      let rawWidth = resizeStartRef.current.width + d.width;
      let rawHeight = resizeStartRef.current.height + d.height;

      // Clamp to max width
      let newWidth = Math.max(100, Math.min(rawWidth, maxAllowedWidth)); // ensure not zero
      let newHeight = Math.max(100, rawHeight); // avoid too small height

      // Initial positions
      let newPosX = resizeStartRef.current.posX;
      let newPosY = resizeStartRef.current.posY;

      /* console.log("directions: ", direction) */;

      // Handle left-edge resizing
      if (direction.includes("left")) {
        const widthDiff = newWidth - resizeStartRef.current.width;
        newPosX = resizeStartRef.current.posX - widthDiff;

        // Prevent jumping offscreen
        if (newPosX < 0) {
          newPosX = 0;
          newWidth = resizeStartRef.current.width + resizeStartRef.current.posX; // prevent overflow
          newWidth = Math.min(newWidth, maxAllowedWidth);
        }
      }
      if (direction.includes("topLeft")) {
        const widthDiff = newWidth - resizeStartRef.current.width;
        newPosX = resizeStartRef.current.posX - widthDiff;
        newPosY = resizeStartRef.current.posY - d.height;

        // Prevent jumping offscreen
        if (newPosX < 0) {
          newPosX = 0;
          newWidth = resizeStartRef.current.width + resizeStartRef.current.posX; // prevent overflow
          newWidth = Math.min(newWidth, maxAllowedWidth);
          newHeight =
            resizeStartRef.current.height + resizeStartRef.current.posY;
        }
      }
      if (direction.includes("bottomLeft")) {
        const widthDiff = newWidth - resizeStartRef.current.width;
        newPosX = resizeStartRef.current.posX - widthDiff;

        // Prevent jumping offscreen
        if (newPosX < 0) {
          newPosX = 0;
          newWidth = resizeStartRef.current.width + resizeStartRef.current.posX; // prevent overflow
          newWidth = Math.min(newWidth, maxAllowedWidth);
        }
      }

      // Handle top-edge resizing
      if (direction.includes("top")) {
        newPosY = resizeStartRef.current.posY - d.height;
      }

      // Clamp position within screen bounds
      newPosX = Math.max(0, Math.min(newPosX, viewportWidth - newWidth));
      newPosY = Math.max(0, Math.min(newPosY, viewportHeight - newHeight));

      // Final width/height limits to avoid offscreen overflow
      newWidth = Math.min(newWidth, viewportWidth - newPosX);
      newHeight = Math.min(newHeight, viewportHeight - newPosY);

      if (!isSnappedRef.current) {
        previousSizeRef.current = { width: newWidth, height: newHeight };
      }
      setLocalSize((prev) => {
        if (prev.width === newWidth && prev.height === newHeight) return prev;
        return { width: newWidth, height: newHeight };
      });

      setLocalPosition((prev) => {
        if (prev.x === newPosX && prev.y === newPosY) return prev;
        return { x: newPosX, y: newPosY };
      });
    },
    [mode, maxWidth, maxSnapWidth, localPosition, localSize],
  );

  // ==== Start Resizing ====
  const handleResizeStart = useCallback(() => {
    /* console.log("SNAP: handleResizeStart triggered") */;
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };
    const container = document.getElementById("main-component");
    if (container) {
      container.style.pointerEvents = "none";
    }
  }, [size, position]);

  // ==== Start Dragging ====
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      /* console.log("SNAP: handleDragStart triggered") */;
      const target = e.target as HTMLElement;
      if (
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("button")
      ) {
        return;
      }

      setIsDragging(true);
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      document.body.style.userSelect = "none";
      const container = document.getElementById("main-component");
      if (container) {
        container.style.pointerEvents = "none";
      }
    },
    [position, name],
  );

  // ==== Unlock Popup ====
  const handleUnlock = useCallback(() => {
    /* console.log("SNAP - handleUnlock triggered") */;
    setPopupState(name, () => ({ ...defaultPopupState(name), isOpen: true }));
    setNearSnappedSide("none");
    hideSnapHint("left");
    hideSnapHint("right");
    removeSnappedPopup(name);
    setIsDragging(false);
    snapDetectTimeoutRef.current = null;
    isDraggingRef.current = false;
    isSnappedRef.current = false;
    setLocalSize({
      width: defaultPopupState(name).size.width,
      height: defaultPopupState(name).size.height,
    });
    setLocalPosition({
      x: defaultPopupState(name).position.x,
      y: defaultPopupState(name).position.y,
    });
    previousSizeRef.current = size;
    document.body.style.overflow = "hidden";
  }, [setPopupState, name]);

  useEffect(() => {
    setPopupState(name, (p) => ({
      ...p,
      size: { width: Math.max(size.width, minWidth), height: size.height },
    }));
  }, [minWidth]);

  const EDGE_THRESHOLD = 10;
  const prevDimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    /* console.log("SNAP: width change", { width, height }) */;

    const newWidth = width || window.innerWidth;
    const newHeight = height || window.innerHeight;

    const prevWidth = prevDimensions.current.width || newWidth;
    const prevHeight = prevDimensions.current.height || newHeight;

    const deltaX = newWidth - prevWidth;
    const deltaY = newHeight - prevHeight;

    const popupWidth = size.width || 300;
    const popupHeight = size.height || 200;

    const isShrinking = deltaX < 0 || deltaY < 0;

    setLocalPosition((prev) => {
      let newX = prev.x;
      let newY = prev.y;

      const isNearRight = prev.x + popupWidth >= prevWidth - EDGE_THRESHOLD;
      const isNearBottom = prev.y + popupHeight >= prevHeight - EDGE_THRESHOLD;

      if (isShrinking) {
        if (isNearRight) newX += deltaX;
        if (isNearBottom) newY += deltaY;
      }

      // Clamp to keep inside screen
      newX = Math.min(newX, newWidth - popupWidth);
      newY = Math.min(newY, newHeight - popupHeight);
      newX = Math.max(newX, 0);
      newY = Math.max(newY, 0);

      return { x: Math.round(newX), y: Math.round(newY) };
    });

    setPopupState(name, (prevPopup) => {
      let { x: prevX, y: prevY } = prevPopup.position;

      const isNearRight = prevX + popupWidth >= prevWidth - EDGE_THRESHOLD;
      const isNearBottom = prevY + popupHeight >= prevHeight - EDGE_THRESHOLD;

      if (isShrinking) {
        if (isNearRight) prevX += deltaX;
        if (isNearBottom) prevY += deltaY;
      }

      // Clamp to keep inside screen
      prevX = Math.min(prevX, newWidth - popupWidth);
      prevY = Math.min(prevY, newHeight - popupHeight);
      prevX = Math.max(prevX, 0);
      prevY = Math.max(prevY, 0);

      return {
        ...prevPopup,
        position: {
          x: Math.round(prevX),
          y: Math.round(prevY),
        },
      };
    });

    prevDimensions.current = { width: newWidth, height: newHeight };
  }, [width, height]);

  const resizableProps = useMemo(
    () => ({
      size: localSize,
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      onResizeStop: () => {
        const container = document.getElementById("main-component");
        if (container) {
          container.style.pointerEvents = "auto";
        }
        // Update remaining width if snapped
        if (mode === "snap") {
          setRemainingScreenWidth(() => {
            const snappedPopups = popups.filter(
              (p) => p.snappedSide !== "none" && p.isOpen,
            );
            const totalSnappedWidth = snappedPopups.reduce(
              (acc, p) => acc + p.size.width,
              0,
            );
            return (width || window.innerWidth) - totalSnappedWidth;
          });
        }

        setPopupState(name, (p) => ({
          ...p,
          size: localSize,
          position: localPosition,
        }));
      },
      maxWidth:
        snappedSide !== "none"
          ? `${maxSnapWidth * 100}dvw`
          : `${maxWidth * 100}dvw`,
      minWidth: minWidth,
      minHeight:
        snappedSide !== "none" ? "100%" : defaultPopupState(name).size.height,
      bounds: "window" as const,
      boundsByDirection: true,
      enable: {
        top: !isSnappedRef.current,
        bottom: !isSnappedRef.current,
        left: snappedSide !== "left",
        right: snappedSide !== "right",
        topRight: !isSnappedRef.current,
        topLeft: !isSnappedRef.current,
        bottomRight: !isSnappedRef.current,
        bottomLeft: !isSnappedRef.current,
      },
      handleStyles: {
        bottomRight: { cursor: isSnappedRef.current ? "default" : "se-resize" },
        bottomLeft: { cursor: isSnappedRef.current ? "default" : "sw-resize" },
        topRight: { cursor: isSnappedRef.current ? "default" : "ne-resize" },
        topLeft: { cursor: isSnappedRef.current ? "default" : "nw-resize" },
        right: { cursor: "e-resize" },
        left: { cursor: "w-resize" },
        bottom: { cursor: isSnappedRef.current ? "default" : "s-resize" },
        top: { cursor: isSnappedRef.current ? "default" : "n-resize" },
      },
      handleClasses: {
        bottomRight: isSnappedRef.current ? "hidden" : "!size-10",
        bottomLeft: isSnappedRef.current ? "hidden" : "!size-10",
        topRight: isSnappedRef.current ? "hidden" : "!size-10",
        topLeft: isSnappedRef.current ? "hidden" : "!size-10",
        right: "!w-6",
        left: "!w-6",
        bottom: isSnappedRef.current ? "hidden" : "!h-6",
        top: isSnappedRef.current ? "hidden" : "!h-6",
      },
      className: "h-full w-full",
    }),
    [handleResizeStart, handleResize, snappedSide, minWidth, localSize, width],
  );

  const [previousState, setPreviousState] = useState<WindowType>(mode);

  const prevWidthRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevWidthRef.current === null) {
      prevWidthRef.current = width!;
      return;
    }

    const prevWidth = prevWidthRef.current;

    // Trigger when going from >=1280 to <1280
    if (prevWidth >= 1280 && width! < 1280) {
      if (mode !== "footer") {
        // const initPos = {
        //   x: Math.round((width! - size.width) / 2),
        //   y: Math.round((height! - size.height) / 2),
        // };

        const shouldOpen = mode === "snap" && isOpen;
        setPreviousState(mode);
        setPopupState(name, (p) => ({
          ...p,
          mode: "footer",
          isInitialized: false,
          isOpen: shouldOpen,
        }));
      }
    }

    // Trigger when going from <1280 to >=1280
    if (prevWidth < 1280 && width! >= 1280) {
      if (mode === "footer") {
        setPopupState(name, (p) => ({
          ...p,
          mode: previousState,
        }));
      }
    }

    prevWidthRef.current = width!;
  }, [width, height, snappedSide, previousState]);

  if (!isOpen || mode === "footer") return null;

  const zIndex = isDragging ? 9999 : nearSnappedSide !== "none" ? 50 : 999;

  const opacity =
    snappedSide !== "none" ? 1 : nearSnappedSide !== "none" ? 0.7 : 1;

  return (
    <AnimatePresence>
      <div
        className="hidden overflow-hidden xl:block"
        style={{
          zIndex,
          position: snappedSide === "none" ? "fixed" : "static",
          opacity,
        }}
      >
        <motion.div
          id={name}
          initial={{
            opacity: 0,
            x: snappedSide === "left" ? -50 : snappedSide === "right" ? 50 : 0,
            y: snappedSide === "none" ? 50 : 0,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            x: snappedSide === "left" ? 50 : snappedSide === "right" ? -50 : 0,
            y: snappedSide === "none" ? 50 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-visible"
          style={{
            position: snappedSide === "none" ? "fixed" : "static",
            top: `${localPosition.y}px`,
            left: `${localPosition.x}px`,
            height:
              snappedSide !== "none"
                ? `calc(100dvh - ${isAnnouncementExist ? TOTAL_PAGE_HEIGHT + 40 : TOTAL_PAGE_HEIGHT}px)`
                : `${size.height}px`,
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          <Resizable {...resizableProps}>
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_0_20px_0_#000000]">
              {/* Header */}
              <div
                className={`flex w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} items-center justify-between border-b border-border p-4`}
                onMouseDown={handleDragStart}
              >
                <div className="flex items-center justify-center gap-x-3">
                  <h1 className="text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                    {title}
                  </h1>

                  {isPaused && (
                    <Paused separatorProps={{ className: "mr-2" }} />
                  )}
                </div>

                <div className="flex w-fit items-center gap-x-2 overflow-hidden">
                  {headerRightContent}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleUnlock}
                          className="relative hidden aspect-square h-5 w-5 xl:block"
                        >
                          <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0 duration-300 hover:opacity-70">
                            <Image
                              src="/icons/unlock.svg"
                              alt="Fullscreen Icon"
                              fill
                              quality={100}
                              className="object-contain"
                            />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="z-[2000]">
                        <p>Pop in</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button
                    onClick={() => {
                      togglePopup(name);
                    }}
                    className="relative hidden aspect-square h-6 w-6 xl:block"
                  >
                    <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                      <Image
                        src="/icons/close.png"
                        alt="Close Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Content Area - Fixed for scrolling */}
              <div className="flex-1">{children}</div>
            </div>
          </Resizable>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export const PopupWindowHighlight = ({ type }: { type: "left" | "right" }) => {
  return (
    <div
      id={`${type}-snap-hint`}
      className={cn(
        "hidden",
        type === "left" ? "left-5" : "right-5",
        "absolute z-[100]",
        "bg-gray-300 bg-opacity-30",
        "border border-white",
        "h-[calc(100%-48.8px)] w-0 rounded-[8px] shadow-[0_0_20px_0_#000000] transition-[width,opacity] duration-75",
      )}
    ></div>
  );
};
