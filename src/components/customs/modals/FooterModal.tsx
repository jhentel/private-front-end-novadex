"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { AnimatePresence, motion } from "framer-motion";
import React, { memo } from "react";
// ######## Components 🧩 ########
import GlobalPortal from "../portals/GlobalPortal";
// ######## Utils & Helpers 🤝 ########
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

type FooterModalProps = {
  triggerChildren: React.ReactNode;
  responsiveWidthAt: number;
  modalState: boolean;
  toggleModal: () => void;
  layer: 1 | 2 | 3;
  overlayClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
  isComingSoon?: boolean;
};

const FooterModal = memo(function FooterModal({
  triggerChildren,
  responsiveWidthAt,
  modalState,
  toggleModal,
  layer,
  overlayClassName,
  contentClassName,
  children,
  isComingSoon,
}: FooterModalProps) {
  const width = useWindowSizeStore((state) => state.width);

  // Memoize style calculations
  const modalWidth = width
    ? width < responsiveWidthAt
      ? `${width - 15}px`
      : "100%"
    : "auto";

  const renderContent = () => {
    const contentProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      // style: { width: modalWidth },
      className: cn(
        "fixed md:bottom-[40px] md:left-2 z-[130] overflow-hidden md:rounded-[8px] md:border border-[#202037] bg-card shadow-[0_0_20px_0_#000000] will-change-transform p-0",
        contentClassName,
        layer === 2 && "z-[140]",
        layer === 3 && "z-[150]",
      ),
    };

    return <motion.div {...contentProps}>{children}</motion.div>;
  };

  return (
    <>
      {isComingSoon ? (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{triggerChildren}</TooltipTrigger>
            <TooltipContent className="z-[10000]">
              <p>Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        triggerChildren
      )}
      <AnimatePresence>
        {modalState && (
          <GlobalPortal>
            {/* Overlay */}
            <motion.div
              onClick={toggleModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed inset-0 z-[120] bg-black/[12%] backdrop-blur-[3px] will-change-[opacity]",
                overlayClassName,
                layer === 2 && "z-[130]",
                layer === 3 && "z-[140]",
              )}
            />
            {/* Content */}
            {renderContent()}
          </GlobalPortal>
        )}
      </AnimatePresence>
    </>
  );
});

export default FooterModal;
