import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NotificationSettingsState = {
  isMuted: boolean;
  setNotificationIsMutedStatus: (value: boolean) => void;
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      isMuted: false,
      setNotificationIsMutedStatus: (value) => set({ isMuted: value }),
    }),
    {
      name: "notification-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
