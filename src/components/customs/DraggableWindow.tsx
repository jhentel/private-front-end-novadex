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
import { cn } from "@/libraries/utils";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

type ResizeHandler = NonNullable<ResizableProps["onResizeStop"]>;

type Size = {
  width: number;
  height: number;
};

type Mode = "side" | "locked" | "full";

type SnappedState = {
  snappedSide: "none" | "left" | "right";
  nearSnappedSide: "none" | "left" | "right";
};

type Position = {
  x: number;
  y: number;
};

type PreviousState = {
  modalMode: Mode;
  size: Size;
};

interface LockedWalletTrackerProps {
  title: string;
  disableSnap?: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  size: Size;
  setSize: (fn: (state: Size) => Size) => void;
  snappedState: SnappedState;
  setSnappedState: (fn: (state: SnappedState) => SnappedState) => void;
  modalMode: Mode;
  setModalMode: (mode?: Mode) => void;
  isInitialized?: boolean;
  setIsInitialized: (val: boolean) => void;
  position: Position;
  setPosition: (position: Position) => void;
  scrollable?: boolean;
  maxSnapWidth?: number; // 0 - 1
  maxWidth?: number; // 0 - 1
  setPreviousState: (state: PreviousState) => void;
  previousState: PreviousState | null;
  hasRestoredPreviousState: boolean;
  setHasRestoredPreviousState: (val: boolean) => void;
  minWidth?: number;
  headerRightContent?: React.ReactNode;
  children: React.ReactNode;
}

