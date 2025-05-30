import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type NotificationToggleState = {
  // If isNotMuted is true, notifications (toasts) are not shown
  isNotMuted: boolean;
  // Toggle mute state
  toggleMute: () => void;
  // Set mute state explicitly
  setMuted: (value: boolean) => void;
};

export const useNotificationToggleStore = create<NotificationToggleState>()(
  persist(
    (set) => ({
      isNotMuted: false,
      toggleMute: () => set((state) => ({ isNotMuted: !state.isNotMuted })),
      setMuted: (value) => set(() => ({ isNotMuted: value })),
    }),
    {
      name: "notification-toggle-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
