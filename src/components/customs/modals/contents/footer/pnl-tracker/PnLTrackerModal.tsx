"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

// ######## Components 🧩 ########
import Image from "next/image";
import CardTheme1 from "./card-themes/CardTheme1";
import CardTheme2 from "./card-themes/CardTheme2";
import CardTheme3 from "./card-themes/CardTheme3";
import CardTheme4 from "./card-themes/CardTheme4";
import CardTheme5 from "./card-themes/CardTheme5";
import CardTheme6 from "./card-themes/CardTheme6";
import CardTheme7 from "./card-themes/CardTheme7";
import CardTheme8 from "./card-themes/CardTheme8";
import CardTheme9 from "./card-themes/CardTheme9";
import CardTheme10 from "./card-themes/CardTheme10";
import PnLTrackerSettingPopover from "./PnLTrackerSettingsPopover";

// ######## Types 🗨️ ########
import { Size, ResizeHandler } from "./types";

type Position = { x: number; y: number };

// ######## Constants ☑️ ########
const DRAG_AREA_MARGIN_BOTTOM = 42;
const STORAGE_KEY_POSITION = "pnlModalPosition";
const STORAGE_KEY_SIZE = "pnlModalSize";

export default function PnLTrackerModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const { size, setSize, selectedTheme, isSettingOpen, setIsSettingOpen } =
    usePnlSettings();
  const { width, height } = useWindowSizeStore();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });
  const initializedRef = useRef(false);

  // Calculate initial centered position ONLY when first opened or window size changes
  useEffect(() => {
    if (width && height && isOpen) {
      if (!initializedRef.current) {
        const isValidPosition =
          position.x + size.width <= width &&
          position.y + size.height <= height;

        if (!isValidPosition || (position.x === 0 && position.y === 0)) {
          setPosition({
            x: Math.round((width - size.width) / 2),
            y: Math.round((height - size.height) / 2),
          });
        }
        const savedPosition = localStorage.getItem(STORAGE_KEY_POSITION);
        const savedSize = localStorage.getItem(STORAGE_KEY_SIZE);
        if (savedPosition && savedSize) {
          try {
            const parsedPosition = JSON.parse(savedPosition) as Position;
            const parsedSize = JSON.parse(savedSize) as Size;
            setPosition(parsedPosition);
            setSize(parsedSize);
          } catch (e) {
            console.warn("Failed to parse saved state", e);
          }
        }

        initializedRef.current = true;
      }
    } else if (!isOpen) {
      initializedRef.current = false;
    }
  }, [width, height, isOpen, position, size.width, size.height]);

  // Initialize resize state
  const handleResizeStart = () => {
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResize: ResizeHandler = (_event, direction, _ref, d) => {
    let newWidth = Math.round(resizeStartRef.current.width + d.width);
    let newHeight = Math.round(resizeStartRef.current.height + d.height);

    const viewportWidth = window.innerWidth;

    let newPosX = position.x;
    let newPosY = position.y;

    if (direction.includes("left")) {
      const widthDiff = newWidth - resizeStartRef.current.width;
      newPosX = resizeStartRef.current.posX - widthDiff;

      // Prevent jumping offscreen
      if (newPosX < 0) {
        newPosX = 0;
        newWidth = resizeStartRef.current.width + resizeStartRef.current.posX; // prevent overflow
        newWidth = Math.min(newWidth, viewportWidth);
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
        newWidth = Math.min(newWidth, viewportWidth);
        newHeight = resizeStartRef.current.height + resizeStartRef.current.posY;
      }
    }
    if (direction.includes("bottomLeft")) {
      const widthDiff = newWidth - resizeStartRef.current.width;
      newPosX = resizeStartRef.current.posX - widthDiff;

      // Prevent jumping offscreen
      if (newPosX < 0) {
        newPosX = 0;
        newWidth = resizeStartRef.current.width + resizeStartRef.current.posX; // prevent overflow
        newWidth = Math.min(newWidth, viewportWidth);
      }
    }

    if (direction.includes("top")) {
      newPosY = Math.round(resizeStartRef.current.posY - d.height / 2);
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newPosX, y: newPosY });

    localStorage.setItem(
      STORAGE_KEY_SIZE,
      JSON.stringify({ width: newWidth, height: newHeight }),
    );

    localStorage.setItem(
      STORAGE_KEY_POSITION,
      JSON.stringify({ x: newPosX, y: newPosY }),
    );
  };

  // Handle header drag start
  const handleDragStart = (e: React.MouseEvent) => {
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
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    document.body.style.userSelect = "none";
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !width || !height) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.posX + deltaX;
      let newY = dragStartRef.current.posY + deltaY;

      newX = Math.max(0, Math.min(newX, width - size.width));
      newY = Math.max(
        0,
        Math.min(newY, height - DRAG_AREA_MARGIN_BOTTOM - size.height),
      );

      setPosition({
        x: Math.round(newX),
        y: Math.round(newY),
      });

      localStorage.setItem(
        STORAGE_KEY_POSITION,
        JSON.stringify({
          x: Math.round(newX),
          y: Math.round(newY),
        }),
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, width, height, size]);

  // Render the appropriate card theme based on selected theme
  const renderCardTheme = () => {
    const commonProps = {
      size,
      position,
      isDragging,
      handleDragStart,
      handleResizeStart,
      handleResize,
      onClose: () => {
        if (isOpen) onOpenChange(false);
        if (isSettingOpen) setIsSettingOpen(false);
      },
    };

    switch (selectedTheme) {
      case "theme10":
        return <CardTheme10 {...commonProps} />;
      case "theme9":
        return <CardTheme9 {...commonProps} />;
      case "theme8":
        return <CardTheme8 {...commonProps} />;
      case "theme7":
        return <CardTheme7 {...commonProps} />;
      case "theme6":
        return <CardTheme6 {...commonProps} />;
      case "theme5":
        return <CardTheme5 {...commonProps} />;
      case "theme4":
        return <CardTheme4 {...commonProps} />;
      case "theme3":
        return <CardTheme3 {...commonProps} />;
      case "theme2":
        return <CardTheme2 {...commonProps} />;
      case "theme1":
        return <CardTheme1 {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>{isOpen && <>{renderCardTheme()}</>}</AnimatePresence>
      <PnLTrackerSettingPopover
        isOpen={isSettingOpen}
        onOpenChange={setIsSettingOpen}
      />
    </>
  );
}

export const PnLTrackerModalClose = ({ onClose }: { onClose: () => void }) => {
  return (
    <button
      title="Close"
      onClick={onClose}
      className="relative size-6 flex-shrink-0 rounded-full bg-white/[8%] p-1 hover:bg-white/20"
    >
      <Image
        src="/icons/white-close.png"
        alt="Close Icon"
        quality={100}
        width={16}
        height={16}
        className="pointer-events-none size-4 object-contain"
      />
    </button>
  );
};
