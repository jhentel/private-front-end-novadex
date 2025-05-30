import { RefObject, useCallback, useEffect, useRef } from "react";
import { useNetworkHealth } from "./use-network-health";
import { useWebsocketMonitor } from "@/stores/use-websocket-monitor.store";
import { useTSMonitorMessageStore } from "@/stores/footer/use-ts-monitor-message.store";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import { useDiscordMonitorMessageStore } from "@/stores/footer/use-discord-monitor-message.store";

interface WebSocketProps {
  name: string;
  url: string;
  enableHeartbeat?: boolean;
  onopen?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void;
  onerror?: (event: Event) => void;
  onclose?: (event: CloseEvent) => void;
  onsocket?: (ws: WebSocket) => void;
  gratefullShutdown?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  staleConnectionTimeout?: number;
  shouldReconnect?: boolean;
}

const getSocketStatus = (socket: WebSocket | null) => {
  if (!socket) return "disconnected";
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "connected";
    case WebSocket.CLOSING:
      return "closing";
    case WebSocket.CLOSED:
      return "disconnected";
    default:
      return "unknown";
  }
};

export function useWebsocket({
  url,
  onopen,
  onmessage,
  onerror,
  onclose,
  onsocket,
  name,
  enableHeartbeat = true,
  maxReconnectAttempts = 10,
  heartbeatInterval = 4000,
  staleConnectionTimeout = 16000,
  shouldReconnect = true,
}: WebSocketProps) {
  const isNetworkHealthy = useNetworkHealth();
  const wsRef = useRef<WebSocket | null>(null);
  const lastMessageTimestamp = useRef<number>(Date.now());
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectCount = useRef<number>(0);
  const heartBeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isNetworkHealthyRef = useRef(isNetworkHealthy);
  const sendQueue = useRef<string[]>([]);
  const waitForOpenInterval = useRef<NodeJS.Timeout | null>(null);
  const isReady = useRef(false);
  const shouldReconnectRef = useRef(shouldReconnect);
  const { setWebsocketState, updateLastMessageTimestamp } =
    useWebsocketMonitor();
  const lastMessage = useRef<MessageEvent<any> | null>(null) as RefObject<MessageEvent<any> | null>;
  const setWebsocketTwitterMonitorRef = useTwitterMonitorMessageStore(
    (state) => state.setWebsocketRef,
  );
  const setWebSocketTSMonitorRef = useTSMonitorMessageStore(
    state => state.setWebsocketRef,
  );
  const setWebSocketDiscordMonitorRef = useDiscordMonitorMessageStore(state=>state.setWebsocketRef)


  useEffect(() => {
    isNetworkHealthyRef.current = isNetworkHealthy;
  }, [isNetworkHealthy]);

  const startHeartbeat = () => {
    if (!enableHeartbeat) return;
    clearHeartbeat();
    /* console.debug(`WS HOOK 📺 - ${name} | HEARTBEAT STARTING... ✅`) */;

    heartBeatInterval.current = setInterval(() => {
      const ws = wsRef.current;
      const now = Date.now();
      const diff = now - lastMessageTimestamp.current;

      if (!ws) return;

      const status = getSocketStatus(ws);

      // Skip sending pings while offline — avoid false disconnects
      if (!isNetworkHealthyRef.current) {
        /* console.debug(`WS HOOK 📺 - ${name} | SKIPPING HEARTBEAT — OFFLINE ❌`) */;
        setWebsocketState(name as any, {
          status: "reconnecting",
        });
        return;
      }

      setWebsocketState(name as any, {
        status,
      });

      // console.debug(`WS HOOK 📺 - ${name} | HEARTBEAT ✅`, {
      //   diff,
      //   connectionHealthy: isNetworkHealthyRef.current,
      //   status,
      // });

      if (diff > 8000) {
        /* console.debug(`WS HOOK 📺 - ${name} | HEARTBEAT — slow network ❌`) */;
      }

      const shouldReconnect =
        (status === "connected" && diff > staleConnectionTimeout) ||
        status === "closing" ||
        status === "disconnected";

      if (status === "disconnected" || ws.readyState === WebSocket.CLOSED) return connectWebsocket();

      if (shouldReconnect) {
        console.warn(
          `WS HOOK 📺 - ${name} | HEARTBEAT FAILED. CLOSING TO RECONNECT... 🛠️`,
          {
            diff,
            status,
          },
        );

        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CLOSING
        ) {
          ws.close();
        }

        return;
      }

      // Send heartbeat
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ id: name, channel: "ping" }));
      } else {
        // console.debug(
        //   `WS HOOK 📺 - ${name} | SKIPPED SENDING PONG — WS NOT OPEN`,
        //   {
        //     readyState: getSocketStatus(ws),
        //   },
        // );
      }
    }, heartbeatInterval);
  };

  const clearHeartbeat = () => {
    if (heartBeatInterval.current) {
      /* console.debug(`WS HOOK 📺 - ${name} | HEARTBEAT STOPPING...  ✅`) */;
      clearInterval(heartBeatInterval.current);
      heartBeatInterval.current = null;
    }
  };

  const connectWebsocket = useCallback(() => {
    try {
      if (!url) throw new Error("URL is undefined");

      // if ws is already connected, close it
      if (wsRef.current) {
        const status = wsRef.current.readyState;
        if (status === WebSocket.OPEN || status === WebSocket.CONNECTING) {
          // console.debug(
          //   `WS HOOK 📺 - ${name} | EXISTING CONNECTION STILL USABLE ✅`,
          //   { status: getSocketStatus(wsRef.current) },
          // );
          return;
        }

        // console.debug(`WS HOOK 📺 - ${name} | CLEANING UP STALE SOCKET... 🧹`, {
        //   status: getSocketStatus(wsRef.current),
        // });
        wsRef.current.close();
      }

      /* console.debug(`WS HOOK 📺 - ${name} | CONNECTING... ✅`) */;
      // initialize new websocket
      wsRef.current = new WebSocket(url);

      const ws = wsRef.current;
      setWebsocketState(name as any, { status: "connecting" });
      if (url === process.env["NEXT_PUBLIC_WS_TWITTER_MONITOR_URL"]) {
        setWebsocketTwitterMonitorRef(ws);
      }
      if (url === process.env["NEXT_PUBLIC_WS_TS_MONITOR_URL"]) {
        setWebSocketTSMonitorRef(ws);
      }
      if (url === process.env["NEXT_PUBLIC_WS_DISCORD_MONITOR_URL"]) {
        setWebSocketDiscordMonitorRef(ws);
      }
      setWebsocketState(name as any, { status: "connecting" });

      onsocket?.(ws);

      ws.onopen = (event) => {
        isReady.current = true;
        reconnectCount.current = 0;
        /* console.debug(`WS HOOK 📺 - ${name} | CONNECTED ✅`) */;
        setWebsocketState(name as any, {
          status: "connected",
          connectedTimestamp: new Date(),
          // retryCount: reconnectCount.current,
        });
        // clearErrors(name as any);
        startHeartbeat();
        onopen?.(event);
      };

      ws.onmessage = (event) => {
        lastMessageTimestamp.current = Date.now();
        updateLastMessageTimestamp(name as any, new Date());
        lastMessage.current = event;

        onmessage?.(event);
      };

      ws.onerror = (event) => {
        /* console.debug(`WS HOOK 📺 - ${name} | ERROR ✅`, event) */;
        setWebsocketState(name as any, { status: "unknown" });
        onReconnect()
        if (onerror) onerror(event);
      };

      ws.onclose = (event) => {
        const closeInfo = {
          name: name,
          code: event.code,
          reason: event.reason || "No reason provided",
          wasClean: event.wasClean,
          url: ws.url,
        };
        // addError(name as any, {
        //   message: JSON.stringify(closeInfo),
        //   timestamp: new Date(),
        // });
        setWebsocketState(name as any, { status: "closing" });

        if (!isNetworkHealthyRef.current) return;

        onReconnect();
        onclose?.(event);
        /* console.debug(`WS HOOK 📺 - ${name} | CLOSE ✅`, event) */;
      };
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`WS HOOK 📺 - ${name} | ERROR IN CONNECTING:`, error);
        // addError(name as any, {
        //   message: error.message || "Failed to connect WebSocket",
        //   timestamp: new Date(),
        // });
      } else {
        console.warn(`WS HOOK 📺 - ${name} | UNKNOWN ERROR:`, error);
        // addError(name as any, {
        //   message: "Unknown error during WebSocket connection",
        //   timestamp: new Date(),
        // });
      }
      setWebsocketState(name as any, { status: "unknown" });
    }
  }, [url, shouldReconnectRef.current]);

  const cleanUp = () => {
    shouldReconnectRef.current = false;
    if (heartBeatInterval.current) {
      // console.debug(
      //   `WS HOOK 📺 - ${name} | WS CLEANUP, CLEARING HEARTBEAT... ✅`,
      // );
      clearInterval(heartBeatInterval.current);
      heartBeatInterval.current = null;
    }
    if (reconnectTimeout.current) {
      // console.debug(
      //   `WS HOOK 📺 - ${name} | WS CLEANUP, CLEARING RECONNECT TIMEOUT... ✅`,
      // );
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (waitForOpenInterval.current) {
      // console.debug(
      //   `WS HOOK 📺 - ${name} | WS CLEANUP, CLEARING WAIT INTERVAL... ✅`,
      // );
      clearInterval(waitForOpenInterval.current);
      waitForOpenInterval.current = null;
    }

    // Then close and cleanup WebSocket
    if (wsRef.current) {
      // console.debug(
      //   `WS HOOK 📺 - ${name} | WS CLEANUP, CLEARING WEBSOCKET... ✅`,
      // );
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setWebsocketState(name as any, { status: "disconnected" });
  };

  const onReconnect = useCallback(() => {
    if (!shouldReconnectRef.current) {
      cleanUp();
      return;
    }

    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

    const isMaxReconnectAttemptsReached =
      reconnectCount.current >= maxReconnectAttempts;
    const isNotConnecting = wsRef.current?.readyState !== WebSocket.CONNECTING;

    const shouldRetry = !isMaxReconnectAttemptsReached && isNotConnecting;

    if (!shouldRetry) {
      cleanUp();
      return;
    }

    // 🔁 Exponential Backoff Delay: 1000ms * attempt
    const delay = 1000 * (reconnectCount.current + 1);

    reconnectTimeout.current = setTimeout(() => {
      reconnectCount.current++;
      setWebsocketState(name as any, {
        retryCount: reconnectCount.current,
        status: "reconnecting",
      });
      // console.debug(`WS HOOK 📺 - ${name} | RECONNECTING... 🔄`, {
      //   attempt: reconnectCount.current,
      //   delay,
      //   url,
      // });
      connectWebsocket();
    }, delay);
  }, [connectWebsocket, url]);

  // CONFIGURATION WS
  useEffect(() => {
    connectWebsocket();

    // cleanup
    return () => {
      cleanUp();
    };
  }, [url, connectWebsocket]);

  // send message to websocket
  const send = useCallback((data: string) => {
    const trySend = () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        /* console.debug("WS HOOK 📺 | SEND IMMEDIATE ✅", data) */;
        ws.send(data);
      } else {
        // console.debug(
        //   "WS HOOK 📺 | SOCKET NOT READY, QUEUING MESSAGE ⏳",
        //   data,
        // );
        sendQueue.current.push(data);

        if (waitForOpenInterval.current) return; // already waiting

        waitForOpenInterval.current = setInterval(() => {
          const currentWs = wsRef.current;
          if (currentWs && currentWs.readyState === WebSocket.OPEN) {
            clearInterval(waitForOpenInterval.current!);
            waitForOpenInterval.current = null;
            // console.debug(
            //   "WS HOOK 📺 | SOCKET READY, FLUSHING QUEUE ✅",
            //   sendQueue.current,
            // );

            while (sendQueue.current.length > 0) {
              currentWs.send(sendQueue.current.shift()!);
            }
          }
        }, 200);
      }
    };

    trySend();
  }, []);

  const disconnect = () => {
    /* console.debug(`WS HOOK 📺 - ${name} | MANUAL DISCONNECT CALLED ❌`) */;
    cleanUp();
  };

  return {
    send,
    getSocket: () => (isReady.current ? wsRef.current : null),
    disconnect,
    lastMessage: lastMessage.current,
    reconnect: onReconnect,
    connect: connectWebsocket,
  };
}
