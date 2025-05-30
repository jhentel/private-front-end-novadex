"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { usePopupStore, WindowName } from "@/stores/use-popup-state";
import cookies from "js-cookie";
import { cn } from "@/libraries/utils";
import dynamic from "next/dynamic";
import { useParams, usePathname } from "next/navigation";
import { useWhatsNewStore } from "@/stores/use-whats-new.store";
import NewFeatureModal from "@/components/customs/modals/NewFeaturesModal";
import TokenLayout from "./TokenLayout";
import { PopupWindowHighlight } from "@/components/customs/PopupWindow";
const TwitterPopup = dynamic(
  () => import("@/components/customs/TwitterPopup"),
  {
    ssr: false,
  },
);
const WalletTrackerPopup = dynamic(
  () => import("@/components/customs/WalletTrackerPopup"),
  {
    ssr: false,
  },
);

const mainLayout: Layout = {
  name: "main",
  component: "",
};

const twitterMonitorLayout: Layout = {
  name: "twitter",
  component: <TwitterPopup key="twitter" />,
};

const walletTrackerLayout: Layout = {
  name: "wallet_tracker",
  component: <WalletTrackerPopup key="wallet_tracker" />,
};

const layout = [mainLayout, twitterMonitorLayout, walletTrackerLayout];

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
}

interface Layout {
  name: "main" | WindowName;
  component: React.ReactNode;
}

const SCROLLED_PAGES = ["referral", "token"];

export default function GlobalSnapLayout({ children }: Props) {
  const pathname = usePathname();
  const scrollable = useMemo(() => {
    return SCROLLED_PAGES.some((page) => pathname.includes(page));
  }, [pathname]);
  const { popups, currentSnappedPopup, prevSnappedLeft, prevSnappedRight } =
    usePopupStore();

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

  const param = useParams();
  const mintAddress = param?.["mint-address"] as string;

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      // alert(`Error 🔴: ${event.error.message}`);
      return true;
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      // alert(
      //   `Promise error 🔴: ${event.reason?.message || String(event.reason)}`,
      // );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const isShowWhatsNew = useWhatsNewStore((state) => state.isShowWhatsNew);
  const setIsShowWhatsNew = useWhatsNewStore(
    (state) => state.setIsShowWhatsNew,
  );
  const handleCloseNewFeatureModal = useCallback(() => {
    // setIsNewFeatureModalOpen(false);
    setIsShowWhatsNew(false);
    // You can set a cookie here to remember that the user has seen the modal
    cookies.set("_has_seen_new_feature_modal", "true", { expires: 30 });
  }, []);

  return (
    <>
      <div
        className={cn(
          "relative flex h-full w-full grow flex-col overflow-hidden xl:flex-row",
          scrollable && "h-[calc(100dvh-88.8px)]",
        )}
      >
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
                    marginLeft:
                      popup?.snappedSide === "left" && popup?.isOpen
                        ? 16
                        : undefined,

                    marginRight:
                      popup?.snappedSide === "right" && popup?.isOpen
                        ? 16
                        : undefined,
                  }}
                >
                  {component}
                </div>
              );
          },
        )}
        <PopupWindowHighlight type="left" />
        <div
          id={"main-component"}
          className={cn(
            "flex h-full w-full min-w-0 flex-1 grow flex-col",
            scrollable && "nova-scroller flex-1 overflow-y-auto",
          )}
        >
          {pathname.includes("token") ? (
            <TokenLayout key={mintAddress} mint={mintAddress} />
          ) : (
            children
          )}
        </div>
        <PopupWindowHighlight type="right" />
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
                    marginLeft:
                      popup?.snappedSide === "left" && popup?.isOpen
                        ? 16
                        : undefined,

                    marginRight:
                      popup?.snappedSide === "right" && popup?.isOpen
                        ? 16
                        : undefined,
                  }}
                >
                  {component}
                </div>
              );
          })}
      </div>

      <NewFeatureModal
        isOpen={isShowWhatsNew}
        onClose={handleCloseNewFeatureModal}
      />
    </>
  );
}
