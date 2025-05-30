"use client";

import React, { useEffect } from "react";
import { useTwitterMonitorModalFullscreenStore } from "@/stores/footer/use-twitter-monitor-modal-fullscreen.store";
import useSocialFeedMonitor, {
  menuList,
} from "@/hooks/use-social-feed-monitor";
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import AllVariantTwitterMonitorList from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import { cn } from "@/libraries/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddPostButton from "@/components/customs/buttons/AddPostButton";
import ManagePostButton from "@/components/customs/buttons/ManagePostButton";
import DexBuySettings from "@/components/customs/DexBuySettings";
import { PopupState, usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import SocialMonitorOption from "@/components/customs/popovers/SocialMonitorOption";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { FeedType } from "@/types/monitor";

export default function TwitterMonitorModalContent() {
  const {
    finalMessagesMulti,
    selectedSettingMenu,
    setSelectedSettingMenu,
    isLoading,
    selectedTypeFeeds,
    toggleFeedType,
  } = useSocialFeedMonitor();

  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);

  // Responsive Configuration 📱
  const width = useWindowSizeStore((state) => state.width);

  const { popups, setPopupState, togglePopup } = usePopupStore();
  const twitterPopup = popups.find((p) => p.name === "twitter") as PopupState;

  const { twitterMonitorModalFullscreen, setTwitterMonitorModalFullscreen } =
    useTwitterMonitorModalFullscreenStore();
  useEffect(() => {
    if (width) {
      if (width < 768 && twitterMonitorModalFullscreen) {
        setTwitterMonitorModalFullscreen(false);
      }
    }
  }, [width, twitterMonitorModalFullscreen]);

  return (
    <>
      {/* Mobile */}
      {!twitterMonitorModalFullscreen && (
        <div
          className={cn(
            "flex h-auto w-full flex-col justify-between pb-4 pt-[14px] md:hidden",
            !twitterMonitorModalFullscreen && "md:flex",
          )}
        >
          <div className="flex w-full items-center justify-between border-b border-border px-4 pb-3">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary">
              Monitor
            </h4>
            <div className="flex w-fit items-center gap-x-1">
              <button
                className={`relative flex aspect-square h-9 w-9 items-center justify-center rounded-[8px] ${
                  selectedTypeFeeds.includes("Truth" as FeedType)
                    ? "border border-primary bg-primary/[12%]"
                    : "border-[0.5px] border-border bg-black/20"
                }`}
                onClick={() => toggleFeedType("Truth" as FeedType)}
              >
                {selectedTypeFeeds.includes("Truth" as FeedType) && (
                  <div className="absolute right-[-1px] top-[-1px] z-10 flex h-3 w-3 items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-primary">
                    <Image
                      src="/icons/check.svg"
                      alt="Selected"
                      width={6}
                      height={6}
                      className="object-contain"
                    />
                  </div>
                )}
                <Image
                  src={
                    selectedTypeFeeds.includes("Truth")
                      ? "/icons/social/truth-purple.svg"
                      : "/icons/social/truth-grey.svg"
                  }
                  alt="Truth Social Icon"
                  fill
                  quality={100}
                  className="object-contain p-1.5"
                />
              </button>
              <button
                className={`relative flex aspect-square h-9 w-9 items-center justify-center rounded-[8px] ${
                  selectedTypeFeeds.includes("Twitter" as FeedType)
                    ? "border border-primary bg-primary/[12%]"
                    : "border-[0.5px] border-border bg-black/20"
                }`}
                onClick={() => toggleFeedType("Twitter" as FeedType)}
              >
                {selectedTypeFeeds.includes("Twitter" as FeedType) && (
                  <div className="absolute right-[-1px] top-[-1px] z-10 flex h-3 w-3 items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-primary">
                    <Image
                      src="/icons/check.svg"
                      alt="Selected"
                      width={6}
                      height={6}
                      className="object-contain"
                    />
                  </div>
                )}
                <Image
                  src={
                    selectedTypeFeeds.includes("Twitter")
                      ? "/icons/social/x-purple.svg"
                      : "/icons/social/x-grey.svg"
                  }
                  alt="Twitter Icon"
                  fill
                  quality={100}
                  className="object-contain p-1.5"
                />
              </button>

              <button
                className={`relative flex aspect-square h-9 w-9 items-center justify-center rounded-[8px] ${
                  selectedTypeFeeds.includes("Discord" as FeedType)
                    ? "border border-primary bg-primary/[12%]"
                    : "border-[0.5px] border-border bg-black/20"
                }`}
                onClick={() => toggleFeedType("Discord" as FeedType)}
              >
                {selectedTypeFeeds.includes("Discord" as FeedType) && (
                  <div className="absolute right-[-1px] top-[-1px] z-10 flex h-3 w-3 items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-primary">
                    <Image
                      src="/icons/check.svg"
                      alt="Selected"
                      width={6}
                      height={6}
                      className="object-contain"
                    />
                  </div>
                )}
                <Image
                  src={
                    selectedTypeFeeds.includes("Discord")
                      ? "/icons/social/discord-purple.svg"
                      : "/icons/social/discord-grey.svg"
                  }
                  alt="Discord Icon"
                  fill
                  quality={100}
                  className="object-contain p-1.5"
                />
              </button>
              <div className="hidden h-[24px] w-[108px] lg:flex">
                <WalletSelectionButton
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  isReplaceWhenEmpty={false}
                  maxWalletShow={10}
                  displayVariant="name"
                  customWalletIcon="/icons/wallet.svg"
                  className="w-[80px]"
                />
              </div>
              <button
                onClick={() => {
                  setPopupState(twitterPopup.name, (p) => ({
                    ...p,
                    mode: "popup" as const,
                  }));
                  document.body.style.overflow = "";
                }}
                className="relative hidden aspect-square h-5 w-5 xl:block"
              >
                <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0 duration-300 hover:opacity-70">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src="/icons/lock.svg"
                          alt="Lock Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="z-[1000]">
                        <p>Pop out</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </button>
              <button
                title="Close"
                onClick={() => togglePopup(twitterPopup.name)}
                className="relative aspect-square h-6 w-6 xl:block"
              >
                <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/close.png"
                    alt="Close Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="mt-4 flex w-full max-w-sm items-center gap-x-2 px-4">
              <div className="w-fit">
                <SocialMonitorOption
                  type="manage"
                  trigger={<ManagePostButton isMobile />}
                  isMobile
                />
              </div>

              <Separator
                color="#202037"
                orientation="vertical"
                unit="fixed"
                fixedHeight={18}
              />

              <div className="w-full max-w-xs">
                <SocialMonitorOption type="add" trigger={<AddPostButton />} />
              </div>
            </div>

            <div className="flex w-full px-4">
              <DexBuySettings variant="Twitter Monitor Footer" />
            </div>
          </div>
        </div>
      )}

      <div className={"flex w-full flex-grow items-center justify-center"}>
        <div
          className={cn(
            "hidden h-full w-[286px] flex-shrink-0 flex-col items-center justify-between border-r border-border px-[20px] py-5 md:flex",
            !twitterMonitorModalFullscreen && "hidden md:hidden",
          )}
        >
          {/* Header */}
          <div className="flex w-full items-center justify-between pb-2">
            <h4 className="text-nowrap font-geistSemiBold text-lg text-fontColorPrimary md:text-[20px]">
              Monitor
            </h4>

            <div className="flex w-fit items-center gap-x-1.5">
              <button
                title="Minimize"
                onClick={() =>
                  setTwitterMonitorModalFullscreen(
                    !twitterMonitorModalFullscreen,
                  )
                }
                className="relative hidden aspect-square h-6 w-6 xl:block"
              >
                <div className="relative z-30 aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                  <Image
                    src="/icons/footer/minimize.png"
                    alt="Minimize Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-2 flex h-fit w-full flex-col items-center gap-y-2">
            {menuList.map((item, i) => {
              const isSelected = item.label === selectedSettingMenu;

              return (
                <button
                  key={i + item?.label}
                  onClick={() => setSelectedSettingMenu(item?.label)}
                  className={cn(
                    "relative flex h-12 w-full items-center justify-start gap-x-2 rounded-[8px] py-2 pl-2 pr-4 duration-300 md:pr-2 xl:pr-1",
                    isSelected
                      ? "bg-primary/[12%]"
                      : "bg-white/[6%] md:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "h-8 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                      isSelected && "bg-primary",
                    )}
                  ></span>

                  <div className="relative aspect-square size-6 flex-shrink-0">
                    <Image
                      src={
                        isSelected ? item?.icons?.active : item?.icons?.inactive
                      }
                      alt={item?.label + "Icon"}
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>

                  <span
                    className={cn(
                      "inline-block text-nowrap text-base text-fontColorSecondary duration-300",
                      isSelected && "font-geistSemiBold text-[#DF74FF]",
                    )}
                  >
                    {item?.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {twitterMonitorModalFullscreen && (
            <div className="mt-auto flex w-full flex-col items-center justify-center gap-y-2">
              <SocialMonitorOption type="add" trigger={<AddPostButton />} />
              <SocialMonitorOption
                type="manage"
                trigger={<ManagePostButton isMobile />}
              />
            </div>
          )}
        </div>

        {/* Twitter Card Grids */}
        <div
          className={cn(
            "flex h-full w-full flex-col",
            !twitterMonitorModalFullscreen && "md:mt-0",
          )}
        >
          {!isLoading && finalMessagesMulti.length === 0 && (
            <div className="mx-3 flex h-min items-start gap-x-1 rounded-sm bg-primary/[12%] px-2 py-1.5">
              <span>💡</span>
              <span className="h-min text-sm text-primary">
                We only fetch new tweets from the moment you add an account.
                Tweets are not stored, so refreshing the page will remove them.
              </span>
            </div>
          )}
          <div className="relative grid w-full flex-grow grid-cols-1 px-4">
            <AllVariantTwitterMonitorList
              list={finalMessagesMulti}
              variant="small"
              isFullscreen={false}
              showScrollbar={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex h-16 w-full items-center gap-x-2 border-t border-border bg-card p-4 md:hidden">
        <div className="items-center gap-x-2">
          <SocialMonitorOption
            type="manage"
            trigger={<ManagePostButton isMobile />}
            isMobile
          />
        </div>

        <Separator
          color="#202037"
          orientation="vertical"
          unit="fixed"
          fixedHeight={18}
        />

        <div className="flex w-full flex-grow items-center justify-center gap-x-2">
          <SocialMonitorOption type="add" trigger={<AddPostButton />} />
        </div>
      </div>
    </>
  );
}
