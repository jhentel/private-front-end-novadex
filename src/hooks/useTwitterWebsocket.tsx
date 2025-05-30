"use client";

import { useEffect, useRef, useState } from "react";
import cookies from "js-cookie";
import * as Sentry from "@sentry/nextjs";
import { TwitterMonitorMessageType } from "@/types/ws-general";
import {
  getTwitterAPIKey,
  getTwitterMonitorAccounts,
} from "@/apis/rest/twitter-monitor";

interface TwitterWebSocketProps {
  onMessage?: (data: TwitterMonitorMessageType) => void;
  onInit?: () => void;
  onLeave?: () => void;
  onStatusChange?: (
    status: "connected" | "connecting" | "disconnected" | "error",
  ) => void;
}

export function useTwitterWebSocket({
  onMessage,
  onInit,
  onLeave,
  onStatusChange,
}: TwitterWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected" | "error"
  >("disconnected");
  const [isReady, setIsReady] = useState(false);

  function log(msg: string, extra?: any) {
    /* console.debug(`TWITTER WEBSOCKET - ${msg}`, extra ?? "") */;
  }

  const updateStatus = (
    status: "connected" | "connecting" | "disconnected" | "error",
  ) => {
    setConnectionStatus(status);
    onStatusChange?.(status);
  };

  // Connect to Twitter WebSocket
  useEffect(() => {
    const token = cookies.get("_nova_session");
    if (!token || token === "") return;

    const connectWebSocketTwitter = async () => {
      updateStatus("connecting");
      if (!cookies.get("_twitter_api_key")) {
        try {
          const { success, message: twitterAPIKey } = await getTwitterAPIKey();
          if (!success) {
            updateStatus("error");
            return;
          }
          cookies.set("_twitter_api_key", twitterAPIKey);
        } catch (error) {
          updateStatus("error");
          return;
        }
      }

      try {
        if (wsRef.current) {
          wsRef.current.close();
        }

        const ws = new WebSocket(
          String(`${process.env.NEXT_PUBLIC_WS_TWITTER_MONITOR_URL}`),
        );
        wsRef.current = ws;

        if (onInit) {
          onInit();
        }

        ws.onopen = async () => {
          log("CONNECTED ✅");
          updateStatus("connected");
          setIsReady(true);

          // Get monitored accounts
          try {
            const accounts = await getTwitterMonitorAccounts();
            if (accounts && accounts.length > 0) {
              const subscriptionMessage = {
                action: "subscribe",
                licenseKey: cookies.get("_twitter_api_key"),
                usernames: accounts.map((acc) => acc.username),
              };
              ws.send(JSON.stringify(subscriptionMessage));
            }
          } catch (error) {
            Sentry.captureMessage(
              `Failed to get Twitter accounts: ${String(error)}`,
              "error",
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            if (
              event.data.includes("success") ||
              event.data.includes("Ping") ||
              event.data.includes("UpdateType") ||
              event.data.includes("error")
            ) {
              return;
            }
            const message: TwitterMonitorMessageType = JSON.parse(event.data);
            onMessage?.(message);
          } catch (e) {
            Sentry.captureMessage(
              `Parse Error 📨 - (TW WS): ${String(e)}`,
              "error",
            );
          }
        };

        ws.onerror = (event) => {
          log("ERROR ⛔:", event);
          updateStatus("error");
          Sentry.captureMessage(
            `Error 🔴 - (TW WS): ${String(event)}`,
            "error",
          );
        };

        ws.onclose = () => {
          log("DISCONNECTED ❌");
          updateStatus("disconnected");
          setIsReady(false);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocketTwitter();
          }, 2000);
        };
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as any).message
            : "Unknown error";
        log(`CONNECTION FAILED ❌: ${message}`);
        updateStatus("error");
        Sentry.captureMessage(
          `Connection Failed ❌ - (TW WS): ${String(message)}`,
          "error",
        );
      }
    };

    connectWebSocketTwitter();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (onLeave) {
        onLeave();
      }
      setIsReady(false);
      updateStatus("disconnected");
    };
  }, []);

  // Method to manually send a message
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // Method to subscribe to specific Twitter accounts
  const subscribeToAccounts = (usernames: string[]) => {
    if (!isReady || !cookies.get("_twitter_api_key")) return false;

    const subscriptionMessage = {
      action: "subscribe",
      licenseKey: cookies.get("_twitter_api_key"),
      usernames,
    };

    return sendMessage(subscriptionMessage);
  };

  // Method to unsubscribe from specific Twitter accounts
  const unsubscribeFromAccounts = (usernames: string[]) => {
    if (!isReady || !cookies.get("_twitter_api_key")) return false;

    const unsubscriptionMessage = {
      action: "unsubscribe",
      licenseKey: cookies.get("_twitter_api_key"),
      usernames,
    };

    return sendMessage(unsubscriptionMessage);
  };

  return {
    sendMessage,
    subscribeToAccounts,
    unsubscribeFromAccounts,
    connectionStatus,
    isReady,
  };
}
