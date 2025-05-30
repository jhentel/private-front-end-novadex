import { create } from 'zustand';

interface TradesPanelStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useTradesPanelStore = create<TradesPanelStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
})); 