"use client";

import { useTradesPanelStore } from '@/stores/token/use-trades-panel.store';
import { cn } from "@/libraries/utils";
import { Resizable } from "re-resizable";
import TradesPanelTable from "../tables/token/Trades/TradesPanelTable";
import { TokenDataMessageType } from "@/types/ws-general";
import { usePanelTradesSizeStore } from '@/stores/token/use-panel-size';
import { useState, useEffect } from 'react';

interface TradesPanelProps {
  initData: TokenDataMessageType | null;
}

export default function TradesPanel({ initData }: TradesPanelProps) {
  const isOpen = useTradesPanelStore((state) => state.isOpen);
  const { width, height, setPanelTradesWidth, setPanelTradesHeight } = usePanelTradesSizeStore();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
    };

    // Check initially
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isOpen || !isLargeScreen) return null;

  return (
    <Resizable
      size={{
        width: width,
        height: "100%",
      }}
      onResizeStop={(_e, _direction, ref) => {
        setPanelTradesWidth(ref.style.width);
      }}
      minWidth={300}
      maxWidth="50%"
      minHeight={460}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      handleComponent={{
        left: (
          <div className="absolute -left-2 top-0 h-full w-[12px] flex items-center cursor-col-resize group">
            <div className="w-[3px] h-full bg-border/20 group-hover:bg-shadeTable transition-colors"></div>
          </div>
        ),
      }}
      className={cn(
        "hidden md:inline-block h-auto overflow-visible rounded-[8px] relative",
        "md:border md:border-border md:bg-white/[2%]",
        "after:absolute after:-left-3 after:top-0 after:h-full after:w-[16px] after:hover:bg-shadeTable/20 after:z-[-1] after:transition-colors after:pointer-events-auto",
        "pt-0"
      )}
      handleWrapperClass="handle-wrapper z-[5]"
      handleStyles={{
        left: {
          transition: 'all 0.1s ease',
          zIndex: 5
        },
        bottom: {
          transition: 'all 0.1s ease',
          zIndex: 5
        }
      }}
    >
      <TradesPanelTable initData={initData} />
    </Resizable>
  );
} 