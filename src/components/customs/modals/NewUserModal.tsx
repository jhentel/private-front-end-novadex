"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { motion, AnimatePresence } from "framer-motion";
// ######## Components 🧩 ########
import BaseButton from "@/components/customs/buttons/BaseButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function NewUserModal() {
  const isNewUser = useUserInfoStore((state) => state.isNewUser);
  const setIsNewUser = useUserInfoStore((state) => state.setIsNewUser);
  const setUserType = useUserInfoStore((state) => state.setType);

  const [localUserType, setLocalUserType] = useState<
    "Unset" | "Simple" | "Advanced"
  >("Unset");

  const handleCancel = () => {
    setUserType("Simple");
    setIsNewUser(false);
    localStorage.setItem("is-new-user", "true");
  };
  const handleConfirm = () => {
    setUserType("Advanced");
    setIsNewUser(false);
    localStorage.setItem("is-new-user", "true");
  };

  return (
    <AnimatePresence>
      {isNewUser && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/[12%] backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 z-[300] flex h-auto w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-7 rounded-[16px] border border-border bg-card px-6 pb-6 pt-7"
          >
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex w-full flex-col items-center gap-y-2 pt-3">
                <h2 className="text-center font-geistSemiBold text-[32px] leading-[42px] text-fontColorPrimary">
                  Which type are you?
                </h2>
                <span className="inline-block text-center text-base leading-[20px] text-fontColorSecondary">
                  This will affect your settings preference. You can update it
                  later on your settings page.
                </span>
              </div>

              <div className="flex w-full flex-col gap-y-4">
                <button
                  type="button"
                  onClick={() => setLocalUserType("Simple")}
                  className="flex h-[44px] w-full items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[4%] px-3 duration-300 hover:bg-white/[8%]"
                >
                  <span className="text-base text-fontColorPrimary">
                    Beginner
                  </span>
                  <SelectedIndicator isSelected={localUserType === "Simple"} />
                </button>
                <button
                  type="button"
                  onClick={() => setLocalUserType("Advanced")}
                  className="flex h-[44px] w-full items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[4%] px-3 duration-300 hover:bg-white/[8%]"
                >
                  <span className="text-base text-fontColorPrimary">
                    Advanced trader
                  </span>
                  <SelectedIndicator
                    isSelected={localUserType === "Advanced"}
                  />
                </button>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 items-center gap-x-4">
              <BaseButton
                onClick={handleCancel}
                variant="gray"
                className="h-[48px] w-full"
              >
                <span className="inline-block font-geistSemiBold text-base text-fontColorPrimary">
                  Cancel
                </span>
              </BaseButton>
              <BaseButton
                onClick={handleConfirm}
                variant="primary"
                className="h-[48px] w-full"
              >
                <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                  Confirm
                </span>
              </BaseButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const SelectedIndicator = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-border">
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full bg-red-500 duration-200",
          isSelected ? "bg-primary" : "bg-transparent",
        )}
      ></div>
    </div>
  );
};
