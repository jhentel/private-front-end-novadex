import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OpenAdvanceSettingsFormState = {
  openAdvanceSettings: boolean;
  setOpenAdvanceSettings: (openAdvanceSettings: boolean) => void;
};

export const useOpenAdvanceSettingsFormStore =
  create<OpenAdvanceSettingsFormState>()(
    persist(
      (set) => ({
        openAdvanceSettings: false,
        setOpenAdvanceSettings: (openAdvanceSettings) =>
          set(() => ({ openAdvanceSettings })),
      }),
      {
        name: "open-advance-settings-form",
      },
    ),
  );
