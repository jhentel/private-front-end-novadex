"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useWebsocketMonitor,
  WebsocketName,
  websocketNames,
} from "@/stores/use-websocket-monitor.store";
import { useCallback, useEffect, useRef, useState } from "react";
import { WifiIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import CustomToast from "./toasts/CustomToast";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebsocketNew";

function getPingStatusColor(ping: number | null): string {
  if (ping === null) return "text-gray-400";
  if (ping < 100) return "text-green-400";
  if (ping < 250) return "text-yellow-400";
  return "text-red-400";
}

type SortByPathname = {
  pathname: string;
  sorted: WebsocketName[];
};

const generalWs: WebsocketName[] = [
  "alerts",
  "solanaPrice",
  "holdings",
  "footer",
  "sniper",
  "walletBalances",
  "notifications",
  "tracker",
  "transactions",
];

const sortByPathname: SortByPathname[] = [
  {
    pathname: "/trending",
    sorted: ["trending", ...generalWs],
  },
  {
    pathname: "/holdings",
    sorted: ["chartHoldings", ...generalWs],
  },
  {
    pathname: "/token",
    sorted: ["mint", "chartHoldings", ...generalWs],
  },
  {
    pathname: "/",
    sorted: ["cosmo2", ...generalWs],
  },
];

// Ping hook
function usePing(url = "/favicon.ico", interval = 5000) {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const measure = async () => {
      const start = performance.now();
      try {
        await fetch(url, { cache: "no-store" });
        const end = performance.now();
        if (isMounted) setLatency(Math.round(end - start));
      } catch {
        if (isMounted) setLatency(null);
      }
    };

    measure();
    const id = setInterval(measure, interval);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [url, interval]);

  return latency;
}

