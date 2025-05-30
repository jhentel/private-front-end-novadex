import { Footer } from "@/apis/rest/footer";
import { create } from "zustand";

type FooterState = {
  message: Footer | null | undefined;
  setMessage: (message: Footer) => void;
};

export const useFooterStore = create<FooterState>()((set) => ({
  message: undefined,
  setMessage: (message) => set(() => ({ message: message })),
}));
