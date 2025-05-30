"use client";

import { useTwitterMonitorLockedStore } from "@/stores/footer/use-twitter-monitor-locked.store";
import React from "react";
import AllVariantTwitterMonitorList from "@/components/customs/lists/footer/AllVariantTwitterMonitorList";
import Separator from "@/components/customs/Separator";
import AddPostButton from "@/components/customs/buttons/AddPostButton";
import ManagePostButton from "@/components/customs/buttons/ManagePostButton";
import DexBuySettings from "@/components/customs/DexBuySettings";
import { DraggableWindow } from "./DraggableWindow";
import SocialMonitorOption from "./popovers/SocialMonitorOption";
import useSocialFeedMonitor from "@/hooks/use-social-feed-monitor";

interface LockedTwitterMonitorProps {
  disableSnap?: boolean;
  scrollable?: boolean;
}

export function LockedTwitterMonitor({
                                       disableSnap = false,
                                       scrollable = false,
                                     }: LockedTwitterMonitorProps) {
  const {
    setIsOpenTwitterMonitorModal,
    setTwitterMonitorModalMode,
    twitterMonitorModalMode,
    isOpenTwitterMonitorModal,
    twitterMonitorSnappedState,
    setTwitterMonitorSnappedState,
    twitterMonitorSize,
    setTwitterMonitorSize,
    setIsTwitterMonitorInitialized,
    isTwitterMonitorInitialized,
    twitterMonitorPosition,
    setTwitterMonitorPosition,
    previousState,
    setPreviousState,
    hasRestoredPreviousState,
    setHasRestoredPreviousState,
  } = useTwitterMonitorLockedStore();

  const { finalMessages, isLoading } = useSocialFeedMonitor();


  return (
    <DraggableWindow
      title="Monitor"
      isOpen={isOpenTwitterMonitorModal}
      setIsOpen={setIsOpenTwitterMonitorModal}
      size={twitterMonitorSize}
      setSize={setTwitterMonitorSize}
      snappedState={twitterMonitorSnappedState}
      setSnappedState={setTwitterMonitorSnappedState}
      modalMode={twitterMonitorModalMode}
      setModalMode={setTwitterMonitorModalMode}
      disableSnap={disableSnap}
      isInitialized={isTwitterMonitorInitialized}
      setIsInitialized={setIsTwitterMonitorInitialized}
      position={twitterMonitorPosition}
      setPosition={setTwitterMonitorPosition}
      scrollable={scrollable}
      setPreviousState={setPreviousState}
      previousState={previousState}
      hasRestoredPreviousState={hasRestoredPreviousState}
      setHasRestoredPreviousState={setHasRestoredPreviousState}
      minWidth={435}
    >
      {/* Twitter Card Grids */}
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex w-full items-center gap-x-2 px-4 md:flex md:pt-4">
          <div className="flex items-center gap-x-2">
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

          <div className="flex w-full max-w-xs flex-col items-start">
            <SocialMonitorOption type="add" trigger={<AddPostButton />} />
          </div>
        </div>

        <div className="mb-2 flex w-full px-4">
          <DexBuySettings variant="Twitter Monitor" />
        </div>

        {
          !isLoading && finalMessages.length === 0 &&
          <div className="flex items-start gap-x-1 bg-primary/[12%] h-min rounded-sm py-1.5 px-2">
            <span>💡</span>
            <span className="text-sm h-min text-primary">
              We only fetch new tweets from the moment you add an account. Tweets are not stored, so refreshing the page
              will remove them.
            </span>
          </div>
        }

        <div className="relative grid w-full flex-grow grid-cols-1 px-4">
          <AllVariantTwitterMonitorList
            list={finalMessages}
            variant="small"
            isFullscreen={false}
          />
        </div>
      </div>
    </DraggableWindow>
  );
}
