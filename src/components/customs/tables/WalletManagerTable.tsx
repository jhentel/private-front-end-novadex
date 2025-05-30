"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMemo, useCallback, useEffect } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
// ######## Components 🧩 ########
import Image from "next/image";
import WalletManagerCard from "@/components/customs/cards/WalletManagerCard";
import WalletManagerCardLoading from "@/components/customs/loadings/WalletManagerCardLoading";
import HeadCol from "@/components/customs/tables/HeadCol";
import EmptyState from "@/components/customs/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
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

export default function WalletManagerTable({
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
          className="relative flex h-10 items-center justify-center gap-x-[12px] px-4 max-md:w-[100%]"
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

  const HeaderData = useMemo(
    () => [
      {
        label: "Wallet name",
        className: "min-w-[160px]",
      },
      {
        label: "Solana",
        tooltipContent: "Solana & USD amounts held within the wallet",
        className: "min-w-[160px]",
      },
      {
        label: "Holdings",
        tooltipContent: "Amount of tokens held",
        className: "min-w-[160px]",
      },
      {
        label: "Actions",
        tooltipContent:
          "Action buttons which include export private key, copy wallet address, withdraw balance and reorder",
        className:
          activeTab === "My Wallets"
            ? data
                ?.filter((w) => !w.archived)
                .some((w) => {
                  const twentyFourHoursAgo = Date.now() / 1000 - 24 * 60 * 60;
                  return w.createdAt >= twentyFourHoursAgo;
                })
              ? "ml-auto min-w-[410px] max-w-[410px]"
              : "ml-auto min-w-[140px] max-w-[140px]"
            : "ml-auto min-w-[145px] max-w-[145px]",
      },
    ],
    [data],
  );

  return (
    <div className="flex w-full flex-grow flex-col rounded-[8px] border border-border bg-[#080811]">
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
      >
        <div className="absolute left-0 top-0 flex h-full w-full flex-grow flex-col">
          {isLoading ? (
            <>
              <div className="flex h-auto w-full flex-col">
                <WalletManagerCardLoading />
              </div>
            </>
          ) : (
            <>
              <div className="sticky top-0 z-[999] flex h-fit min-w-max flex-col items-center bg-[#080811]">
                <div className="flex h-10 w-full items-center border-b border-border bg-white/[4%]">
                  {TabButtons}
                </div>
                <div className="flex h-10 w-full flex-shrink-0 items-center border-b border-border pl-[25px] pr-[24px]">
                  {HeaderData.map((item, index) => (
                    <HeadCol key={index} {...item} />
                  ))}
                </div>
              </div>

              {data &&
              data?.filter((w) =>
                activeTab === "Archived Wallets" ? w.archived : !w.archived,
              ).length > 0 ? (
                <div className="flex h-auto w-full flex-col">
                  {data
                    ?.filter((w) =>
                      activeTab === "Archived Wallets"
                        ? w.archived
                        : !w.archived,
                    )
                    ?.map((wallet, index) => (
                      <WalletManagerCard
                        data={data}
                        key={wallet.address}
                        isFirst={index === 0}
                        wallet={wallet}
                      />
                    ))}
                </div>
              ) : (
                <div className="flex h-full w-full flex-grow flex-col items-center justify-center max-md:hidden">
                  {activeTab === "Archived Wallets" ? (
                    <EmptyState state="Archived Wallet" />
                  ) : (
                    <EmptyState state="Wallet" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
