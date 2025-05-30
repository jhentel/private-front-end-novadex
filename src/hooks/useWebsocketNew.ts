"use client";

import { useEffect, useRef } from "react";
import { webSocketManager } from "@/lib/websocket-manager";
import { useNetworkHealth } from "./use-network-health";
import {
  useWebsocketMonitor,
  WebsocketName,
} from "@/stores/use-websocket-monitor.store";
import { SOLANA_ADDRESS_REGEX } from "@/constants/regex";

interface WebSocketProps<T> {
  channel: string;
  onMessage?: (data: T) => void;
  onInit?: () => void;
  onLeave?: () => void;
  initialMessage?: {};
}
export function useWebSocket<T = any>({
  channel,
  initialMessage,
  onMessage,
  onInit,
  onLeave,
}: WebSocketProps<T>) {
  const isNetworkHealthy = useNetworkHealth();
  const lastMessageTimestamp = useRef<number>(Date.now());
  const heartBeatTimeout = useRef<NodeJS.Timeout | null>(null);
  const heartBeatInterval = 4000;
  const staleConnectionTimeout = 16000;
  const leaveMessageRef = useRef<Map<string, any>>(new Map());
  const isNetworkHealthyRef = useRef(isNetworkHealthy);
  const initialMessageRef = useRef(initialMessage);
  const isInitialMessageRef = useRef(false);

  const websocketName = SOLANA_ADDRESS_REGEX.test(channel)
    ? "mint"
    : (channel as WebsocketName);
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  const websocketMonitor = useWebsocketMonitor();

  const setWebsocketState = isProduction
    ? () => { }
    : websocketMonitor.setWebsocketState;
  const addError = isProduction ? () => { } : websocketMonitor.addError;
  const updateLastMessageTimestamp = isProduction
    ? () => { }
    : websocketMonitor.updateLastMessageTimestamp;
  const updatePingTimestamp = isProduction
    ? () => { }
    : websocketMonitor.updatePingTimestamp;
  const addLastMessage = isProduction
    ? () => { }
    : websocketMonitor.addLastMessage;
  const updateConnectedTimestamp = isProduction
    ? () => { }
    : websocketMonitor.updateConnectedTimestamp;

  // function log(msg: string, extra?: any) {
  //   console.debug(`WEBSOCKET SERVICE [${channel}] - ${msg}`, extra ?? "");
  // }

  function getMessageKey(message: any): string {
    if (!message) return Math.random().toString(36).substring(2, 10);

    const channel = message.channel ?? '';
    const action = message.action ?? '';

    const key = channel + action;

    return key || JSON.stringify(message);
  }

  // update network status
  useEffect(() => {
    isNetworkHealthyRef.current = isNetworkHealthy;
  }, [isNetworkHealthy]);

  const clearHeartbeat = () => {
    if (heartBeatTimeout.current) {
      clearInterval(heartBeatTimeout.current);
      heartBeatTimeout.current = null;
      // log("⛔ Heartbeat cleared");
    }
  };

  const startHeartbeat = () => {
    if (!onMessage) return;

    clearHeartbeat();
    // log("✅ Heartbeat starting...");

    heartBeatTimeout.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastMessageTimestamp.current;

      // log("💓 Heartbeat tick", {
      //   diff,
      //   connectionHealthy: isNetworkHealthyRef.current,
      // });

      if (diff > 8000) {
        /* log("⚠️ Heartbeat detected slow connection") */;
      }

      if (!isNetworkHealthyRef.current) {
        /* log("⚠️ Skipping heartbeat due to offline status") */;
        return;
      }

      const shouldReconnect = diff > staleConnectionTimeout;
      if (shouldReconnect) {
        // log("🔄 Resending subscribe message due to staleness", {
        //   ref: initialMessageRef.current,
        //   initialMessage,
        // });
        setWebsocketState(websocketName, { status: "connecting" });
        leaveMessageRef.current.forEach((message) => {
          /* log("📤 Sending leave message", message) */;
          webSocketManager.send(message);
        });
      }
    }, heartBeatInterval);
  };

  const sendMessage = (message: any, isLeave?: boolean) => {
    setWebsocketState(websocketName, { status: "connecting" });
    if (message?.channel === "server_shutdown") {
      webSocketManager.send(message);
      return
    }

    if (Array.isArray(message)) {
      message.forEach((msg) => {
        if (!isLeave) {
          const key = getMessageKey(msg);
          leaveMessageRef.current.set(key, msg);
        }
        webSocketManager.send(msg);
      });
    } else {
      if (!isLeave) {
        const key = getMessageKey(message);
        leaveMessageRef.current.set(key, message);
      }
      /* log("📤 Sending message", message) */;
      webSocketManager.send(message);
    }

    /* log("leaveMessageRef.size", leaveMessageRef.current.size) */;
    updateConnectedTimestamp(websocketName, new Date());
  };

  const stopMessage = () => {
    leaveMessageRef.current.forEach((message) => {
      const leaveMsg = {
        ...message,
        action: "leave",
      };
      /* log("📤 Sending leave message", leaveMsg) */;
      webSocketManager.send(leaveMsg);
    });

    setWebsocketState(websocketName, { status: "disconnected" });
  };

  useEffect(() => {
    /* log("⚡ Connecting to WebSocket") */;

    if (onInit) {
      /* log("⚡ Running initial setup") */;
      onInit();
    }

    startHeartbeat();

    if (initialMessage) {
      /* log("📤 Sending initial message", initialMessage) */;
      sendMessage(initialMessage);
      isInitialMessageRef.current = true;
    }

    const onWSOpen = webSocketManager.onOpen(() => {
      if (isInitialMessageRef.current) {
        isInitialMessageRef.current = false;
        return;
      }
      // log(
      //   "✅ WebSocket reconnected — re-sending initial message",
      //   initialMessageRef.current,
      // );
      sendMessage(initialMessageRef.current);
    });

    const onWSMessage = webSocketManager.onMessage((data: T) => {
      setWebsocketState(websocketName, { status: "connected" });

      // for ping
      if (
        (data as any).channel === "ping" &&
        (data as any).success === true &&
        (data as any).rooms?.includes(channel)
      ) {
        /* console.log("ping message", data) */;
        lastMessageTimestamp.current = Date.now();
        updatePingTimestamp(websocketName, new Date());
        return;
      }

      if (
        (data as any).channel === channel &&
        !["cosmo", "cosmo2"].includes((data as any).channel)
      ) {
        if (data) {
          lastMessageTimestamp.current = Date.now();
          addLastMessage(websocketName, JSON.stringify(data), new Date());
          updateLastMessageTimestamp(websocketName, new Date());
        }
      }

      // for cosmo
      if (["cosmo", "cosmo2"].includes((data as any).channel)) {
        if (data) {
          lastMessageTimestamp.current = Date.now();
          /* console.log("cosmo2 message data: ", data) */;
          addLastMessage("cosmo2", JSON.stringify(data), new Date());
          updateLastMessageTimestamp("cosmo2", new Date());
        }
      }

      onMessage?.(data);
    });

    const onWSClose = webSocketManager.onClose((event) => {
      /* log("❌ WebSocket closed", event) */;
      isInitialMessageRef.current = false
      const closeInfo = {
        name: websocketName,
        code: event.code,
        reason: event.reason || "No reason provided",
        wasClean: event.wasClean,
      };

      setWebsocketState(websocketName, {
        status: webSocketManager.getConnectionStatus(),
      });
      addError(websocketName, {
        message: JSON.stringify(closeInfo),
        timestamp: new Date(),
      });
    });

    const onWSError = webSocketManager.onError((event) => {
      /* log("❌ WebSocket error", event) */;
      isInitialMessageRef.current = false
      addError(websocketName, {
        message: JSON.stringify(event),
        timestamp: new Date(),
      });
    });

    return () => {
      if (onLeave) {
        /* log("❌ Running leave handler") */;
        onLeave();
      }
      onWSOpen();
      clearHeartbeat();
      stopMessage();
      onWSMessage();
      onWSClose();
      onWSError();
      leaveMessageRef.current.clear();
      isInitialMessageRef.current = false;
    };
  }, []);

  return {
    sendMessage,
    stopMessage,
  };
}
