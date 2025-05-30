"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import cookies from "js-cookie";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { motion, AnimatePresence, easeInOut } from "framer-motion";

enum OnboardingStep {
  INITIAL, // Initial state
  TUTORIAL_CHOICE, // "Would you like to begin with an onboarding tutorial?"
  FEATURE_SHOWCASE, // "Try the New Feature"
  WELCOME_ANIMATION, // "Welcome to Nova V2" with animation
}

export default function OnboardingModal() {
  // Get user info from the store
  const {
    isNewUser: isFirstTimeUser,
    setIsNewUser: setIsFirstTimeUser,
    setHasSeenTutorial,
    resetAllTutorialStates,
  } = useUserInfoStore();

  // Get current pathname to check if user is on login page
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Local state for tutorial flow
  const [isClient, setIsClient] = useState<boolean>(false);
  const [step, setStep] = useState<OnboardingStep>(
    OnboardingStep.WELCOME_ANIMATION,
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handler for completing the onboarding process
  const handleComplete = () => {
    setHasSeenTutorial(true);
    setStep(OnboardingStep.INITIAL);
    setIsFirstTimeUser(false);
    cookies.remove("_is_new_user");
    // cookies.set("_is_new_user", "false", { path: "/" });
    resetAllTutorialStates();
  };

  // Auto-close welcome animation after it completes
  useEffect(() => {
    if (step === OnboardingStep.WELCOME_ANIMATION) {
      const timer = setTimeout(() => {
        handleComplete();
      }, 2500); // Increased from 2000 to match the longer animation duration
      return () => clearTimeout(timer);
    }
  }, [step]);
  return (
    <>
      {isClient && isFirstTimeUser && !isLoginPage && (
        <AnimatePresence>
          <>
            {/* Welcome Animation */}
            {step === OnboardingStep.WELCOME_ANIMATION && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // transition={{ delay: 0.5 }}
                onClick={handleComplete}
                className="fixed inset-0 z-[9999] flex items-center justify-center"
              >
                {/* Full screen background that transitions */}
                <motion.div
                  className="absolute inset-0 z-10 bg-[#080811]"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    times: [0, 0.6, 1],
                    ease: easeInOut,
                  }}
                />

                <motion.div
                  className="relative flex h-full w-full items-center justify-center"
                  animate="visible"
                  initial="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }}
                  transition={{
                    duration: 1.5,
                    ease: easeInOut,
                  }}
                  style={{ zIndex: 30 }}
                >
                  <motion.h1
                    className="z-40 bg-gradient-to-r from-[#8456E8] via-[#E896FF] to-[#8456E8] bg-clip-text font-geistBlack text-7xl text-transparent"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.2, 1, 0.5],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      times: [0, 0.3, 0.7, 1],
                      ease: easeInOut,
                    }}
                  >
                    Welcome to Nova V2
                  </motion.h1>
                </motion.div>
              </motion.div>
            )}
          </>
        </AnimatePresence>
      )}
    </>
  );
}
