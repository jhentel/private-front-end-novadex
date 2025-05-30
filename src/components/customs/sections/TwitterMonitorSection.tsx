"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

import { useSnapStateStore } from "@/stores/use-snap-state";
import useSocialFeedMonitor, {
  menuList,
  feedTypes,
} from "@/hooks/use-social-feed-monitor";

import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Separator from "@/components/customs/Separator";

import AddPostButton from "@/components/customs/buttons/AddPostButton";
import ManagePostButton from "@/components/customs/buttons/ManagePostButton";

import TwitterMonitorListSkeleton, {
  TwitterMonitorSkeletonListRef,
} from "@/components/customs/skeletons/TwitterMonitorListSkeleton";
import AllVariantTwitterMonitorList, {
  TwitterMonitorListRef,
} from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import TwitterMonitorMenuSkeleton from "@/components/customs/skeletons/TwitterMonitorMenuSkeleton";
import TwitterMonitorActionsSkeleton from "@/components/customs/skeletons/TwitterMonitorActionsSkeleton";

import SocialMonitorOption from "@/components/customs/popovers/SocialMonitorOption";

import { cn } from "@/libraries/utils";
import { FeedType, MenuLabel } from "@/types/monitor";

// Common props for desktop and mobile views
interface CommonViewProps {
  isLoading: boolean;
  finalMessages: any[];
  selectedTypeFeed: FeedType;
  setSelectedTypeFeed: (type: FeedType) => void;
  selectedSettingMenu: string;
  setSelectedSettingMenu: (menu: string) => void;
  currentSnapped: { side: string };
}

// Desktop view props
interface DesktopViewProps extends CommonViewProps {
  desktopListRef: React.RefObject<TwitterMonitorListRef>;
  desktopSkeletonRef: React.RefObject<TwitterMonitorSkeletonListRef>;
}

// Mobile view props
interface MobileViewProps extends CommonViewProps {
  mobileListRef: React.RefObject<TwitterMonitorListRef>;
  mobileSkeletonRef: React.RefObject<TwitterMonitorSkeletonListRef>;
}
export default function TwitterMonitorSection() {
  const {
    isLoading,
    finalMessages,
    selectedTypeFeed,
    setSelectedTypeFeed,
    selectedSettingMenu,
    setSelectedSettingMenu,
  } = useSocialFeedMonitor();

  const desktopListRef = useRef<TwitterMonitorListRef>(null);
  const mobileListRef = useRef<TwitterMonitorListRef>(null);
  const desktopSkeletonRef = useRef<TwitterMonitorSkeletonListRef>(null);
  const mobileSkeletonRef = useRef<TwitterMonitorSkeletonListRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const listRef = desktopListRef.current || mobileListRef.current;
      const skeletonRef =
        desktopSkeletonRef.current || mobileSkeletonRef.current;
      const activeRef = isLoading ? skeletonRef : listRef;

      if (!activeRef) return;

      const scrollInstance = activeRef.getScrollInstance();
      if (!scrollInstance) return;

      try {
        const viewportElement = scrollInstance.elements()?.viewport;
        if (!viewportElement) return;

        const rect = viewportElement.getBoundingClientRect();
        const isInViewport =
          rect.top <= window.innerHeight &&
          rect.bottom >= 0 &&
          rect.left <= window.innerWidth &&
          rect.right >= 0;

        if (isInViewport) {
          e.preventDefault();
          viewportElement.scrollBy({
            top: e.deltaY,
            behavior: "auto",
          });
        }
      } catch (error) {
        console.warn("Error handling scroll:", error);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isLoading, containerRef]);

  const currentSnapped = useSnapStateStore((state) => state.currentSnapped);

  return (
    <div
      className="relative mb-11 flex w-full flex-grow flex-col items-center justify-start lg:flex-row lg:justify-center lg:rounded-[8px]"
      ref={containerRef}
    >
      {/* Desktop */}
      <DesktopView
        isLoading={isLoading}
        finalMessages={finalMessages}
        selectedTypeFeed={selectedTypeFeed as FeedType}
        setSelectedTypeFeed={setSelectedTypeFeed as (type: FeedType) => void}
        selectedSettingMenu={selectedSettingMenu}
        setSelectedSettingMenu={(menu: string) =>
          setSelectedSettingMenu(menu as MenuLabel)
        }
        desktopListRef={
          desktopListRef as React.RefObject<TwitterMonitorListRef>
        }
        desktopSkeletonRef={
          desktopSkeletonRef as React.RefObject<TwitterMonitorSkeletonListRef>
        }
        currentSnapped={currentSnapped}
      />

      {/* Mobile */}
      <MobileView
        isLoading={isLoading}
        finalMessages={finalMessages}
        selectedTypeFeed={selectedTypeFeed as FeedType}
        setSelectedTypeFeed={setSelectedTypeFeed as (type: FeedType) => void}
        selectedSettingMenu={selectedSettingMenu}
        setSelectedSettingMenu={(menu: string) =>
          setSelectedSettingMenu(menu as MenuLabel)
        }
        mobileListRef={mobileListRef as React.RefObject<TwitterMonitorListRef>}
        mobileSkeletonRef={
          mobileSkeletonRef as React.RefObject<TwitterMonitorSkeletonListRef>
        }
        currentSnapped={currentSnapped}
      />
    </div>
  );
}

