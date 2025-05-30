"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMemo, useCallback } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import WalletManagerCardMobile from "@/components/customs/cards/mobile/WalletManagerCardMobile";
import WalletManagerCardMobileLoading from "@/components/customs/loadings/WalletManagerCardMobileLoading";
import EmptyState from "@/components/customs/EmptyState";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ####### Types 🗨️ ########
import { Wallet } from "@/apis/rest/wallet-manager";

type TabLabel = "My Wallets" | "Archived Wallets";

type Tab = {
  label: TabLabel;
  tooltipDescription: string;
  icon: string;
  activeIcon: string;
};

const tabList: Tab[] = [
  {
    label: "My Wallets",
    tooltipDescription: "Migrating Information",
    icon: "/icons/my-wallets.svg",
    activeIcon: "/icons/my-wallets-active.svg",
  },
  {
    label: "Archived Wallets",
    tooltipDescription: "Completed Information",
    icon: "/icons/archieve-wallets.svg",
    activeIcon: "/icons/archieve-wallets-active.svg",
  },
];

export default function WalletManagerListMobile({
  data,
  activeTab,
  setActiveTab,
  isLoading,
}: {
  data: Wallet[] | null;
  activeTab: TabLabel;
  setActiveTab: React.Dispatch<React.SetStateAction<TabLabel>>;
  isLoading: boolean;
}) {
  // Memoize callbacks
  const handleTabChange = useCallback((tab: TabLabel) => {
    setActiveTab(tab);
  }, []);
  const TabButtons = useMemo(() => {
    return tabList.map((tab) => {
      const isActive = activeTab === tab.label;

      return (
        <button
          key={tab.label}
          onClick={() => handleTabChange(tab.label)}
          className="relative flex h-10 items-center justify-center gap-x-[12px] px-4"
        >
          <div className="relative inline-block size-[20px] flex-shrink-0">
            <Image
              src={isActive ? tab.activeIcon : tab.icon}
              alt={"Icon" + tab.label}
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <span
            className={cn(
              "text-nowrap font-geistSemiBold text-sm",
              isActive ? "text-fontColorAction" : "text-fontColorSecondary",
            )}
          >
            {tab.label}
          </span>
          {isActive && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-[100px] bg-primary"></div>
          )}
        </button>
      );
    });
  }, [activeTab, handleTabChange]);

  return isLoading ? (
    <WalletManagerCardMobileLoading />
  ) : (
    <div className="flex h-auto w-full flex-col gap-y-2">
      <div className="flex h-10 w-full items-center border-b border-border bg-white/[4%]">
        {TabButtons}
      </div>

      {data &&
      data?.filter((w) =>
        activeTab === "Archived Wallets" ? w.archived : !w.archived,
      ).length > 0 ? (
        <div className="flex flex-col gap-y-2 px-4 pt-2 xl:px-0">
          {data
            ?.filter((w) =>
              activeTab === "Archived Wallets" ? w.archived : !w.archived,
            )
            ?.map((wallet, index) => (
              <WalletManagerCardMobile
                key={wallet.address}
                isFirst={index === 0}
                wallet={wallet}
              />
            ))}
        </div>
      ) : (
        <div className="flex h-full w-full flex-grow flex-col items-center justify-center md:hidden">
          {activeTab === "Archived Wallets" ? (
            <EmptyState state="Archived Wallet" size="sm" />
          ) : (
            <EmptyState state="Wallet" size="sm" />
          )}
        </div>
      )}
    </div>
  );
}
