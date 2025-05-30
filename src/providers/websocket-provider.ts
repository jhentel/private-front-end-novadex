"use client";
import { useEffect } from "react";
import { webSocketManager } from "@/lib/websocket-manager";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
import cookies from "js-cookie";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    webSocketManager.connect({
      url: String(getWSBaseURLBasedOnRegion()),
      token: cookies.get("_nova_session")
    });

    return () => {
      webSocketManager.disconnect();
    };
  }, []);

  return children;
}
