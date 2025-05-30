import { create } from "zustand";

interface AnnouncementStore {
  isAnnouncementExist: boolean;
  setIsAnnouncementExist: (value: boolean) => void;
}

export const useAnnouncementStore = create<AnnouncementStore>()((set) => ({
  isAnnouncementExist: false,
  setIsAnnouncementExist: (value) =>
    set(() => ({
      isAnnouncementExist: value,
    })),
}));
