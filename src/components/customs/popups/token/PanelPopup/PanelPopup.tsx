"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useOpenInstantTrade } from "@/stores/token/use-open-instant-trade.store";
import { useLatestTransactionMessageStore } from "@/stores/use-latest-transactions.store";
import { motion } from "framer-motion";
// ######## Components 🧩 ########
import Image from "next/image";
import BuySectionPanel from "@/components/customs/popups/token/PanelPopup/BuySectionPanel";
import SellSectionPanel from "@/components/customs/popups/token/PanelPopup/SellSectionPanel";
import { Resizable, ResizableProps } from "re-resizable";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useQuickSellSettingsStore } from "@/stores/setting/use-quick-sell-settings.store";
import {
  convertNumberToPresetKey,
  convertPresetKeyToNumber,
} from "@/utils/convertPreset";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";

type ResizeHandler = NonNullable<ResizableProps["onResizeStop"]>;

export default function PanelPopUp() {
  const { setIsOpen, position, setPosition, size, setSize } =
    useOpenInstantTrade();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false); // Track resizing state
  const buyPresets = useQuickBuySettingsStore((state) => state.presets);
  const sellPresets = useQuickSellSettingsStore((state) => state.presets);
  const [amountLength, setAmountLength] = useState(0);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const positionRef = useRef(position);
  // const [activeBuyPreset, setActiveBuyPreset] = useState(1);
  // const [activeSellPreset, setActiveSellPreset] = useState(1);
  const activeBuyPreset = convertPresetKeyToNumber(
    useActivePresetStore((s) => s.buyPanelActivePreset),
  );
  const setBuyPanelPreset = useActivePresetStore(
    (s) => s.setBuyPanelActivePreset,
  );
  const setActiveBuyPreset = (preset: number) => {
    setBuyPanelPreset(convertNumberToPresetKey(preset));
  };
  const activeSellPreset = convertPresetKeyToNumber(
    useActivePresetStore((s) => s.sellPanelActivePreset),
  );
  const setSellPanelPreset = useActivePresetStore(
    (s) => s.setSellPanelActivePreset,
  );
  const setActiveSellPreset = (preset: number) => {
    setSellPanelPreset(convertNumberToPresetKey(preset));
  };
  const autoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.autoFeeEnabled,
  );
  const setAutoFeeEnabled = useQuickBuySettingsStore(
    (state) => state.setAutoFeeEnable,
  );

  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);

  const BUY_SCROLL_HEIGHT = useMemo(() => {
    if (autoFeeEnabled) {
      return 350;
    }
    return 340;
  }, [autoFeeEnabled, size.height]);

  const SELL_SCROLL_HEIGHT = useMemo(() => {
    if (autoFeeEnabled) {
      return 350;
    }
    return 340;
  }, [autoFeeEnabled, size.height]);

  useEffect(() => {
    try {
      // Get preset values with null checks
      const buyPresetValues =
        buyPresets[convertNumberToPresetKey(activeBuyPreset)]?.amounts || [];
      const sellPresetValues =
        sellPresets[convertNumberToPresetKey(activeSellPreset)]?.amounts || [];

      // Combine arrays safely
      const allValues = [
        ...buyPresetValues.slice(0, size.height < BUY_SCROLL_HEIGHT ? 4 : 6),
        ...sellPresetValues.slice(0, size.height < SELL_SCROLL_HEIGHT ? 4 : 6),
      ].filter(Boolean);

      // Find max length
      let maxLength = 0;
      allValues.forEach((value) => {
        if (value !== undefined && value !== null) {
          const strValue = String(value).replace(".", "");
          maxLength = Math.max(maxLength, strValue.length);
        }
      });

      /* console.log("SNAP: maxLength calculated:", maxLength) */;
      setAmountLength(maxLength || 5); // Fallback to 5 if maxLength is 0
    } catch (error) {
      console.warn("Error calculating amount length:", error);
      setAmountLength(5); // Fallback value
    }
  }, [buyPresets, sellPresets, activeBuyPreset, activeSellPreset, size.height]);

  const rerenderCount = useRef(0);
  rerenderCount.current++;

  // Update position when window size changes
  // useEffect(() => {
  //   if (!isDragging) {
  //     const newPosition = {
  //       top: Math.min(position.top, window.innerHeight - 360),
  //       right: Math.min(position.right, window.innerWidth - 400),
  //     };
  //
  //     if (
  //       newPosition.top !== position.top ||
  //       newPosition.right !== position.right
  //     ) {
  //       setPosition(newPosition);
  //     }
  //   }
  // }, [isDragging]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const posY = window.innerHeight - size.height;

      const adjustedPosition = {
        top: posY,
        right: 0,
      };

      positionRef.current = adjustedPosition;
      setPosition(adjustedPosition);
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.posX - deltaX;
      let newY = dragStartRef.current.posY + deltaY;

      newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - size.height));

      if (
        newX !== positionRef.current.right ||
        newY !== positionRef.current.top
      ) {
        positionRef.current = { top: newY, right: newX };

        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(() => {
            setPosition(positionRef.current);
            animationFrameId = 0;
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setPosition(positionRef.current);
      const container = document.getElementById("main-component");
      if (container) {
        container.style.pointerEvents = "auto";
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      /* console.log("SNAP: handleDragStart triggered") */;
      const target = e.target as HTMLElement;
      if (
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("button")
      ) {
        return;
      }

      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.right,
        posY: position.top,
      };
      // document.body.style.userSelect = "none";
      // const container = document.getElementById("main-component");
      // if (container) {
      //   container.style.pointerEvents = "none";
      // }
    },
    [position],
  );

  const latestTransactionMessages = useLatestTransactionMessageStore(
    (state) => state.messages,
  );

  const isLoading = useTokenHoldingStore((state) => state.isLoading);
  const holdingsMessages = useTokenHoldingStore((state) => state.messages);
  const finalHoldings = useMemo(() => {
    if (!holdingsMessages || !latestTransactionMessages)
      return holdingsMessages;

    if (isLoading) {
      const updatedFinalHoldings = holdingsMessages.map((holding) => {
        const updatedTokens = holding.tokens.map((token) => {
          const matchingTx = latestTransactionMessages.find(
            (tx) =>
              tx.wallet === holding.wallet && tx.mint === token.token.mint,
          );

          if (matchingTx) {
            return {
              ...token,
              balance: matchingTx.balance,
              balanceStr: matchingTx.balanceStr,
            };
          }

          return token;
        });

        return {
          ...holding,
          tokens: updatedTokens,
        };
      });

      console.warn("BALANCE ✨ - Panel Popup", {
        updatedFinalHoldings,
        latestTransactionMessages,
      });

      return updatedFinalHoldings;
    } else {
      return holdingsMessages;
    }
  }, [holdingsMessages, latestTransactionMessages, isLoading]);

  const messageChangedCount = useTokenHoldingStore(
    (state) => state.messageCount,
  );

  const fallbackWidth = 1024;
  const fallbackHeight = 768;

  const { width = fallbackWidth, height = fallbackHeight } =
    useWindowSizeStore() ?? {};

  const effectiveMinWidth = 220 + amountLength * 18;
  const effectiveMinHeight = 250;

  const isTooNarrow = width < effectiveMinWidth;
  const isTooShort = height < effectiveMinHeight;

  const MAX_WIDTH = isTooNarrow ? effectiveMinWidth : width * 0.5;
  // const MAX_HEIGHT = isTooShort ? effectiveMinHeight : 420;
  const MAX_HEIGHT = useMemo(() => {
    if (autoFeeEnabled) {
      return isTooShort ? effectiveMinHeight : 380; // Both fees enabled
    }
    return isTooShort ? effectiveMinHeight : 360; // No fees enabled
  }, [isTooShort, effectiveMinHeight, autoFeeEnabled]);

  const MIN_WIDTH = isTooNarrow ? effectiveMinWidth : effectiveMinWidth;
  // const MIN_HEIGHT = isTooShort ? effectiveMinHeight : effectiveMinHeight;

  // const MAX_HEIGHT = isTooShort ? effectiveMinHeight : 420;
  const MIN_HEIGHT = useMemo(() => {
    if (autoFeeEnabled) {
      return isTooShort ? effectiveMinHeight : effectiveMinHeight + 30; // Both fees enabled
    }
    return isTooShort ? effectiveMinHeight : effectiveMinHeight; // No fees enabled
  }, [isTooShort, effectiveMinHeight, autoFeeEnabled]);

  const resizeStartRef = useRef({
    width: 0,
    height: 0,
    posX: 0,
    posY: 0,
  });

  const handleResize: ResizeHandler = (_event, direction, _ref, d) => {
    let newWidth = resizeStartRef.current.width + d.width;
    let newHeight = resizeStartRef.current.height + d.height;

    let newPosX = position.right;
    let newPosY = position.top;

    if (direction.includes("right")) {
      newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      newPosX = Math.max(0, resizeStartRef.current.posX - d.width);
    }

    if (direction.includes("top")) {
      newHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), MAX_HEIGHT);
      newPosY = Math.max(0, resizeStartRef.current.posY - d.height);

      // Adjust top to keep bottom edge fixed if height is too small
      if (newHeight < MIN_HEIGHT) {
        const extra = MIN_HEIGHT - newHeight;
        newPosY = Math.max(0, newPosY - extra);
        newHeight = MIN_HEIGHT;
      }
    }

    if (direction.includes("bottomRight")) {
      newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      newHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), MAX_HEIGHT);
      newPosX = Math.max(0, resizeStartRef.current.posX - d.width);
    }

    if (direction.includes("topRight")) {
      newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      newHeight = Math.min(
        Math.max(resizeStartRef.current.height + d.height, MIN_HEIGHT),
        MAX_HEIGHT,
      );

      newPosX = Math.max(0, resizeStartRef.current.posX - d.width);
      newPosY = Math.max(0, resizeStartRef.current.posY - d.height);

      if (newHeight < MIN_HEIGHT) {
        const extra = MIN_HEIGHT - newHeight;
        newPosY = Math.max(0, newPosY - extra);
        newHeight = MIN_HEIGHT;
      }
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ right: newPosX, top: newPosY });
  };

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    resizeStartRef.current = {
      width: size.width,
      height: size.height,
      posX: position.right,
      posY: position.top,
    };
    const container = document.getElementById("main-component");
    if (container) {
      container.style.pointerEvents = "none";
    }
  }, [size, position, setIsResizing]);

  const resizableProps = useMemo(
    () => ({
      size,
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      onResizeStop: () => {
        const container = document.getElementById("main-component");
        setIsResizing(false); // Reset resizing state
        if (container) {
          container.style.pointerEvents = "auto";
        }
      },
      maxWidth: MAX_WIDTH,
      maxHeight: MAX_HEIGHT,
      minHeight: MIN_HEIGHT,
      minWidth: MIN_WIDTH,
      bounds: "window" as const,
      boundsByDirection: true,
      enable: {
        top: true,
        bottom: true,
        left: true,
        right: true,
        topRight: true,
        topLeft: true,
        bottomRight: true,
        bottomLeft: true,
      },
      handleStyles: {
        bottomRight: { cursor: "se-resize" },
        bottomLeft: { cursor: "sw-resize" },
        topRight: { cursor: "ne-resize" },
        topLeft: { cursor: "nw-resize" },
        right: { cursor: "e-resize" },
        left: { cursor: "w-resize" },
        bottom: { cursor: "s-resize" },
        top: { cursor: "n-resize" },
      },
      handleClasses: {
        bottomRight: "bg-transparent !size-10",
        bottomLeft: "bg-transparent !size-10",
        topRight: "bg-transparent !size-10",
        topLeft: "bg-transparent !size-10",
        right: "bg-transparent !w-6",
        left: "bg-transparent !w-6",
        bottom: "bg-transparent !h-6",
        top: "bg-transparent !h-6",
      },
      className: "h-full w-full",
    }),
    [size, handleResizeStart, handleResize],
  );

  useEffect(() => {
    if (isResizing) return;

    const EXTRA_HEIGHT_BOTH_FEES = 50;
    const baseHeight = size.height || 400;

    let newHeight = baseHeight;

    if (autoFeeEnabled) {
      newHeight += EXTRA_HEIGHT_BOTH_FEES;
    }

    newHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT));

    if (newHeight !== size.height) {
      // console.log("SNAP: Auto-updating height", {
      //   newHeight,
      //   MAX_HEIGHT,
      //   autoFeeEnabled,
      //   isResizing,
      // });
      setSize({ width: size.width, height: newHeight });
    }
  }, [autoFeeEnabled]);
  return (
    <motion.div
      style={{
        top: position.top,
        right: position.right,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        maxWidth: MAX_WIDTH,
        maxHeight: MAX_HEIGHT,
        position: "fixed",
      }}
      exit={{
        opacity: 0,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative z-[100] overflow-hidden rounded-[8px] border border-border bg-[#313149] shadow-[0_0_20px_0_#000000]",
        isDragging
          ? "cursor-grabbing border-dashed border-primary bg-secondary"
          : "gb__white__popover",
      )}
    >
      <Resizable {...resizableProps}>
        {isDragging && (
          <div className="fixed left-0 top-0 z-[100] h-screen w-screen" />
        )}
        <div
          onMouseDown={handleMouseDown}
          className="flex h-[56px] w-full cursor-grab items-center justify-between"
        >
          <div className="flex w-full items-center justify-between border-b border-white/[4%] px-3 pb-2">
            <h4 className="mr-2 text-nowrap font-geistSemiBold text-sm leading-[18px] text-fontColorPrimary">
              Instant Trade
            </h4>
            <div className="flex items-center gap-x-2">
              <WalletSelectionButton
                displayVariant="name"
                value={cosmoWallets}
                setValue={(wallet) => {
                  setCosmoWallets(wallet);
                }}
                isGlobal={false}
                className="w-32"
                maxWalletShow={10}
                variant="instant-trade"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              />
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-[10] ml-auto aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </div>
          </div>
        </div>

        <BuySectionPanel
          autoFeeEnabled={autoFeeEnabled}
          setAutoFeeEnabled={setAutoFeeEnabled}
          parentWidth={size.width}
          isSmallScreen={size.height < BUY_SCROLL_HEIGHT}
          walletSelectionClassName="max-w-full"
          buttonStyle={{
            // height: size.height < 320 ? size.height / 5 : size.height / 10,
            height: "auto",
          }}
          activeBuyPreset={activeBuyPreset}
          setActiveBuyPreset={setActiveBuyPreset}
        />
        <SellSectionPanel
          autoFeeEnabled={autoFeeEnabled}
          setAutoFeeEnabled={setAutoFeeEnabled}
          parentWidth={size.width}
          isSmallScreen={size.height < SELL_SCROLL_HEIGHT}
          finalHoldings={finalHoldings}
          messageChangedCount={messageChangedCount}
          // walletSelectionClassName="max-w-full"
          buttonStyle={{
            // height: size.height < 320 ? size.height / 5 : size.height / 10,
            height: "auto",
          }}
          activeSellPreset={activeSellPreset}
          setActiveSellPreset={setActiveSellPreset}
        />
      </Resizable>
    </motion.div>
  );
}
