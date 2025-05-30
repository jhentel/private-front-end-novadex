"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LockedTwitterMonitor } from "../customs/LockedTwitterMonitor";
import { useTwitterMonitorLockedStore } from "@/stores/footer/use-twitter-monitor-locked.store";
import { motion } from "framer-motion";
import { cn } from "@/libraries/utils";
import { LockedWalletTracker } from "../customs/LockedWalletTracker";
import { useWalletTrackerLockedStore } from "@/stores/footer/use-wallet-tracker-locked.store";
import { useSnapStateStore } from "@/stores/use-snap-state";

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

interface Layout {
  name: "main" | "twitter" | "wallet_tracker";
  component: React.ReactNode;
}

export function SnapLayout({ children, scrollable = false }: Props) {
  const {
    twitterMonitorSnappedState,
    twitterMonitorSize,
    isOpenTwitterMonitorModal: isTwitterOpen,
    setTwitterMonitorSnappedState,
    twitterMonitorModalMode,
  } = useTwitterMonitorLockedStore();

  const {
    walletTrackerSnappedState,
    walletTrackerSize,
    isOpenWalletTrackerModal: isWalletOpen,
    setWalletTrackerSnappedState,
    walletTrackerModalMode,
  } = useWalletTrackerLockedStore();

  const layout: Layout[] = useMemo(
    () => [
      {
        name: "main",
        component: children,
      },
      {
        name: "twitter",
        component: <LockedTwitterMonitor scrollable={scrollable} />,
      },
      {
        name: "wallet_tracker",
        component: <LockedWalletTracker scrollable={scrollable} />,
      },
    ],
    [children],
  );

  const { currentSnapped, setCurrentSnapped, setSnappedSize } =
    useSnapStateStore();

  const [snap, setSnap] = useState({
    nearSide: "none" as "none" | "left" | "right",
    snappedSide: "none" as "none" | "left" | "right",
    width: 0,
    height: 0,
  });

  // Update current snapped component and handle unsnap when closed
  useEffect(() => {
    if (
      twitterMonitorSnappedState.snappedSide !== "none" &&
      twitterMonitorModalMode === "locked" &&
      isTwitterOpen
    ) {
      setCurrentSnapped({
        name: "twitter",
        side: twitterMonitorSnappedState.snappedSide,
        isOpen: true,
      });
      setWalletTrackerSnappedState(() => ({
        nearSnappedSide: "none",
        snappedSide: "none",
      }));
    } else if (
      walletTrackerSnappedState.snappedSide !== "none" &&
      walletTrackerModalMode === "locked" &&
      isWalletOpen
    ) {
      setCurrentSnapped({
        name: "wallet_tracker",
        side: walletTrackerSnappedState.snappedSide,
        isOpen: true,
      });
      setTwitterMonitorSnappedState(() => ({
        nearSnappedSide: "none",
        snappedSide: "none",
      }));
    } else {
      setCurrentSnapped({ name: null, side: "none", isOpen: false });
    }
  }, [
    twitterMonitorSnappedState.snappedSide,
    walletTrackerSnappedState.snappedSide,
    isTwitterOpen,
    isWalletOpen,
  ]);

  // Update snap hint state
  useEffect(() => {
    const activeSnapState =
      currentSnapped.name === "twitter"
        ? twitterMonitorSnappedState
        : currentSnapped.name === "wallet_tracker"
          ? walletTrackerSnappedState
          : { nearSnappedSide: "none", snappedSide: "none" };

    const activeSize =
      currentSnapped.name === "twitter"
        ? twitterMonitorSize
        : currentSnapped.name === "wallet_tracker"
          ? walletTrackerSize
          : { width: 0, height: 0 };

    setSnappedSize(() => ({
      width: activeSize.width,
      height: activeSize.height,
    }));
    setSnap({
      nearSide: activeSnapState.nearSnappedSide as "left" | "right" | "none",
      snappedSide: activeSnapState.snappedSide as "left" | "right" | "none",
      width: activeSize.width,
      height: activeSize.height,
    });
  }, [
    currentSnapped.name,
    twitterMonitorSnappedState,
    walletTrackerSnappedState,
    twitterMonitorSize,
    walletTrackerSize,
  ]);

  // Handle near side changes for unsnapped components
  useEffect(() => {
    if (currentSnapped.name === null) {
      const nearSide =
        twitterMonitorSnappedState.nearSnappedSide !== "none" &&
        isTwitterOpen &&
        twitterMonitorModalMode === "locked"
          ? twitterMonitorSnappedState.nearSnappedSide
          : walletTrackerSnappedState.nearSnappedSide !== "none" &&
              isWalletOpen &&
              walletTrackerModalMode === "locked"
            ? walletTrackerSnappedState.nearSnappedSide
            : "none";

      if (nearSide !== "none") {
        setSnap((prev) => ({
          ...prev,
          nearSide,
          width:
            nearSide === twitterMonitorSnappedState.nearSnappedSide
              ? twitterMonitorSize.width
              : walletTrackerSize.width,
          height:
            nearSide === twitterMonitorSnappedState.nearSnappedSide
              ? twitterMonitorSize.height
              : walletTrackerSize.height,
        }));
      }
    }
  }, [
    twitterMonitorSnappedState.nearSnappedSide,
    walletTrackerSnappedState.nearSnappedSide,
    twitterMonitorSize,
    walletTrackerSize,
    currentSnapped.name,
    isTwitterOpen,
    isWalletOpen,
  ]);

  return (
    <div className="flex h-full w-full grow flex-col xl:flex-row">
      {layout.map(({ name, component }) => {
        const isSnapped =
          (name === "twitter" &&
            twitterMonitorSnappedState.snappedSide !== "none") ||
          (name === "wallet_tracker" &&
            walletTrackerSnappedState.snappedSide !== "none");

        const snappedSide =
          name === "twitter"
            ? twitterMonitorSnappedState.snappedSide
            : name === "wallet_tracker"
              ? walletTrackerSnappedState.snappedSide
              : "none";

        if (name === "main") {
          const leftMargin =
            (twitterMonitorSnappedState.snappedSide === "left" &&
            isTwitterOpen &&
            twitterMonitorModalMode === "locked"
              ? twitterMonitorSize.width + 20
              : 0) +
            (walletTrackerSnappedState.snappedSide === "left" &&
            isWalletOpen &&
            walletTrackerModalMode === "locked"
              ? walletTrackerSize.width + 20
              : 0);

          const rightMargin =
            (twitterMonitorSnappedState.snappedSide === "right" &&
            isTwitterOpen &&
            twitterMonitorModalMode === "locked"
              ? twitterMonitorSize.width + 20
              : 0) +
            (walletTrackerSnappedState.snappedSide === "right" &&
            isWalletOpen &&
            walletTrackerModalMode === "locked"
              ? walletTrackerSize.width + 20
              : 0);

          return (
            <div
              key={name}
              className={cn("flex h-full w-full min-w-0 flex-1 grow flex-col")}
              style={{
                marginLeft: `${leftMargin}px`,
                marginRight: `${rightMargin}px`,
              }}
            >
              {component}
            </div>
          );
        }

        return (
          <div
            key={name}
            className={cn(
              isSnapped && "fixed",
              isSnapped &&
                currentSnapped.side === "left" &&
                "left-[20px] top-[53.8px]",
              isSnapped &&
                currentSnapped.side === "right" &&
                "right-0 top-[53.8px]",
              !scrollable && "h-0",
            )}
          >
            {component}
          </div>
        );
      })}
    </div>
  );
}
function SnapHint({
  nearSide,
  snappedSide,
  width,
}: {
  nearSide: "none" | "left" | "right";
  snappedSide: "none" | "left" | "right";
  width: number;
}) {
  return (
    <>
      {nearSide !== "none" && snappedSide === "none" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none relative z-50 rounded-lg bg-primary"
          style={{
            left: nearSide === "left" ? 0 : "auto",
            right: nearSide === "right" ? 0 : "auto",
            width: `${width}px`,
          }}
        />
      )}
    </>
  );
}