const DesktopView: React.FC<DesktopViewProps> = ({
  isLoading,
  finalMessages,
  selectedTypeFeed,
  setSelectedTypeFeed,
  selectedSettingMenu,
  setSelectedSettingMenu,
  desktopListRef,
  desktopSkeletonRef,
  currentSnapped,
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 hidden h-full w-full flex-grow gap-x-4 lg:flex",
        currentSnapped.side !== "none" && "lg:hidden",
      )}
    >
      {/* Feed Type */}
      <div className="flex h-fit w-full max-w-[220px] flex-shrink-0 flex-grow flex-col items-center justify-between rounded-[8px] border border-border p-2 xl:max-w-[280px]">
        <div className="flex h-fit w-full flex-col items-center gap-y-2">
          {isLoading ? (
            <TwitterMonitorMenuSkeleton variant="desktop" />
          ) : (
            menuList.map((item, i) => {
              const isSelected = item.label === selectedSettingMenu;

              return (
                <button
                  key={i + item.label}
                  onClick={() => setSelectedSettingMenu(item.label)}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-start gap-x-2 rounded-[8px] py-2 pl-2 pr-4 duration-300 xl:pr-2",
                    isSelected ? "bg-primary/[12%]" : "bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                      isSelected && "bg-primary",
                    )}
                  ></span>

                  <div className="relative aspect-square size-6 flex-shrink-0">
                    <Image
                      src={isSelected ? item.icons.active : item.icons.inactive}
                      alt={`${item.label} Icon`}
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>

                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary duration-300",
                      isSelected && "text-[#DF74FF]",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex h-full w-full flex-col">
        <div className="mb-4 flex items-center justify-start gap-x-2">
          {feedTypes.map((item) => (
            <button
              key={`${item}-button`}
              className={cn(
                "relative flex h-8 items-center justify-start gap-x-2 rounded-[23px] px-3 py-1 text-center duration-300",
                selectedTypeFeed === item
                  ? "border border-primary bg-primary/[12%]"
                  : "border border-secondary bg-transparent",
              )}
              onClick={() => setSelectedTypeFeed(item as FeedType)}
            >
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary duration-300",
                  selectedTypeFeed === item && "text-[#DF74FF]",
                )}
              >
                {item}
              </span>
            </button>
          ))}
        </div>
        {!isLoading && finalMessages.length === 0 && (
          <div className="flex h-min items-start gap-x-1 rounded-sm bg-primary/[12%] px-2 py-1.5">
            <span>💡</span>
            <span className="h-min text-sm text-primary">
              We only fetch new tweets from the moment you add an account.
              Tweets are not stored, so refreshing the page will remove them.
            </span>
          </div>
        )}
        <div className="relative grid w-full flex-grow grid-cols-1">
          {isLoading ? (
            <TwitterMonitorListSkeleton
              variant="small"
              isFullscreen={false}
              count={10}
              ref={desktopSkeletonRef}
            />
          ) : (
            <AllVariantTwitterMonitorList
              list={finalMessages}
              variant="large"
              isFullscreen={false}
              ref={desktopListRef}
              feedType={selectedTypeFeed}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex h-fit w-full max-w-[240px] flex-shrink-0 flex-grow flex-col items-center justify-between rounded-[8px] border border-border p-2 xl:max-w-[280px]">
        <div className="mt-auto flex w-full flex-col items-center justify-center gap-y-2">
          {isLoading ? (
            <TwitterMonitorActionsSkeleton variant="desktop" />
          ) : (
            <>
              <SocialMonitorOption type="add" trigger={<AddPostButton />} />
              <SocialMonitorOption
                type="manage"
                trigger={<ManagePostButton isMobile={false} />}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MobileView: React.FC<MobileViewProps> = ({
  isLoading,
  finalMessages,
  selectedTypeFeed,
  setSelectedTypeFeed,
  selectedSettingMenu,
  setSelectedSettingMenu,
  mobileListRef,
  mobileSkeletonRef,
  currentSnapped,
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 flex h-full w-full flex-grow flex-col lg:hidden",
        currentSnapped.side !== "none" && "lg:flex",
      )}
    >
      {/* Actions */}
      <div className="flex h-auto w-full items-center gap-x-2 border-b border-border bg-card px-4 pb-4 pt-1">
        <div className="items-center gap-x-2">
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-[8px]" />
          ) : (
            <SocialMonitorOption
              type="manage"
              trigger={<ManagePostButton isMobile />}
              isMobile
            />
          )}
        </div>

        <Separator
          color="#202037"
          orientation="vertical"
          unit="fixed"
          fixedHeight={18}
        />

        <div className="w-full flex-grow items-center gap-x-2">
          {isLoading ? (
            <TwitterMonitorActionsSkeleton
              variant="mobile"
              className="col-span-2"
            />
          ) : (
            <SocialMonitorOption type="add" trigger={<AddPostButton />} />
          )}
        </div>
      </div>

      {/* Feed Type */}
      <div className="w-full pt-4">
        <ScrollArea className="h-fit w-full">
          <ScrollBar orientation="horizontal" className="h-[1px]" />
          <div className="flex h-[40px] gap-x-2">
            {isLoading ? (
              <TwitterMonitorMenuSkeleton variant="mobile" count={6} />
            ) : (
              menuList.map((menu, index) => {
                const isSelected = menu.label === selectedSettingMenu;
                return (
                  <div
                    key={menu.label}
                    className="flex cursor-pointer justify-center gap-2"
                  >
                    <button
                      onClick={() => setSelectedSettingMenu(menu.label)}
                      className={cn(
                        "relative flex h-[40px] w-fit items-center justify-start gap-x-2 rounded-[8px] py-2 pl-1 pr-3 duration-300 xl:w-full",
                        isSelected ? "bg-primary/[12%]" : "bg-white/[6%]",
                        index === 0 && "ml-4",
                        index === menuList.length - 1 && "mr-4",
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 w-1 flex-shrink-0 rounded-[10px] bg-transparent duration-300",
                          isSelected && "bg-primary",
                        )}
                      ></span>

                      <div className="relative aspect-square size-6 flex-shrink-0">
                        <Image
                          src={
                            isSelected ? menu.icons.active : menu.icons.inactive
                          }
                          alt={`${menu.label} Icon`}
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>

                      <span
                        className={cn(
                          "inline-block whitespace-nowrap text-nowrap text-sm text-fontColorSecondary duration-300",
                          isSelected
                            ? "font-geistMedium text-[#DF74FF]"
                            : "font-geistRegular",
                        )}
                      >
                        {menu.label}
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 flex items-center justify-start gap-x-2 px-4">
        {feedTypes.map((item) => (
          <button
            key={`${item}-button`}
            className={cn(
              "relative flex h-8 items-center justify-start gap-x-2 rounded-[23px] px-3 py-1 text-center duration-300",
              selectedTypeFeed === item
                ? "border border-primary bg-primary/[12%]"
                : "border border-secondary bg-transparent",
            )}
            onClick={() => setSelectedTypeFeed(item as FeedType)}
          >
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary duration-300",
                selectedTypeFeed === item && "text-[#DF74FF]",
              )}
            >
              {item}
            </span>
          </button>
        ))}
      </div>
      {/* Feed List */}
      <div className="flex h-full w-full flex-col">
        <div className="relative grid w-full flex-grow grid-cols-1 px-4 py-4">
          {isLoading ? (
            <TwitterMonitorListSkeleton
              variant="small"
              isFullscreen={false}
              count={5}
              ref={mobileSkeletonRef}
            />
          ) : (
            <AllVariantTwitterMonitorList
              list={finalMessages}
              variant="small"
              isFullscreen={false}
              ref={mobileListRef}
              feedType={selectedTypeFeed}
            />
          )}
        </div>
      </div>
    </div>
  );
};
