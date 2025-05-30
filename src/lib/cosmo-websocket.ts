// websocket-store.ts
import { create } from "zustand";
import { useCosmoListsStore } from "@/stores/cosmo/use-cosmo-lists.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { CosmoDataMessageType } from "@/types/ws-general";
import { getWSBaseURLBasedOnRegion } from "@/utils/getWSBaseURLBasedOnRegion";
import cookies from "js-cookie";

type WebSocketState = {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

type QueuedMessage = {
  data: CosmoDataMessageType;
  timestamp: number;
};

const DEXES = [
  "Raydium",
  "Meteora AMM V2",
  "Meteora AMM",
  "Pump.Swap",
] as const;

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  let socket: WebSocket | null = null;
  const messageQueue: QueuedMessage[] = [];
  let processingTimer: NodeJS.Timeout | null = null;

  // Helper function to get current store state without re-renders
  const getCurrentState = () => {
    return {
      cosmoLists: useCosmoListsStore.getState(),
      userInfo: useUserInfoStore.getState(),
    };
  };

  const processMessageQueue = () => {
    const currentQueue = [...messageQueue];
    messageQueue.length = 0; // Clear the queue

    const { cosmoLists } = getCurrentState();

    currentQueue.forEach(({ data: newDataMessage }) => {
      cosmoLists.updateLatestMessages(newDataMessage);

      const isAboutToGraduate =
        Number(newDataMessage?.progress) >= 10 &&
        !DEXES.includes(newDataMessage?.dex as any);

      if (isAboutToGraduate) {
        handleAboutToGraduateMessage(newDataMessage, cosmoLists);
      } else if (DEXES.includes(newDataMessage.dex as any)) {
        handleGraduatedMessage(newDataMessage, cosmoLists);
      }
    });
  };

  const handleAboutToGraduateMessage = (
    newDataMessage: CosmoDataMessageType,
    cosmoLists: ReturnType<typeof useCosmoListsStore.getState>,
  ) => {
    const { isAboutToGraduateHovered } = cosmoLists;
    const { isCosmoTutorial } = getCurrentState().userInfo;

    if (isAboutToGraduateHovered || isCosmoTutorial) {
      if (
        cosmoLists.aboutToGraduateList.some(
          (item) => item.mint === newDataMessage.mint,
        )
      ) {
        cosmoLists.updateAboutToGraduate(newDataMessage);
        cosmoLists.updateAboutToGraduatedChangedCount();
      } else {
        cosmoLists.setPausedAboutToGraduate((prev) => [
          newDataMessage,
          ...prev,
        ]);
      }
    } else {
      cosmoLists.updateAboutToGraduate(newDataMessage);
      cosmoLists.updateAboutToGraduatedChangedCount();
    }
  };

  const handleGraduatedMessage = (
    newDataMessage: CosmoDataMessageType,
    cosmoLists: ReturnType<typeof useCosmoListsStore.getState>,
  ) => {
    const { isGraduateHovered } = cosmoLists;
    const { isCosmoTutorial } = getCurrentState().userInfo;

    if (isGraduateHovered || isCosmoTutorial) {
      if (
        cosmoLists.graduatedList.some(
          (item) => item.mint === newDataMessage.mint,
        )
      ) {
        cosmoLists.updateGraduated(newDataMessage);
        cosmoLists.updateGraduatedChangedCount();
      } else {
        cosmoLists.setPausedGraduated((prev) => [newDataMessage, ...prev]);
      }
    } else {
      cosmoLists.updateGraduated(newDataMessage);
      cosmoLists.updateGraduatedChangedCount();
    }
  };

  const processNewTokenMessage = (newDataMessage: CosmoDataMessageType) => {
    const { cosmoLists, userInfo } = getCurrentState();
    const { isNewlyCreatedListHovered } = cosmoLists;
    const { isCosmoTutorial } = userInfo;

    const isAboutToGraduate =
      Number(newDataMessage?.progress) >= 10 &&
      !DEXES.includes(newDataMessage?.dex as any);

    if (isAboutToGraduate) return;
    if (DEXES.includes(newDataMessage.dex as any)) return;

    if (newDataMessage.type === "new") {
      handleNewToken(
        newDataMessage,
        cosmoLists,
        isNewlyCreatedListHovered,
        isCosmoTutorial,
      );
    } else if (newDataMessage.progress < 50) {
      handleProgressToken(
        newDataMessage,
        cosmoLists,
        isNewlyCreatedListHovered,
        isCosmoTutorial,
      );
    }
  };

  const handleNewToken = (
    newDataMessage: CosmoDataMessageType,
    cosmoLists: ReturnType<typeof useCosmoListsStore.getState>,
    isHovered: boolean,
    isTutorial: boolean,
  ) => {
    if (isHovered || isTutorial) {
      if (
        cosmoLists.newlyCreatedList.some(
          (item) => item.mint === newDataMessage.mint,
        )
      ) {
        cosmoLists.updateNewlyCreated(newDataMessage);
        cosmoLists.updateNewlyCreatedChangedCount();
      } else {
        cosmoLists.setPausedNewlyCreated((prev) => [newDataMessage, ...prev]);
      }
    } else {
      cosmoLists.updateNewlyCreated(newDataMessage);
      cosmoLists.updateNewlyCreatedChangedCount();
    }
  };

  const handleProgressToken = (
    newDataMessage: CosmoDataMessageType,
    cosmoLists: ReturnType<typeof useCosmoListsStore.getState>,
    isHovered: boolean,
    isTutorial: boolean,
  ) => {
    if (isHovered || isTutorial) {
      if (
        cosmoLists.newlyCreatedList.some(
          (item) => item.mint === newDataMessage.mint,
        )
      ) {
        cosmoLists.updateNewlyCreated(newDataMessage);
        cosmoLists.updateNewlyCreatedChangedCount();
      } else {
        cosmoLists.setOtherPausedNewlyCreated((prev) => [
          newDataMessage,
          ...prev,
        ]);
      }
    } else {
      cosmoLists.updateNewlyCreated(newDataMessage);
      cosmoLists.updateNewlyCreatedChangedCount();
    }
  };

  const token = cookies.get("_nova_session");

  const connect = () => {
    // Clean up any existing connection
    get().disconnect();

    socket = new WebSocket(String(getWSBaseURLBasedOnRegion()));

    socket.onopen = () => {
      set({ isConnected: true });
      const subscriptionMessage = [
        {
          channel: "cosmo",
          token: token,
        },
      ];

      socket?.send(JSON.stringify(subscriptionMessage));
      // Start processing queue periodically
      processingTimer = setInterval(processMessageQueue, 1000);
    };

    socket.onmessage = (event) => {
      try {
        const data = event.data;
        if (data.includes("success") || data.includes("Ping")) return;

        const parsed = JSON.parse(data);
        const newDataMessage: CosmoDataMessageType = parsed.data;

        if (
          newDataMessage.type === "new" ||
          messageQueue.some(
            (item) =>
              item.data.mint === newDataMessage.mint &&
              item.data.image &&
              newDataMessage.image,
          )
        ) {
          processNewTokenMessage(newDataMessage);
        } else {
          messageQueue.push({
            data: newDataMessage,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      cleanup();
      set({ isConnected: false });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      cleanup();
      set({ isConnected: false });
    };
  };

  const cleanup = () => {
    if (processingTimer) {
      clearInterval(processingTimer);
      processingTimer = null;
    }
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socket = null;
    }
    messageQueue.length = 0;
  };

  const disconnect = () => {
    cleanup();
    set({ isConnected: false });
  };

  return {
    isConnected: false,
    connect,
    disconnect,
  };
});
