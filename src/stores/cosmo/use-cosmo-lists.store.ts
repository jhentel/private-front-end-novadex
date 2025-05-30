import { create } from "zustand";
import { CosmoDataMessageType } from "@/types/ws-general";
import { deduplicateAndPrioritizeLatestData_CosmoData } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { MutableRefObject } from "react";

const limitList = (list: CosmoDataMessageType[], count: number = 30) => {
  return list.slice(0, count);
};

interface CosmoListsState {
  // Lists
  latestMessages: CosmoDataMessageType[];
  pausedLatestMessages: CosmoDataMessageType[];

  newlyCreatedList: CosmoDataMessageType[];
  aboutToGraduateList: CosmoDataMessageType[];
  graduatedList: CosmoDataMessageType[];
  newlyCreatedChangedCount: number;
  aboutToGraduatedChangedCount: number;
  graduatedChangedCount: number;

  // Paused states
  pausedNewlyCreatedList: CosmoDataMessageType[];
  otherPausedNewlyCreatedList: CosmoDataMessageType[];
  pausedAboutToGraduateList: CosmoDataMessageType[];
  pausedGraduatedList: CosmoDataMessageType[];
  isNewlyCreatedListHovered: boolean;
  isAboutToGraduateHovered: boolean;
  isGraduateHovered: boolean;

  // Actions for latest messages
  updateIsGraduatedList: (isGraduateHovered: boolean) => void;
  updateIsNewlyCreatedListHovered: (isNewlyCreatedListHovered: boolean) => void;
  updateIsAboutToGraduateHovered: (isAboutToGraduateHovered: boolean) => void;
  updateLatestMessages: (data: CosmoDataMessageType) => void;
  updatePausedLatestMessages: (data: CosmoDataMessageType) => void;
  mergeLatestMessagesPaused: () => void;
  resetLatestMessages: () => void;
  // Actions for newly created
  updateNewlyCreated: (data: CosmoDataMessageType) => void;
  updateNewlyCreatedChangedCount: () => void;
  setNewlyCreatedList: (list: CosmoDataMessageType[]) => void;
  setPausedNewlyCreated: (
    listOrUpdater:
      | CosmoDataMessageType[]
      | ((prev: CosmoDataMessageType[]) => CosmoDataMessageType[]),
  ) => void;
  setOtherPausedNewlyCreated: (
    listOrUpdater:
      | CosmoDataMessageType[]
      | ((prev: CosmoDataMessageType[]) => CosmoDataMessageType[]),
  ) => void;
  mergeNewlyCreatedPaused: (
    hiddenTokens: string[],
    showHidden: boolean,
  ) => void;

  // Actions for about to graduate
  updateAboutToGraduate: (data: CosmoDataMessageType) => void;
  updateAboutToGraduatedChangedCount: () => void;
  setAboutToGraduateList: (list: CosmoDataMessageType[]) => void;
  setPausedAboutToGraduate: (
    listOrUpdater:
      | CosmoDataMessageType[]
      | ((prev: CosmoDataMessageType[]) => CosmoDataMessageType[]),
  ) => void;
  mergeAboutToGraduatePaused: (
    hiddenTokens: string[],
    showHidden: boolean,
  ) => void;

  // Actions for graduated
  updateGraduated: (data: CosmoDataMessageType) => void;
  updateGraduatedChangedCount: () => void;
  setGraduatedList: (list: CosmoDataMessageType[]) => void;
  setPausedGraduated: (
    listOrUpdater:
      | CosmoDataMessageType[]
      | ((prev: CosmoDataMessageType[]) => CosmoDataMessageType[]),
  ) => void;
  mergeGraduatedPaused: (hiddenTokens: string[], showHidden: boolean) => void;
  cleanup: () => void;
}

