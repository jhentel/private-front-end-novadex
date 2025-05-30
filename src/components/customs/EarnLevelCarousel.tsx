"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libraries/utils";
import type { Level } from "@/components/customs/EarnLevels";

interface EarnLevelCarouselProps {
  levels: Level[];
  focusedLevel: Level;
  onFocusLevelChange: (level: Level) => void;
}

export function EarnLevelCarousel({
  levels,
  focusedLevel,
  onFocusLevelChange,
}: EarnLevelCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, scrollX: 0, dragging: false });
  const scrollTimeout = useRef<number | null>(null);

  const scrollTo = useCallback((level: Level) => {
    const container = containerRef.current;
    const el = container?.querySelector(
      `[data-tier=\"${level.tier}\"]`,
    ) as HTMLElement;
    if (container && el) {
      const offset =
        el.offsetLeft + el.offsetWidth / 2 - container.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollTo(focusedLevel);
  }, [focusedLevel, scrollTo]);

  // Snap to closest after scroll ends
  const handleScroll = () => {
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const center = container.scrollLeft + container.offsetWidth / 2;
      let closest = levels[0];
      let minDist = Infinity;
      levels.forEach((level) => {
        const el = container.querySelector(
          `[data-tier=\"${level.tier}\"]`,
        ) as HTMLElement;
        if (el) {
          const elCenter = el.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(center - elCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = level;
          }
        }
      });
      onFocusLevelChange(closest);
    }, 100);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragInfo.current = {
      startX: clientX,
      scrollX: containerRef.current!.scrollLeft,
      dragging: true,
    };
    setIsUserDragging(true);
  };
  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragInfo.current.dragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragInfo.current.startX;
    containerRef.current!.scrollLeft = dragInfo.current.scrollX - delta;
  };
  const endDrag = () => {
    if (!dragInfo.current.dragging) return;
    dragInfo.current.dragging = false;
    setIsUserDragging(false);
    handleScroll();
  };

  const handlePrev = () => {
    const idx = levels.findIndex((l) => l.tier === focusedLevel.tier);
    if (idx > 0) onFocusLevelChange(levels[idx - 1]);
  };
  const handleNext = () => {
    const idx = levels.findIndex((l) => l.tier === focusedLevel.tier);
    if (idx < levels.length - 1) onFocusLevelChange(levels[idx + 1]);
  };

  return (
    <div className="relative mx-auto h-[132px] overflow-hidden max-md:max-w-[390px] max-sm:max-w-[320px]">
      {/* Prev Button */}
      <div className="absolute left-0 top-0 z-10 flex h-full w-[72px] items-center justify-start bg-gradient-to-r from-[#080811] to-transparent">
        <button
          onClick={handlePrev}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none"
        >
          <ChevronLeft className="h-4 w-4 text-black" />
        </button>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={endDrag}
        onScroll={handleScroll}
        className={cn(
          "flex h-full snap-x snap-mandatory scroll-px-[72px] items-end gap-6 overflow-x-auto scroll-smooth px-[188px] scrollbar-hide max-md:pl-[120px]",
          isUserDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {levels.map((level) => (
          <div key={level.tier} data-tier={level.tier} className="snap-center">
            <LevelTierItem
              level={level}
              focus={focusedLevel.tier === level.tier}
              onFocus={onFocusLevelChange}
            />
          </div>
        ))}
      </div>

      {/* Next Button */}
      <div className="absolute right-0 top-0 z-10 flex h-full w-[72px] items-center justify-end bg-gradient-to-l from-[#080811] to-transparent">
        <button
          onClick={handleNext}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none"
        >
          <ChevronRight className="h-4 w-4 text-black" />
        </button>
      </div>
    </div>
  );
}

interface LevelTierItemProps {
  level: Level;
  focus?: boolean;
  onFocus: (level: Level) => void;
}

function LevelTierItem({ level, focus = false, onFocus }: LevelTierItemProps) {
  const isLocked = level.status === "locked";
  const indicator = useMemo(() => {
    if (level.status === "ongoing") return "🟣";
    if (level.status === "complete") return "👍";
    return "🔒";
  }, [level.status]);

  return (
    <div className="relative flex flex-col items-center justify-end gap-3">
      {focus && (
        <div className="absolute -left-[6px] -top-[6px] h-[88px] w-[88px] rounded-full bg-gradient-to-b from-[#E077FF] to-[#5E30A8] p-[3px]">
          <div className="h-full w-full rounded-full bg-[#080811]" />
        </div>
      )}
      <button
        onClick={() => onFocus(level)}
        className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#242436] bg-gradient-to-b from-[#17171F] via-[#080811] to-[#080811] focus:outline-none"
      >
        <Image
          src="/icons/level.svg"
          alt="Level Icon"
          width={40}
          height={48}
          quality={100}
          draggable={false}
          className={cn(isLocked ? "grayscale" : "grayscale-0")}
        />
        <div className="absolute left-[52px] top-[50px] flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm backdrop-blur">
          {indicator}
        </div>
      </button>
      <span
        className={cn(
          "w-full text-center text-[16px] font-[400] leading-6",
          focus ? "text-white" : "text-[#9191A4]",
        )}
      >
        Level {level.tier}
      </span>
    </div>
  );
}
