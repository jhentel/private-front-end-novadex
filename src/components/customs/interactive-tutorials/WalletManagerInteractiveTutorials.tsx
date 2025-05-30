"use client";

/* eslint-disable react/no-unescaped-entities */
// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
// import Joyride, {
//   ACTIONS,
//   CallBackProps,
//   EVENTS,
//   Events,
//   STATUS,
//   Step,
// } from "react-joyride";
import BaseButton from "@/components/customs/buttons/BaseButton";
// ######## Constants ☑️ ########
import {
  interactiveTutorialStepPage,
  interactiveTutorialStyle,
} from "@/constants/interactive-tutorial";
// ######## Types 🗨️ ########
interface State {
  run: boolean;
  sidebarOpen: boolean;
  stepIndex: number;
  // steps: Step[];
}

const WalletManagerInteractiveTutorials = () => {
  // ########## Interactive Tutorial🤌 ##########
  const router = useRouter();
  // const [{ run, stepIndex, steps }, setState] = useState<State>({
  //   run: false,
  //   sidebarOpen: false,
  //   stepIndex: 0,
  //   steps: [],
  // });
  const [isClient, setIsClient] = useState(false);
  const isWalletManagerTutorial = useUserInfoStore(
    (state) => state.isWalletManagerTutorial,
  );
  const setIsHoldingsTutorial = useUserInfoStore(
    (state) => state.setIsHoldingsTutorial,
  );

  useEffect(() => {
    if (!isWalletManagerTutorial) return;
    setIsClient(true);

    const updateInteractiveStyle = () => {
      // ######## Skip Style ⏯️ ########
      const skipButton = document.querySelector("button[data-action='skip']");
      if (skipButton instanceof HTMLElement) {
        skipButton.style.cursor = "default";
        skipButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
      }

      // ######## Floater Arrow Style🏹 ########
      const arrow = document.querySelector(".__floater__arrow polygon");
      if (arrow instanceof SVGElement) {
        arrow.style.fill = "#080811";
        arrow.style.stroke = "#242436";
        arrow.style.strokeWidth = "1";
      }

      // ######## X Close❌ ########
      const close = document.querySelector(
        "[data-test-id='button-close'] svg path",
      );
      if (close instanceof SVGElement) {
        close.style.fill = "#777E90";
        close.style.stroke = "#777E90";
        close.style.strokeWidth = "2";
        close.style.scale = "0.8";
      }
    };

    // Initial update
    updateInteractiveStyle();

    // Observer for dynamic content
    const observer = new MutationObserver(updateInteractiveStyle);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isWalletManagerTutorial]);

  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     steps: [
  //       {
  //         target: "#withdraw-wallet",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Import Wallet
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Import hundreds of wallets in one go.
  //             </p>
  //           </div>
  //         ),
  //         placement: "bottom-start",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["wallets"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.86",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#import-wallet",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Import
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Bring your existing wallets into Nova.
  //             </p>
  //           </div>
  //         ),
  //         placement: "bottom-start",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["wallets"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.97 0.86",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#generate-new-wallet",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Generate New Wallet
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Create a brand-new Nova wallet instantly, anytime.
  //             </p>
  //           </div>
  //         ),
  //         placement: "left-start",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["wallets"].start + 2} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.97 0.86",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#wallet-manager-archive-button-first",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Archive
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Organize by archiving unused wallets.
  //             </p>
  //           </div>
  //         ),
  //         placement: "left",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["wallets"].start + 3} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.8 0.8",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#end",
  //         content: <div></div>,
  //       },
  //     ],
  //     run: isWalletManagerTutorial,
  //   }));
  // }, [isWalletManagerTutorial]);
  return null;

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { action, index, status, type } = data;

  //   // (index === 4 && action === ACTIONS.NEXT) ||
  //   if (status === "finished") {
  //     setState((prev) => ({ ...prev, run: false, stepIndex: 0 }));
  //     setIsHoldingsTutorial(false);
  //     // GENUINE STEP ✨
  //     // TEMP STEP ✨
  //     router.push("/wallet-tracker");
  //   }
  // };

  // return (
  //   <>
  //     {isClient && (
  //       <Joyride
  //         run={isWalletManagerTutorial}
  //         continuous
  //         callback={handleJoyrideCallback}
  //         showSkipButton
  //         steps={steps as any}
  //         styles={{ ...interactiveTutorialStyle }}
  //       />
  //     )}
  //     {/* <BaseButton
  //       onClick={() => {
  //         console.log("clicked");
  //         setIsWalletManagerTutorial(!isWalletManagerTutorial);
  //       }}
  //       variant="primary"
  //       className="fixed right-4 top-4"
  //     >
  //       {isWalletManagerTutorial ? "Stop Tutorial" : "Start Tutorial"}
  //     </BaseButton> */}
  //   </>
  // );
};

export default WalletManagerInteractiveTutorials;
