"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LimitOrdersEditBuyForm from "@/components/customs/forms/footer/LimitOrdersEditBuyForm";
import LimitOrdersEditSellForm from "@/components/customs/forms/footer/LimitOrdersEditSellForm";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import BuySellTabSelector from "@/components/customs/BuySellTabSelector";

type TabLabel = "Buy Order" | "Sell Order";

type Tab = {
  label: TabLabel;
  icons: {
    active: string;
    inactive: string;
  };
  tooltipMessage: string;
  content: React.ComponentType<{ toggleModal: () => void }>;
};

const tabList: Tab[] = [
  {
    label: "Buy Order",
    icons: {
      active: "/icons/token/active-buy.png",
      inactive: "/icons/token/inactive-buy.png",
    },
    tooltipMessage: "Buy Order Information",
    content: LimitOrdersEditBuyForm,
  },
  {
    label: "Sell Order",
    icons: {
      active: "/icons/token/active-sell.png",
      inactive: "/icons/token/inactive-sell.png",
    },
    tooltipMessage: "Sell Order Information",
    content: LimitOrdersEditSellForm,
  },
];

type LimitOrdersEditContentProps = {
  toggleModal: () => void;
};

export default function LimitOrdersEditContent({
  toggleModal,
}: LimitOrdersEditContentProps) {
  const [activeTab, setActiveTab] = useState<TabLabel>("Buy Order");

  return (
    <>
      <div className="flex h-[58px] w-full justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Edit
        </h4>

        <button onClick={toggleModal}>
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src="/icons/footer/close.png"
              alt="Footer Close Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </button>
      </div>

      {/* Buy / Sell Tabs */}
      <div className="flex w-full flex-grow flex-col">
        <BuySellTabSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabList={tabList}
        />

        <div className="relative grid w-full flex-grow grid-cols-1">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.label;
            const FormComponent = tab.content;

            return isActive ? (
              <FormComponent key={tab.label} toggleModal={toggleModal} />
            ) : null;
          })}
        </div>
      </div>
    </>
  );
}