export function WebsocketMonitor() {
  const { sendMessage } = useWebSocket({
    channel: "server_shutdown"
  })

  const websocketData = useWebsocketMonitor();
  const latency = usePing("/favicon.ico");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });

  const statusCounts = websocketNames.reduce(
    (counts, key) => {
      const status = websocketData[key].status;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    {
      connected: 0,
      connecting: 0,
      closing: 0,
      disconnected: 0,
      reconnecting: 0,
      unknown: 0,
    },
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
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
        posX: position.x,
        posY: position.y,
      };
      document.body.style.userSelect = "none";
      const container = document.getElementById("main-component");
      if (container) {
        container.style.pointerEvents = "none";
      }
    },
    [position],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newX = Math.round(dragStartRef.current.posX + deltaX);
      const newY = Math.round(dragStartRef.current.posY + deltaY);

      // Get the height and width of the component (or dynamically calculate if necessary)
      const elementWidth = 350;
      // const elementHeight = 350;
      const headerHeight = 130;

      // Get the window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate the max and min values for the positions
      const maxX = windowWidth - elementWidth;

      // Prevent moving beyond the left and right
      const clampedX = Math.max(0, Math.min(newX, maxX));

      // Prevent moving beyond the top and bottom
      // For the header, we don't want it to overflow above the screen
      const clampedHeaderY = Math.max(
        0,
        Math.min(newY, windowHeight - headerHeight),
      );

      // Set the position with the header clamped separately and body following the usual rules
      setPosition({
        x: clampedX,
        y: clampedHeaderY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      const container = document.getElementById("main-component");
      if (container) container.style.pointerEvents = "auto";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      // Calculate the position to make it bottom-right
      setPosition({
        x: Math.round(window.innerWidth - 350),
        y: Math.round(window.innerHeight - 350),
      });
      initializedRef.current = true;
    }
  }, []);

  const pathname = usePathname();

  // Find matching sort config or fall back to default
  const sortConfig = sortByPathname.find(
    ({ pathname: p }) =>
      pathname === p || // Exact match
      (p !== "/" && pathname.startsWith(`${p}/`)), // Subpath match (except for root)
  );

  const sortedWebsocketNames = sortConfig?.sorted ?? websocketNames;

  const triggerError = () => {
    // try {
    const e = new Error(
      "Minified React error #31; visit https://reactjs.org/docs/error-decoder.html?invariant=31",
    );
    e.name = "Invariant Violation";
    e.stack = `
        Error: Minified React error #31
            at Object.render (webpack-internal:///./node_modules/react-dom/cjs/react-dom.production.min.js:187:123)
            at MyComponent (webpack:///src/components/MyComponent.js?:45:20)
            at Router (webpack:///src/Router.js?:12:5)
      `;

    throw e;
    // } catch (error) {
    //   alert(`Error triggered | ${error}`);
    // }
  };

  if (!initializedRef.current) return <></>;

  return (
    <div
      className="fixed bottom-10 right-10 z-50 w-[350px] overflow-hidden rounded-lg border border-white/20 bg-black/60 text-sm text-white shadow-lg backdrop-blur-sm"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        height: isCollapsed ? "100px" : "300px",
      }}
    >
      <div
        onMouseDown={handleDragStart}
        className="relative h-full overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-white/20 px-4 py-3 backdrop-blur-md">
          <div className="relative flex items-center justify-between">
            <h1 className="text-lg font-semibold">WebSocket Monitor</h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute right-0 top-0 z-30 rounded-md p-1 transition-colors hover:bg-white/10"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-5 w-5 text-white/80" />
              ) : (
                <ChevronUpIcon className="h-5 w-5 text-white/80" />
              )}
            </button>
          </div>
          <div className="mt-2 space-y-1 text-xs text-white/80">
            <div className="space-x-2">
              <span className="text-green-400">
                Active: {statusCounts.connected}
              </span>
              <span className="text-yellow-400">
                Pending: {statusCounts.connecting}
              </span>
              <span className="text-red-400">
                Offline: {statusCounts.disconnected}
              </span>
            </div>
            {/* <button onClick={triggerError} className="text-red-500">
              Throw Errow
            </button> */}
            <div
              className={`flex items-center gap-1 ${getPingStatusColor(latency)}`}
            >
              <WifiIcon className="h-4 w-4" />
              <span>{latency !== null ? `${latency}ms` : "N/A"}</span>
            </div>
            <button onClick={() => sendMessage({
              channel: "server_shutdown"
            })} className="text-red-500">
              Shutdown websocket
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isCollapsed && (
          <div className="nova-scroller h-[calc(100%-80px)] overflow-y-auto px-4 pb-8 pt-2 backdrop-blur-sm">
            <Accordion type="multiple" className="space-y-2">
              {sortedWebsocketNames.map((key) => {
                const ws = websocketData[key];

                return (
                  <AccordionItem
                    value={key}
                    key={key}
                    className="rounded-md border-none bg-white/5 transition-colors hover:bg-white/[7%]"
                  >
                    <AccordionTrigger className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-white/[7%]">
                      <span className="w-[180px] truncate capitalize text-white/90">
                        {key}
                      </span>
                      <span
                        className={`rounded px-2 py-1 font-mono text-xs ${ws.status === "connected"
                          ? "bg-green-900/30 text-green-400"
                          : ws.status === "connecting" ||
                            ws.status === "reconnecting"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-red-900/30 text-red-400"
                          }`}
                      >
                        {ws.status}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2 text-xs text-white/80">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Connected At</p>
                          <p>
                            {ws.connectedTimestamp
                              ? new Date(
                                ws.connectedTimestamp,
                              ).toLocaleTimeString()
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Last Msg At</p>
                          <p>
                            {ws.lastMessageTimestamp
                              ? new Date(
                                ws.lastMessageTimestamp,
                              ).toLocaleTimeString()
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Retry Count</p>
                          <p>{ws.retryCount}</p>
                        </div>
                        <div>
                          <p className="flex items-center justify-between font-medium">
                            Errors
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const log = {
                                  websocket_name: key,
                                  last_message: ws.lastMessage,
                                  timestamp:
                                    ws.lastMessageTimestamp ||
                                    ws.connectedTimestamp ||
                                    null,
                                  retry: ws.retryCount,
                                  errors: ws.error,
                                };

                                navigator.clipboard
                                  .writeText(JSON.stringify(log, null, 2))
                                  .then(() => {
                                    toast.custom((t: any) => (
                                      <CustomToast
                                        tVisibleState={t.visible}
                                        message="Copied log to clipboard"
                                        state="SUCCESS"
                                      />
                                    ));
                                  })
                                  .catch(console.warn);
                              }}
                              className="ml-2 text-xs text-blue-400 underline hover:text-blue-300"
                            >
                              Copy Log
                            </button>
                          </p>
                          {ws.error.length === 0 ? (
                            <p className="text-white/60">No errors</p>
                          ) : (
                            <p className="text-white/80">
                              {ws.error.length} error(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
