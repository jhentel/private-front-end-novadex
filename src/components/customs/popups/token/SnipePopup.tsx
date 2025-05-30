"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ######## Components 🧩 ########
import Image from "next/image";
import SnipeBuyForm from "../../forms/token/SnipeBuyForm";
import SnipeSellForm from "../../forms/token/SnipeSellForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { TradeActionType } from "@/types/global";
import BuySellTabSelector from "../../BuySellTabSelector";

export const SnipePopUpContent = ({
  handleCloseOpenSnipeModal,
  activeTab,
  setActiveTab,
  dragging,
  isWithLabel = true,
}: {
  handleCloseOpenSnipeModal: () => void;
  activeTab: TradeActionType;
  setActiveTab: (tab: TradeActionType) => void;
  dragging: boolean;
  isWithLabel?: boolean;
}) => {
  return (
    <>
      {isWithLabel ? (
        <div className="flex h-[58px] w-full cursor-move items-center justify-between border-b border-border p-4">
          <h4 className="text-nowrap font-geistSemiBold text-[20px] text-fontColorPrimary">
            Sniper
          </h4>
          <button
            onClick={handleCloseOpenSnipeModal}
            className="relative aspect-square h-7 w-7 flex-shrink-0"
          >
            <Image
              src="/icons/close.png"
              alt="Close 2 Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </button>
        </div>
      ) : (
        ""
      )}

      <BuySellTabSelector
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dragging={dragging}
        tabList={tabList}
      />

      {tabList.map((tab) => {
        const isActive = activeTab === tab.label;
        const FormComponent = tab.content;

        return isActive ? <FormComponent key={tab.label} /> : null;
      })}
    </>
  );
};

type Tab = {
  label: TradeActionType;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipMessage: string;
  content: React.ComponentType;
};

const tabList: Tab[] = [
  {
    label: "Buy",
    icons: {
      active: "/icons/token/active-buy.png",
      inactive: "/icons/token/inactive-buy.png",
    },
    tooltipMessage: "Buy Information",
    content: SnipeBuyForm,
  },
  {
    label: "Sell",
    icons: {
      active: "/icons/token/active-sell.png",
      inactive: "/icons/token/inactive-sell.png",
    },
    tooltipMessage: "Sell Information",
    content: SnipeSellForm,
  },
];

type SnipePopupProps = {
  handleCloseOpenSnipeModal: () => void;
};

export default function SnipePopUp({
  handleCloseOpenSnipeModal,
}: SnipePopupProps) {
  const [activeTab, setActiveTab] = useState<TradeActionType>("Buy");

  const [dragging, setDragging] = useState(false);
  const handleDragStart = () => {
    setDragging(true);
  };
  const handleDragEnd = () => {
    setDragging(false);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        top: 100,
        right: 56,
      }}
      className="fixed z-[999] h-auto w-full max-w-[400px] rounded-[8px] border border-border bg-card shadow-[0_0_20px_0_#000000]"
    >
      <SnipePopUpContent
        handleCloseOpenSnipeModal={handleCloseOpenSnipeModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dragging={dragging}
      />
    </motion.div>
  );
}
