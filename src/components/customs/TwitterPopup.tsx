"use client";

import React from "react";
import AllVariantTwitterMonitorList from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import Separator from "@/components/customs/Separator";
import AddPostButton from "@/components/customs/buttons/AddPostButton";
import ManagePostButton from "@/components/customs/buttons/ManagePostButton";
import DexBuySettings from "@/components/customs/DexBuySettings";
import { PopupWindow } from "@/components/customs/PopupWindow";
import SocialMonitorOption from "./popovers/SocialMonitorOption";
import useSocialFeedMonitor from "@/hooks/use-social-feed-monitor";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { FeedType } from "@/types/monitor";
import Image from "next/image";
import { usePopupByName } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";

interface LockedTwitterMonitorProps {
  disableSnap?: boolean;
}

export default function TwitterPopup({
  disableSnap = false,
}: LockedTwitterMonitorProps) {
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
  const { size: popUpSize } = usePopupByName("twitter");
  /* console.log("popup nih", popUpSize) */;

  return (
    <PopupWindow
      title="Monitor"
      windowName="twitter"
      disableSnap={disableSnap}
      maxWidth={0.6}
      minWidth={420}
      headerRightContent={
        <div className="hidden lg:flex">
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
                    width={4}
                    height={4}
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
                    width={4}
                    height={4}
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
                    width={4}
                    height={4}
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
            <WalletSelectionButton
              value={cosmoWallets}
              setValue={setCosmoWallets}
              isReplaceWhenEmpty={false}
              maxWalletShow={10}
              displayVariant="name"
              customWalletIcon="/icons/wallet.svg"
              className="w-[108px]"
            />
          </div>
        </div>
      }
    >
      {/* Twitter Card Grids */}
      <div className="flex h-full w-full flex-col gap-4">
        <div
          className={cn(
            "mt-4 grid w-full items-center justify-between gap-4",
            popUpSize.width < 880 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          <div className="mx-4 flex w-full max-w-sm items-center gap-x-2">
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
            <DexBuySettings variant="Twitter Monitor Pop Up" />
          </div>
        </div>
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
            variant={popUpSize.width > 690 ? "large" : "small"}
            isFullscreen={false}
          />
        </div>
      </div>
    </PopupWindow>
  );
}
