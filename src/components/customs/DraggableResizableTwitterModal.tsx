"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTwitterMonitorModalFullscreenStore } from "@/stores/footer/use-twitter-monitor-modal-fullscreen.store";
import debounce from "lodash/debounce";

interface DraggableResizableModalProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  minHeight?: number;
}

export default function DraggableResizableTwitterModal({
  children,
  className,
  minWidth = 375,
  minHeight = 500,
}: DraggableResizableModalProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const { setModalDimensions } = useTwitterMonitorModalFullscreenStore();
  const [dimensions, setDimensions] = useState({
    width: minWidth,
    height: minHeight,
  });

  const debouncedSetModalDimensions = useRef(
    debounce((newDimensions: { width: number; height: number }) => {
      setModalDimensions(newDimensions);
    }, 100),
  ).current;

  const handleResizeStart = (event: PointerEvent) => {
    if (!constraintsRef.current) return;
    const rect = constraintsRef.current.getBoundingClientRect();
    resizeStartPos.current = {
      width: dimensions.width,
      height: dimensions.height,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleResize = (
    event: PointerEvent,
    info: { point: { x: number; y: number } },
  ) => {
    event.preventDefault();
    const container = constraintsRef.current;
    if (!container) return;

    const deltaX = event.clientX - resizeStartPos.current.x;
    const deltaY = event.clientY - resizeStartPos.current.y;
    const maxHeight = window.innerHeight - 58;

    const newWidth = Math.max(minWidth, resizeStartPos.current.width + deltaX);
    const newHeight = Math.min(
      maxHeight,
      Math.max(minHeight, resizeStartPos.current.height + deltaY),
    );

    const newDimensions = {
      width: newWidth,
      height: newHeight,
    };

    // Update local state immediately
    setDimensions(newDimensions);
    // Debounce store updates
    debouncedSetModalDimensions(newDimensions);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSetModalDimensions.cancel();
    };
  }, [debouncedSetModalDimensions]);

  // Initial dimensions
  useEffect(() => {
    setModalDimensions(dimensions);
  }, []);

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-[55] overflow-hidden">
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        dragTransition={{ power: 0.1, timeConstant: 100 }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        className={className}
        layoutRoot
      >
        {children}

        <motion.div
          className="absolute bottom-0 right-0 z-[51] flex h-6 w-6 cursor-se-resize items-center justify-center rounded-tl-md bg-[#10101E]/80 backdrop-blur-sm hover:bg-[#10101E]"
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onDragStart={handleResizeStart}
          onDrag={handleResize}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-50"
          >
            <path
              d="M9 5H5V9M13 1H1V13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
