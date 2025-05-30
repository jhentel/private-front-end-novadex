// ######## Libraries 📦 & Hooks 🪝 ########
import { motion } from "framer-motion";
import { Resizable } from "re-resizable";

// ######## Components 🧩 ########

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

// ######## Types 🗨️ ########
import { PnLTrackerCardProps } from "./types";

export default function PnLTrackerModalCard({
  size,
  position,
  isDragging,
  handleDragStart,
  handleResizeStart,
  handleResize,
  minSize,
  maxWidth,
  maxHeight,
  children,
}: PnLTrackerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="group fixed z-[990] overflow-visible max-lg:hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Resizable
        size={size}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        minWidth={minSize.width}
        minHeight={minSize.height}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
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
          topRight: "bg-transparent !size-10",
          topLeft: "bg-transparent !size-10",
          right: "bg-transparent !w-8",
          left: "bg-transparent !w-8",
          bottom: "bg-transparent !h-8",
          top: "bg-transparent !h-8",
        }}
        className={cn("relative h-full w-full p-[8px]")}
      >
        <motion.div
          className={cn(
            "relative flex h-full w-full flex-col overflow-visible from-[#ECA9FF]/20 via-[#EAAFFF] to-[#ECA9FF]/30 p-[0.5px] shadow-[0_0_20px_0_#000000]",
            isDragging ? "bg-blend-color-dodge" : "bg-gradient-to-r",
          )}
          onMouseDown={handleDragStart}
          id="pnl-tracker-card"
          animate={{
            scale: isDragging ? 1.01 : 1,
            opacity: isDragging ? 0.8 : 1,
            boxShadow: isDragging
              ? "0 0 30px 0 rgba(0,0,0,0.3)"
              : "0 0 20px 0 #000000",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            cursor: isDragging ? "grabbing" : "default",
            transformOrigin: "center center",
          }}
        >
          {children}
        </motion.div>
      </Resizable>
    </motion.div>
  );
}
