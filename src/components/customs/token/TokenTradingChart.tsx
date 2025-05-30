"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useChartSizeStore } from "@/stores/token/use-chart-size";
import { Resizable } from "re-resizable";
import dynamic from "next/dynamic";
import { useTradesPanelStore } from '@/stores/token/use-trades-panel.store';
import { cn } from "@/libraries/utils";

// ######## Components 🧩 ########
const TokenWalletSelection = dynamic(
  () => import("@/components/customs/token/TokenWalletSelection"),
  {
    // ssr: false,
    // loading: TokenWalletSelectionLoading,
  },
);
import TVChartContainer from "@/components/TVChartContainer/NovaTradingView";
import { TokenDataMessageType } from "@/types/ws-general";
import TradesPanel from './TradesPanel';

export default function TokenTradingChart({
  mint,
  tokenData,
}: {
  mint?: string;
  tokenData: TokenDataMessageType | null;
}) {
  const { height, setChartHeight } = useChartSizeStore();
  const isTradesPanelOpen = useTradesPanelStore((state) => state.isOpen);
  const setIsTradesPanelOpen = useTradesPanelStore((state) => state.setIsOpen);

  const handleResize = (_e: any, _direction: any, ref: HTMLElement) => {
    setChartHeight(ref.offsetHeight);
  };

  return (
    <div className="flex w-full gap-2">
      <div className={cn(
        "inline-block h-auto rounded-[8px] px-2 md:mt-0 md:border md:border-border md:bg-white/[2%] md:px-0 transition-all duration-300",
        "flex-1 relative",
        isTradesPanelOpen && "pr-6"
      )}>
        <TokenWalletSelection />
        <Resizable
          size={{
            width: "100%",
            height: height,
          }}
          minHeight={408}
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResizeStop={handleResize}
          handleStyles={{
            bottom: {
              bottom: '-2px',
              background: 'transparent',
              border: 'none',
              width: 'calc(100% + 300px)',
              height: '4px',
              left: '0',
              transform: 'none'
            }
          }}
          handleClasses={{
            bottom: "!bg-transparent"
          }}
          handleComponent={{
            bottom: (
              <div className="absolute bottom-0 -right-8 w-[calc(100%+2rem)] flex h-1 cursor-row-resize flex-col items-center justify-center overflow-visible -mb-2 -z-10">
                <div className="h-[2px] w-full bg-border/20 hover:bg-shadeTable"></div>
              </div>
            ),
          }}
          className="relative z-10 h-full rounded-[8px] border border-border bg-[#080812] md:mt-0 md:rounded-none md:border-0 md:border-border"
        >
          <div className="h-full pb-0 overflow-hidden">
            <TVChartContainer mint={mint} tokenData={tokenData} />
          </div>
        </Resizable>
        <button 
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-20",
            "h-16 w-6 rounded-l-md bg-[hsl(286,90%,73%/0.1)] border-y border-l border-border",
            "hover:bg-[hsl(286,90%,73%/0.15)] transition-colors duration-200",
            "flex items-center justify-center"
          )}
          onClick={() => {
            const newState = !isTradesPanelOpen;
            setIsTradesPanelOpen(newState);
            localStorage.setItem('trades-panel-state', newState ? 'open' : 'closed');
            
            // Dispatch a custom event to notify TokenTabs
            const event = new CustomEvent('tradesPanelStateChange', { 
              detail: { isOpen: newState } 
            });
            window.dispatchEvent(event);
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={cn(
              "text-[hsl(286,90%,73%)]",
              "transition-transform duration-200",
              !isTradesPanelOpen && "rotate-180"
            )}
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
      <TradesPanel initData={tokenData} />
    </div>
  );
}