export const useCosmoListsStore = create<CosmoListsState>((set, get) => ({
  // Initial states
  latestMessages: [],
  pausedLatestMessages: [],
  isNewlyCreatedListHovered: false,
  newlyCreatedList: [],
  aboutToGraduateList: [],
  graduatedList: [],
  pausedNewlyCreatedList: [],
  otherPausedNewlyCreatedList: [],
  pausedAboutToGraduateList: [],
  pausedGraduatedList: [],
  newlyCreatedChangedCount: 0,
  aboutToGraduatedChangedCount: 0,
  graduatedChangedCount: 0,
  isAboutToGraduateHovered: false,
  isGraduateHovered: false,
  updateIsGraduatedList: (isGraduateHovered) =>
    set({ isGraduateHovered: isGraduateHovered }),
  updateIsAboutToGraduateHovered: (isAboutToGraduateHovered) =>
    set({ isAboutToGraduateHovered: isAboutToGraduateHovered }),
  updateIsNewlyCreatedListHovered: (isNewlyCreatedListHovered) =>
    set({ isNewlyCreatedListHovered: isNewlyCreatedListHovered }),
  // Paused states

  // Latest Messages actions
  updateLatestMessages: (data) => {
    set((state) => {
      const processedLatestMessages = limitList(
        deduplicateAndPrioritizeLatestData_CosmoData([
          data,
          ...state.latestMessages,
        ]),
        45,
      );

      return {
        latestMessages: processedLatestMessages,
      };
    });
  },
  updatePausedLatestMessages: (data) => {
    set((state) => {
      const processedLatestMessages = limitList(
        deduplicateAndPrioritizeLatestData_CosmoData([
          data,
          ...state.pausedLatestMessages,
        ]),
        45,
      );

      return {
        pausedLatestMessages: processedLatestMessages,
      };
    });
  },
  mergeLatestMessagesPaused: () => {
    const { latestMessages, pausedLatestMessages } = get();

    if (pausedLatestMessages.length > 0) {
      set((state) => ({
        latestMessages: limitList(
          deduplicateAndPrioritizeLatestData_CosmoData([
            ...pausedLatestMessages,
            ...latestMessages,
          ]),
        ),
        pausedLatestMessages: [],
      }));
    }
  },
  resetLatestMessages: () => set({ latestMessages: [] }),

  // Newly Created actions
  updateNewlyCreated: (data) => {
    set((state) => {
      const updatedNewlyCreatedList = limitList(
        deduplicateAndPrioritizeLatestData_CosmoData([
          data,
          ...state.newlyCreatedList,
        ]),
      );

      return {
        newlyCreatedList: updatedNewlyCreatedList,
      };
    });
  },
  updateNewlyCreatedChangedCount: () => {
    set((state) => ({
      newlyCreatedChangedCount:
        state.newlyCreatedChangedCount < 10
          ? state.newlyCreatedChangedCount + 1
          : 0,
    }));
  },
  setNewlyCreatedList: (list) => set({ newlyCreatedList: list }),
  setPausedNewlyCreated: (listOrUpdater) =>
    set((state) => ({
      pausedNewlyCreatedList:
        typeof listOrUpdater === "function"
          ? listOrUpdater(state.pausedNewlyCreatedList)
          : listOrUpdater,
    })),
  setOtherPausedNewlyCreated: (listOrUpdater) =>
    set((state) => ({
      otherPausedNewlyCreatedList:
        typeof listOrUpdater === "function"
          ? listOrUpdater(state.otherPausedNewlyCreatedList)
          : listOrUpdater,
    })),
  mergeNewlyCreatedPaused: (hiddenTokens = [], showHidden = false) => {
    const {
      newlyCreatedList,
      pausedNewlyCreatedList,
      otherPausedNewlyCreatedList,
      aboutToGraduateList,
    } = get();

    if (pausedNewlyCreatedList.length > 0) {
      const newAboutToGraduateList = aboutToGraduateList.filter((item) => {
        const pausedItem = pausedNewlyCreatedList.find(
          (paused) => paused.mint === item.mint,
        );

        if (!pausedItem) return true;

        return pausedItem.last_update <= item.last_update;
      });

      // Filter out hidden tokens before setting the state
      const mergedItems = deduplicateAndPrioritizeLatestData_CosmoData([
        ...pausedNewlyCreatedList,
        ...otherPausedNewlyCreatedList,
        ...newlyCreatedList,
      ]);

      // Apply filter for hidden tokens
      let filteredItems;
      if (showHidden) {
        // Only show hidden tokens
        filteredItems = mergedItems.filter((item) =>
          hiddenTokens.includes(item.mint),
        );
      } else {
        // Filter out hidden tokens
        filteredItems = mergedItems.filter(
          (item) => !hiddenTokens.includes(item.mint),
        );
      }

      set({
        newlyCreatedList: limitList(
          filteredItems.sort((a, b) => {
            const timestampA = BigInt(Number(a.created));
            const timestampB = BigInt(Number(b.created));
            return Number(timestampB - timestampA);
          }),
        ),
        pausedNewlyCreatedList: [],
        aboutToGraduateList: limitList(newAboutToGraduateList, 30),
      });
    }

    if (otherPausedNewlyCreatedList.length > 0) {
      const newAboutToGraduateList = aboutToGraduateList.filter((item) => {
        const pausedItem = otherPausedNewlyCreatedList.find(
          (paused) => paused.mint === item.mint,
        );

        if (!pausedItem) return true;

        return pausedItem.last_update <= item.last_update;
      });

      // Filter out hidden tokens before setting the state
      const mergedItems = deduplicateAndPrioritizeLatestData_CosmoData([
        ...otherPausedNewlyCreatedList,
        ...newlyCreatedList,
      ]);

      // Apply filter for hidden tokens
      let filteredItems;
      if (showHidden) {
        // Only show hidden tokens
        filteredItems = mergedItems.filter((item) =>
          hiddenTokens.includes(item.mint),
        );
      } else {
        // Filter out hidden tokens
        filteredItems = mergedItems.filter(
          (item) => !hiddenTokens.includes(item.mint),
        );
      }

      set({
        newlyCreatedList: limitList(
          filteredItems.sort((a, b) => {
            const timestampA = BigInt(Number(a.created));
            const timestampB = BigInt(Number(b.created));
            return Number(timestampB - timestampA);
          }),
        ),
        pausedNewlyCreatedList: [],
        aboutToGraduateList: limitList(newAboutToGraduateList, 30),
      });
    }
  },

  // About to Graduate actions
  updateAboutToGraduate: (data) => {
    set((state) => {
      const { newlyCreatedList } = state;

      const newlyCreatedToken = newlyCreatedList.find(
        (item) => item?.mint === data.mint,
      );

      const updatedAboutToGraduateList = limitList(
        deduplicateAndPrioritizeLatestData_CosmoData([
          data,
          ...state.aboutToGraduateList,
        ]).sort((a, b) => {
          if (a.migrating && !b.migrating) return -1;
          if (!a.migrating && b.migrating) return 1;
          const marketCapA = Number(a.market_cap_usd);
          const marketCapB = Number(b.market_cap_usd);
          return Number(marketCapB - marketCapA);
        }),
        30,
      );

      let finalNewlyCreatedList = newlyCreatedList;

      if (newlyCreatedToken) {
        if (data.last_update > newlyCreatedToken.last_update) {
          finalNewlyCreatedList = newlyCreatedList.map((item) =>
            item?.mint === data.mint ? { ...item, ...data } : item,
          );
        }
      }

      return {
        aboutToGraduateList: updatedAboutToGraduateList,
        newlyCreatedList: finalNewlyCreatedList,
      };
    });
  },
  updateAboutToGraduatedChangedCount: () => {
    set((state) => ({
      aboutToGraduatedChangedCount:
        state.aboutToGraduatedChangedCount < 10
          ? state.aboutToGraduatedChangedCount + 1
          : 0,
    }));
  },
  setAboutToGraduateList: (list) => set({ aboutToGraduateList: list }),
  setPausedAboutToGraduate: (listOrUpdater) =>
    set((state) => ({
      pausedAboutToGraduateList:
        typeof listOrUpdater === "function"
          ? listOrUpdater(state.pausedAboutToGraduateList)
          : listOrUpdater,
    })),
  mergeAboutToGraduatePaused: (hiddenTokens = [], showHidden = false) => {
    const { aboutToGraduateList, pausedAboutToGraduateList, newlyCreatedList } =
      get();

    if (pausedAboutToGraduateList.length > 0) {
      const newNewlyCreatedList = newlyCreatedList.filter((item) => {
        const pausedItem = pausedAboutToGraduateList.find(
          (paused) => paused.mint === item.mint,
        );

        if (!pausedItem) return true;

        return pausedItem.last_update <= item.last_update;
      });

      // Filter out hidden tokens before setting the state
      const mergedItems = deduplicateAndPrioritizeLatestData_CosmoData([
        ...pausedAboutToGraduateList,
        ...aboutToGraduateList,
      ]);

      // Apply filter for hidden tokens
      let filteredItems;
      if (showHidden) {
        // Only show hidden tokens
        filteredItems = mergedItems.filter((item) =>
          hiddenTokens.includes(item.mint),
        );
      } else {
        // Filter out hidden tokens
        filteredItems = mergedItems.filter(
          (item) => !hiddenTokens.includes(item.mint),
        );
      }

      set({
        aboutToGraduateList: limitList(
          filteredItems.sort((a, b) => {
            if (a.migrating && !b.migrating) return -1;
            if (!a.migrating && b.migrating) return 1;

            const marketCapA = Number(a.market_cap_usd);
            const marketCapB = Number(b.market_cap_usd);

            return Number(marketCapB - marketCapA);
          }),
          30,
        ),
        pausedAboutToGraduateList: [],
        newlyCreatedList: newNewlyCreatedList,
      });
    }
  },

  // Graduated actions
  updateGraduated: (data) => {
    set((state) => {
      const newAboutToGraduateList = data?.mint
        ? state.aboutToGraduateList.filter((item) => item?.mint !== data?.mint)
        : state.aboutToGraduateList;

      return {
        graduatedList: limitList(
          deduplicateAndPrioritizeLatestData_CosmoData([
            data,
            ...state.graduatedList,
          ]).sort((a, b) => {
            const timestampA = BigInt(Number(a.migrated_time));
            const timestampB = BigInt(Number(b.migrated_time));
            return Number(timestampB - timestampA);
          }),
        ),
        aboutToGraduateList: limitList(newAboutToGraduateList, 30),
      };
    });
  },
  updateGraduatedChangedCount: () => {
    set((state) => ({
      graduatedChangedCount:
        state.graduatedChangedCount < 10 ? state.graduatedChangedCount + 1 : 0,
    }));
  },
  setGraduatedList: (list) => set({ graduatedList: list }),
  setPausedGraduated: (listOrUpdater) =>
    set((state) => ({
      pausedGraduatedList:
        typeof listOrUpdater === "function"
          ? listOrUpdater(state.pausedGraduatedList)
          : listOrUpdater,
    })),
  mergeGraduatedPaused: (hiddenTokens = [], showHidden = false) => {
    const { graduatedList, pausedGraduatedList, aboutToGraduateList } = get();

    if (pausedGraduatedList.length > 0) {
      const newAboutToGraduateList = aboutToGraduateList.filter(
        (item) =>
          !pausedGraduatedList.some(
            (pausedItem) => pausedItem.mint === item.mint,
          ),
      );

      // Filter out hidden tokens before setting the state
      const mergedItems = deduplicateAndPrioritizeLatestData_CosmoData([
        ...pausedGraduatedList,
        ...graduatedList,
      ]);

      // Apply filter for hidden tokens
      let filteredItems;
      if (showHidden) {
        // Only show hidden tokens
        filteredItems = mergedItems.filter((item) =>
          hiddenTokens.includes(item.mint),
        );
      } else {
        // Filter out hidden tokens
        filteredItems = mergedItems.filter(
          (item) => !hiddenTokens.includes(item.mint),
        );
      }

      // Sort the items
      const sortedItems = filteredItems.sort((a, b) => {
        const timestampA = BigInt(Number(a.migrated_time));
        const timestampB = BigInt(Number(b.migrated_time));
        return Number(timestampB - timestampA);
      });

      set({
        graduatedList: limitList(sortedItems),
        pausedGraduatedList: [],
        aboutToGraduateList: newAboutToGraduateList,
      });
    }
  },

  // Cleanup function
  cleanup: () =>
    set(() => ({
      latestMessages: [],
      pausedLatestMessages: [],
      newlyCreatedList: [],
      aboutToGraduateList: [],
      graduatedList: [],
      pausedNewlyCreatedList: [],
      otherPausedNewlyCreatedList: [],
      pausedAboutToGraduateList: [],
      pausedGraduatedList: [],
      newlyCreatedChangedCount: 0,
      aboutToGraduatedChangedCount: 0,
      graduatedChangedCount: 0,
    })),
}));