export function DraggableWindow({
  title,
  isOpen = false,
  setIsOpen,
  size,
  setSize,
  snappedState,
  setSnappedState,
  modalMode,
  setModalMode,
  isInitialized = false,
  setIsInitialized,
  children,
  disableSnap = false,
  position,
  setPosition,
  maxWidth = 0.7,
  maxSnapWidth = 0.4,
  scrollable = false,
  setPreviousState,
  hasRestoredPreviousState,
  setHasRestoredPreviousState,
  minWidth = 560,
  previousState,
  headerRightContent,
}: LockedWalletTrackerProps) {
  const { width, height } = useWindowSizeStore();
  const positionRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });
  const previousSizeRef = useRef(size);
  const isSnappedRef = useRef(false);
  const animationFrameRef = useRef<number>(undefined);

  const SNAP_THRESHOLD = 30;

  // Calculate initial centered position
  const initializePosition = useCallback(() => {
    if (width && height && modalMode === "locked" && !isInitialized) {
      const newPos = {
        x: Math.round((width - size.width) / 2),
        y: Math.round((height - size.height) / 2),
      };
      positionRef.current = newPos;
      setPosition(newPos);
      setSize(() => ({ width: 560, height: 560 }));
      setSnappedState(() => ({ snappedSide: "none", nearSnappedSide: "none" }));
      setIsInitialized(true);
    } else if (modalMode !== "locked") {
      setIsInitialized(false);
    }
  }, [width, height, modalMode, isInitialized]);

  useEffect(() => {
    initializePosition();
  }, [initializePosition]);

  // Optimized mouse move handler using requestAnimationFrame
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && e.button !== 0) return;

      const updatePosition = () => {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        let newX = Math.round(dragStartRef.current.posX + deltaX);
        let newY = Math.round(dragStartRef.current.posY + deltaY);

        const maxX = window.innerWidth - previousSizeRef.current.width;
        const maxY = window.innerHeight - previousSizeRef.current.height;

        if (!disableSnap) {
          const nearLeftSnap = newX <= SNAP_THRESHOLD * 1.5;
          const nearRightSnap = newX >= maxX - SNAP_THRESHOLD * 1.5;

          setSnappedState((prev) => ({
            ...prev,
            nearSnappedSide: nearLeftSnap
              ? "left"
              : nearRightSnap
                ? "right"
                : "none",
          }));
        }

        let newWidth = previousSizeRef.current.width;
        let newHeight = previousSizeRef.current.height;
        let snappingNow =
          !disableSnap &&
          (newX <= SNAP_THRESHOLD || newX >= maxX - SNAP_THRESHOLD);

        if (snappingNow) {
          if (!isSnappedRef.current) {
            previousSizeRef.current = size;
            isSnappedRef.current = true;
            setSnappedState((prev) => ({
              ...prev,
              snappedSide: prev.nearSnappedSide,
            }));
            setIsDragging(false);
          }
          newX = newX <= SNAP_THRESHOLD ? 0 : window.innerWidth - 560;
          newWidth = 560;
          newHeight = window.innerHeight - (42.8 + 48.8 + 20);
          newY = 0;
        } else if (isSnappedRef.current) {
          newWidth = previousSizeRef.current.width;
          newHeight = previousSizeRef.current.height;
          isSnappedRef.current = false;
          setSnappedState((prev) => ({ ...prev, snappedSide: "none" }));
        }

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // Update ref immediately for next frame
        positionRef.current = { x: newX, y: newY };

        // Only update state if position actually changed
        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }

        setSize(() => ({ width: newWidth, height: newHeight }));
      };

      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Schedule update for next animation frame
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    },
    [isDragging, size, disableSnap, setSnappedState, setSize, position],
  );

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    if (snappedState.snappedSide !== "none") return;
    setIsDragging(false);
    document.body.style.userSelect = "";

    let newWidth = Math.min(
      previousSizeRef.current.width,
      window.innerWidth * maxSnapWidth,
    );

    if (snappedState.nearSnappedSide !== "none") {
      const newX =
        snappedState.nearSnappedSide === "left"
          ? 0
          : window.innerWidth - previousSizeRef.current.width;

      setPosition({ x: newX, y: 0 });
      setSize((prev) => ({
        ...prev,
        width: newWidth,
        height: window.innerHeight - (42.8 + 48.8 + 20),
      }));
      isSnappedRef.current = true;
      setSnappedState((prev) => ({
        ...prev,
        snappedSide: prev.nearSnappedSide,
      }));
    }
  }, [snappedState.nearSnappedSide, setSize, setSnappedState, snappedState]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleResizeStart = useCallback(() => {
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };
  }, [size, position]);

  const handleResize = useCallback<ResizeHandler>(
    (_event, direction, _ref, d) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newWidth = Math.min(
        Math.round(resizeStartRef.current.width + d.width),
        viewportWidth * maxWidth,
      );
      let newHeight = Math.round(resizeStartRef.current.height + d.height);

      // Apply MAX_SNAP_WIDTH constraint regardless of snap state
      if (snappedState.snappedSide !== "none") {
        newWidth = Math.min(newWidth, viewportWidth * maxSnapWidth);
      }

      let newPosX = position.x;
      let newPosY = position.y;

      if (direction.includes("left") && newWidth < viewportWidth * maxWidth) {
        newPosX = Math.round(resizeStartRef.current.posX - d.width);
      }
      if (direction.includes("top")) {
        newPosY = Math.round(resizeStartRef.current.posY - d.height / 2);
      }

      newWidth = Math.min(newWidth, viewportWidth - newPosX);
      newHeight = Math.min(newHeight, viewportHeight - newPosY);

      newPosX = Math.max(0, Math.min(newPosX, viewportWidth - newWidth));
      newPosY = Math.max(0, Math.min(newPosY, viewportHeight - newHeight));

      if (!isSnappedRef.current) {
        previousSizeRef.current = { width: newWidth, height: newHeight };
      }

      setSize(() => ({ width: newWidth, height: newHeight }));
      setPosition({ x: newPosX, y: newPosY });
    },
    [position, setSize],
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      document.body.style.userSelect = "none";
    },
    [position],
  );

  const handleUnlock = useCallback(() => {
    setModalMode("side");
    setSnappedState(() => ({ snappedSide: "none", nearSnappedSide: "none" }));
    setIsInitialized(false);
    isSnappedRef.current = false;
    document.body.style.overflow = "hidden";
  }, [setModalMode, setSize, setSnappedState, setIsInitialized]);

  const resizableProps = useMemo(
    () => ({
      size,
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      maxWidth:
        snappedState.snappedSide !== "none"
          ? `${maxSnapWidth * 100}dvw`
          : `${maxWidth * 100}dvw`,
      minWidth: minWidth,
      minHeight: snappedState.snappedSide !== "none" ? "100%" : 480,
      bounds: "window" as const,
      boundsByDirection: true,
      enable: {
        top: !isSnappedRef.current,
        bottom: !isSnappedRef.current,
        left: snappedState.snappedSide !== "left",
        right: snappedState.snappedSide !== "right",
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
        bottomRight: isSnappedRef.current
          ? "hidden"
          : "bg-transparent !size-10",
        bottomLeft: isSnappedRef.current ? "hidden" : "bg-transparent !size-10",
        topRight: isSnappedRef.current ? "hidden" : "bg-transparent !size-10",
        topLeft: isSnappedRef.current ? "hidden" : "bg-transparent !size-10",
        right: "bg-transparent !w-6",
        left: "bg-transparent !w-6",
        bottom: isSnappedRef.current ? "hidden" : "bg-transparent !h-6",
        top: isSnappedRef.current ? "hidden" : "bg-transparent !h-6",
      },
      className: "h-full w-full",
    }),
    [size, handleResizeStart, handleResize, snappedState.snappedSide, minWidth],
  );

  useEffect(() => {
    if (width! < 1280) {
      if (modalMode === "locked") {
        setPreviousState({ modalMode: modalMode, size: size });

        setModalMode("side");
        setSize(() => ({ width: 0, height: 0 }));

        // Reset restoration flag saat switch ke side
        setHasRestoredPreviousState(false);
      }

      if (snappedState.snappedSide === "none") {
        setIsOpen(false);
      }
    } else if (
      width! >= 1280 &&
      modalMode === "side" &&
      previousState &&
      !hasRestoredPreviousState
    ) {
      setModalMode(previousState.modalMode);
      setSize(() => previousState.size);
      setHasRestoredPreviousState(true);
    }
  }, [
    width,
    snappedState.snappedSide,
    previousState,
    hasRestoredPreviousState,
  ]);

  if (!isOpen || modalMode !== "locked") return null;

  const zIndex = isDragging
    ? 9999
    : snappedState.nearSnappedSide !== "none"
      ? 50
      : 999;
  const opacity =
    snappedState.snappedSide !== "none"
      ? 1
      : snappedState.nearSnappedSide !== "none"
        ? 0.7
        : 1;

  return (
    <AnimatePresence>
      <div
        className={cn(
          "hidden overflow-hidden xl:block",
          scrollable && "h - full",
        )}
        style={{
          zIndex,
          position: snappedState.snappedSide === "none" ? "fixed" : "relative",
          opacity,
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            x:
              snappedState.snappedSide === "left"
                ? -50
                : snappedState.snappedSide === "right"
                  ? 50
                  : 0,
            y: snappedState.snappedSide === "none" ? 50 : 0,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            x:
              snappedState.snappedSide === "left"
                ? 50
                : snappedState.snappedSide === "right"
                  ? -50
                  : 0,
            y: snappedState.snappedSide === "none" ? 50 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-visible"
          style={{
            position: snappedState.snappedSide === "none" ? "fixed" : "unset",
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: `${size.width + 20}px`,
            height:
              snappedState.snappedSide !== "none" && scrollable
                ? "100%"
                : `${size.height}px`,
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          <Resizable {...resizableProps}>
            <div className="relative flex h-full w-full flex-col rounded-[8px] border border-border bg-card shadow-[0_0_20px_0_#000000]">
              {/* Header */}
              <div
                className={`flex w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} items-center justify-between border-b border-border p-4`}
                onMouseDown={handleDragStart}
              >
                <h1 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary md:text-[20px]">
                  {title}
                </h1>
                <div className="flex w-fit items-center gap-x-2">
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
                      <TooltipContent className="z-[1000]">
                        <p>Pop in</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button
                    onClick={() => setIsOpen(false)}
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
