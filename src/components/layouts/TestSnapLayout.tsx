"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import dynamic from "next/dynamic";
const TwitterPopup = dynamic(() => import("@/components/customs/TwitterPopup"));
const WalletTrackerPopup = dynamic(
  () => import("@/components/customs/WalletTrackerPopup"),
  {
    ssr: false,
  },
);

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

interface Layout {
  name: "main" | WindowName;
  component: React.ReactNode;
}

export default function TestSnapLayout({
  children,
  scrollable = false,
}: Props) {
  const mainLayout: Layout = useMemo(
    () => ({
      name: "main",
      component: children,
    }),
    [children],
  );

  const twitterMonitorLayout: Layout = useMemo(
    () => ({
      name: "twitter",
      component: <TwitterPopup key="twitter" />,
    }),
    [],
  );

  const walletTrackerLayout: Layout = useMemo(
    () => ({
      name: "wallet_tracker",
      component: <WalletTrackerPopup key="wallet_tracker" />,
    }),
    [],
  );

  const [layout, setLayout] = useState<Layout[]>([
    // mainLayout,
    {
      name: "main" as WindowName,
      component: "",
    },
    twitterMonitorLayout,
    walletTrackerLayout,
  ]);

  const { popups, currentSnappedPopup, prevSnappedLeft, prevSnappedRight } =
    usePopupStore();

  // reordering based on currentSnappedPopup
  // useEffect(() => {
  //   setLayout(() => {
  //     const newLayout: Layout[] = [];

  //     const getLayoutByName = (name: WindowName): Layout | null => {
  //       if (name === "twitter") return twitterMonitorLayout;
  //       if (name === "wallet_tracker") return walletTrackerLayout;
  //       return null;
  //     };

  //     const allPopups: WindowName[] = ["twitter", "wallet_tracker"];
  //     const seen = new Set<string>(); // to track duplicates

  //     const addIfNotExists = (layout: Layout | null) => {
  //       if (layout && !seen.has(layout.name)) {
  //         newLayout.push(layout);
  //         seen.add(layout.name);
  //       }
  //     };

  //     // Add left-snapped popups
  //     currentSnappedPopup.left.forEach((name) => {
  //       addIfNotExists(getLayoutByName(name));
  //     });

  //     // Add main in the middle
  //     addIfNotExists({
  //       name: "main",
  //       component: "",
  //     });

  //     // Add right-snapped popups (reversed)
  //     currentSnappedPopup.right
  //       .slice()
  //       .reverse()
  //       .forEach((name) => {
  //         addIfNotExists(getLayoutByName(name));
  //       });

  //     // Add unsnapped popups
  //     const unsnapped = allPopups.filter(
  //       (name) =>
  //         !currentSnappedPopup.left.includes(name) &&
  //         !currentSnappedPopup.right.includes(name),
  //     );

  //     unsnapped.forEach((name) => {
  //       addIfNotExists(getLayoutByName(name));
  //     });

  //     console.log("SNAP: layout", newLayout);
  //     return newLayout;
  //   });
  // }, [
  //   currentSnappedPopup.left.join(","),
  //   currentSnappedPopup.right.join(","),
  //   twitterMonitorLayout,
  //   walletTrackerLayout,
  // ]);

  // const insertOrReorderLayout = useCallback(function insertOrReorderLayout({
  //   updatedLayout,
  //   layoutToInsert,
  //   mainName = "main",
  //   side,
  // }: {
  //   updatedLayout: Layout[],
  //   layoutToInsert: Layout,
  //   mainName?: string,
  //   side: "left" | "right",
  // }) {
  //   let mainIdx = updatedLayout.findIndex(l => l.name === mainName);
  //   if (mainIdx === -1) return;
  //   const insertIdx = updatedLayout.findIndex(l => l.name === layoutToInsert.name);
  //   const isLeft = side === "left";
  //   const expectedIdx = isLeft ? mainIdx - 1 : mainIdx + 1;
  //
  //   // Remove if exists and not in the correct position
  //   if (insertIdx !== -1 && insertIdx !== expectedIdx) {
  //     updatedLayout.splice(insertIdx, 1);
  //     // Recalculate mainIdx after removal
  //     mainIdx = updatedLayout.findIndex(l => l.name === mainName);
  //     if (mainIdx === -1) return;
  //   }
  //
  //   // Recalculate insertIdx after removal, needed for the case where the layoutToInsert was already there, but in the wrong position.
  //   const finalInsertIdx = updatedLayout.findIndex(l => l.name === layoutToInsert.name);
  //
  //   if (finalInsertIdx === -1) {
  //     // If not inserted yet, insert it beside main
  //     const insertPosition = isLeft ? mainIdx : mainIdx + 1;
  //     updatedLayout.splice(insertPosition, 0, layoutToInsert);
  //   } else if (finalInsertIdx !== expectedIdx) {
  //     // If it was already in the array, but in wrong position, move it.
  //     updatedLayout.splice(finalInsertIdx, 1);
  //     const insertPosition = isLeft ? mainIdx : mainIdx + 1;
  //     updatedLayout.splice(insertPosition, 0, layoutToInsert);
  //   }
  //
  //   console.log("SNAP: layout", updatedLayout);
  //   setLayout(updatedLayout);
  // }, [setLayout]);

  // useEffect(() => {
  //   let updatedLayout = [...layout];
  //
  //   for (const popup of popups) {
  //     if (popup.name === "twitter") {
  //       insertOrReorderLayout({
  //         updatedLayout,
  //         layoutToInsert: twitterMonitorLayout,
  //         side: popup.snappedSide,
  //       });
  //     }
  //
  //     if (popup.name === "wallet_tracker") {
  //       insertOrReorderLayout({
  //         updatedLayout,
  //         layoutToInsert: walletTrackerLayout,
  //         side: popup.snappedSide,
  //       });
  //     }
  //   }
  //   // 🔥 Only update state if layout actually changed
  //   // console.log("SNAP: layout", updatedLayout);
  // }, [JSON.stringify(popups.map((p) => p.snappedSide))]);

  // useEffect(() => {
  //   let updatedLayout = [...layout];
  //
  //   for (const popup of popups) {
  //     if (popup.mode !== "snap") {
  //       const popupidx = updatedLayout.findIndex((l) => l.name === popup.name);
  //       if (popupidx !== -1) {
  //         updatedLayout.splice(popupidx, 1);
  //       }
  //     } else {
  //       if (popup.name === "twitter") {
  //         const twitterIdx = updatedLayout.findIndex((l) => l.name === "twitter");
  //         const mainIdx = updatedLayout.findIndex((l) => l.name === "main");
  //
  //         if (popup.snappedSide === "left" && mainIdx !== -1) {
  //           if (twitterIdx === -1) {
  //             // Not in layout, insert before main
  //             updatedLayout.splice(mainIdx, 0, twitterMonitorLayout);
  //           } else if (twitterIdx > mainIdx) {
  //             // Exists but after main, move it before main
  //             updatedLayout.splice(twitterIdx, 1); // Remove from old position
  //             updatedLayout.splice(mainIdx, 0, twitterMonitorLayout); // Insert before main
  //           }
  //         }
  //
  //         if (popup.snappedSide === "right" && mainIdx !== -1) {
  //           if (twitterIdx === -1) {
  //             // Not in layout, insert after main
  //             updatedLayout.splice(mainIdx + 1, 0, twitterMonitorLayout);
  //           } else if (twitterIdx < mainIdx) {
  //             // Exists but before main, move it after main
  //             updatedLayout.splice(twitterIdx, 1); // Remove from old position
  //             updatedLayout.splice(mainIdx, 0); // shift mainIdx back if needed
  //             updatedLayout.splice(mainIdx + 1, 0, twitterMonitorLayout);
  //           }
  //         }
  //       }
  //
  //       if (popup.name === "wallet_tracker") {
  //         const walletIdx = updatedLayout.findIndex((l) => l.name === "wallet_tracker");
  //         const mainIdx = updatedLayout.findIndex((l) => l.name === "main");
  //
  //         if (popup.snappedSide === "left" && walletIdx === -1 && mainIdx !== -1) {
  //           updatedLayout.splice(mainIdx, 0, walletTrackerLayout); // insert before main
  //         }
  //
  //         if (popup.snappedSide === "right" && walletIdx === -1 && mainIdx !== -1) {
  //           updatedLayout.splice(mainIdx + 1, 0, walletTrackerLayout); // insert after main
  //         }
  //       }
  //     }
  //   }
  //
  //   // 🔥 Only update state if layout actually changed
  //   setLayout(updatedLayout);
  //
  //   console.log("SNAP: layout", updatedLayout);
  // }, [JSON.stringify(popups.map((p) => p.name + p.snappedSide))]);

  const indexOfMain = layout.findIndex((l) => l.name === "main");

  // console.log("SNAP: indexOfMain", {
  //   currentSnappedPopup,
  //   prevSnappedLeft,
  //   prevSnappedRight,
  // });

  const sortByPriority = <T extends { name: string }>(
    originalArray: T[],
    priorityArray: string[],
  ): T[] => {
    // Create a Map to store priority indices
    const priorityMap = new Map(
      priorityArray.map((item, index) => [item, index]),
    );

    // Sort the original array by name property
    return [...originalArray].sort((a, b) => {
      const priorityA = priorityMap.has(a.name)
        ? priorityMap.get(a.name)!
        : Infinity;
      const priorityB = priorityMap.has(b.name)
        ? priorityMap.get(b.name)!
        : Infinity;
      return priorityA - priorityB;
    });
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full grow flex-col overflow-hidden xl:flex-row",
        scrollable && "h-[calc(100dvh-88.8px)]",
      )}
    >
      {/* <div
        id="left-snap-hint"
        className="mr-5 h-[calc(100%-48.8px)] w-0 rounded-md bg-primary/50 opacity-0 transition-[width,opacity] duration-75"
      ></div> */}
      {sortByPriority(layout, currentSnappedPopup.left).map(
        ({ name, component }, i) => {
          const popup = popups.find((p) => p.name === name);
          if (
            currentSnappedPopup.left.includes(name as WindowName) ||
            (prevSnappedLeft === (name as WindowName) &&
              popup?.mode === "popup") ||
            (prevSnappedLeft !== (name as WindowName) &&
              prevSnappedRight !== (name as WindowName) &&
              popup?.mode === "popup")
          )
            return (
              <div
                key={name}
                id={`${name}-popup-side`}
                style={{
                  marginLeft: scrollable
                    ? popup?.snappedSide === "left" && popup?.isOpen
                      ? 20
                      : undefined
                    : popup?.snappedSide === "right" && popup?.isOpen
                      ? 20
                      : undefined,

                  marginRight: scrollable
                    ? popup?.snappedSide === "right" && popup?.isOpen
                      ? 20
                      : undefined
                    : popup?.snappedSide === "left" && popup?.isOpen
                      ? 20
                      : undefined,
                }}
              >
                {component}
              </div>
            );
        },
      )}
      <div
        id={"main-component"}
        className={cn(
          "flex h-full w-full min-w-0 flex-1 grow flex-col",
          scrollable && "nova-scroller flex-1 overflow-y-auto",
        )}
      >
        {children}
      </div>
      {sortByPriority(layout, currentSnappedPopup.right)
        .reverse()
        .map(({ name, component }, i) => {
          const popup = popups.find((p) => p.name === name);
          if (
            currentSnappedPopup.right.includes(name as WindowName) ||
            (prevSnappedRight === (name as WindowName) &&
              popup?.mode === "popup")
          )
            return (
              <div
                key={name}
                id={`${name}-popup-side`}
                style={{
                  marginLeft: scrollable
                    ? popup?.snappedSide === "left" && popup?.isOpen
                      ? 20
                      : undefined
                    : popup?.snappedSide === "right" && popup?.isOpen
                      ? 20
                      : undefined,

                  marginRight: scrollable
                    ? popup?.snappedSide === "right" && popup?.isOpen
                      ? 20
                      : undefined
                    : popup?.snappedSide === "left" && popup?.isOpen
                      ? 20
                      : undefined,
                }}
              >
                {component}
              </div>
            );
        })}

      {/* <div
        id="right-snap-hint"
        className="ml-5 h-[calc(100%-48.8px)] w-0 rounded-md bg-primary/50 opacity-0 transition-[width,opacity] duration-75"
      ></div> */}
    </div>
  );
}
