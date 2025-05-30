"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Resizable, ResizableProps } from "re-resizable";
import SettingsMenu from "./SettingsMenu";
import Image from "next/image";
import FooterModal from "../modals/FooterModal";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import toast from "react-hot-toast";
import CustomToast from "../toasts/CustomToast";

type ResizeHandler = NonNullable<ResizableProps["onResizeStop"]>;

export default function SettingsPopUp({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const { width, height } = useWindowSizeStore();
  const [size, setSize] = useState({ width: 778, height: 560 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
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
  // Not when popup size changes, to prevent re-centering during resize
  useEffect(() => {
    if (width && height && isOpen && !initializedRef.current) {
      // Initialize at center with integer values to prevent sub-pixel rendering
      setPosition({
        x: Math.round((width - size.width) / 2),
        y: Math.round((height - size.height) / 2),
      });
      initializedRef.current = true;
    } else if (!isOpen) {
      // Reset the initialization flag when closed
      initializedRef.current = false;
    }
  }, [width, height, isOpen]);

  // Initialize resize state
  const handleResizeStart = () => {
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    };
  };

  // Enhanced resize handler that adjusts position based on direction
  const handleResize: ResizeHandler = (_event, direction, _ref, d) => {
    // Calculate new size with integer values
    const newWidth = Math.round(resizeStartRef.current.width + d.width);
    const newHeight = Math.round(resizeStartRef.current.height + d.height);

    // Calculate position adjustments based on resize direction
    let newPosX = position.x;
    let newPosY = position.y;

    // Adjust X position only if resizing from left side
    if (direction.includes("left")) {
      // Move half the distance to simulate resize from center
      newPosX = Math.round(resizeStartRef.current.posX - d.width / 2);
    }

    // Adjust Y position if resizing from top
    if (direction.includes("top")) {
      // Move half the distance to simulate resize from center
      newPosY = Math.round(resizeStartRef.current.posY - d.height / 2);
    }

    // Update size
    setSize({ width: newWidth, height: newHeight });

    // Update position
    setPosition({ x: newPosX, y: newPosY });
  };

  // Handle header drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
  };

  // Handle drag move (attach/remove event listeners)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Use Math.round to ensure integer pixel values
      setPosition({
        x: Math.round(dragStartRef.current.posX + deltaX),
        y: Math.round(dragStartRef.current.posY + deltaY),
      });
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
  }, [isDragging]);

  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  // Use more contained modal for small screens
  if (width && width < 1280) {
    return (
      <FooterModal
        modalState={isOpen}
        toggleModal={() => {
          onOpenChange(!isOpen);
          if (!isOpen) {
            toastTimeout.current = setTimeout(() => {
              toast.custom((t: any) => (
                <CustomToast
                  tVisibleState={t.visible}
                  message="Settings updated successfully"
                  state="SUCCESS"
                />
              ));
            }, 1000);
          }
        }}
        layer={1}
        responsiveWidthAt={920}
        isComingSoon={false}
        triggerChildren={<></>}
        contentClassName="w-full max-md:w-screen h-[90dvh] md:max-w-[1000px] flex flex-col md:h-[595px] m-0 bottom-0 left-0 right-0"
      >
        <SettingsMenu />
      </FooterModal>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] overflow-hidden">
          {/* Dark overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            style={{ pointerEvents: "none" }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[1000] overflow-visible"
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          >
            <Resizable
              size={size}
              onResizeStart={handleResizeStart}
              onResize={handleResize}
              minWidth={800}
              minHeight={400}
              bounds="window"
              handleStyles={{
                bottomRight: { cursor: "se-resize" },
                bottomLeft: { cursor: "sw-resize" },
                topRight: { cursor: "ne-resize" },
                topLeft: { cursor: "nw-resize" },
                right: { cursor: "e-resize" },
                left: { cursor: "w-resize" },
                bottom: { cursor: "s-resize" },
                top: { cursor: "n-resize" },
              }}
              handleClasses={{
                bottomRight: "bg-transparent !size-10",
                bottomLeft: "bg-transparent !size-10",
                topRight: "!size-6 bg-transparent",
                topLeft: "!size-3 bg-transparent",
                right: "bg-transparent !w-3 ",
                left: "bg-transparent !w-6 ",
                bottom: "bg-transparent !h-6",
                top: "bg-transparent !h-6",
              }}
              className="h-full w-full"
            >
              <div className="flex h-full w-full flex-col overflow-hidden rounded-[8px] border border-b border-border bg-card shadow-[0_0_20px_0_#000000]">
                <div
                  className={`flex h-[58px] w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} items-center justify-between border-b border-border p-4`}
                  onMouseDown={handleDragStart}
                >
                  <h4 className="text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary">
                    Settings
                  </h4>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      toastTimeout.current = setTimeout(() => {
                        toast.custom((t: any) => (
                          <CustomToast
                            tVisibleState={t.visible}
                            message="Settings updated successfully"
                            state="SUCCESS"
                          />
                        ));
                      }, 1000);
                    }}
                    className="relative h-7 w-7 flex-shrink-0"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <SettingsMenu />
                </div>
              </div>
            </Resizable>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
