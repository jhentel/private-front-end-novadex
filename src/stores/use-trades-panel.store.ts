import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TradesPanelStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useTradesPanelStore = create<TradesPanelStore>()(
  persist(
    (set) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'trades-panel-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);