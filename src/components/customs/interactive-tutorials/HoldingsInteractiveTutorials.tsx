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

const HoldingsInteractiveTutorials = () => {
  // ########## Interactive Tutorial🤌 ##########
  const router = useRouter();
  // const [{ run, stepIndex, steps }, setState] = useState<State>({
  //   run: false,
  //   sidebarOpen: false,
  //   stepIndex: 0,
  //   // steps: [],
  // });
  const [isClient, setIsClient] = useState(false);
  const isHoldingsTutorial = useUserInfoStore(
    (state) => state.isHoldingsTutorial,
  );
  const setIsTrendingTutorial = useUserInfoStore(
    (state) => state.setIsTrendingTutorial,
  );

  useEffect(() => {
    if (!isHoldingsTutorial) return;

    const timeout = setTimeout(() => {
      setIsClient(true);
    }, 500);

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

    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [isHoldingsTutorial]);

  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     steps: [
  //       {
  //         target: "#dropdown-wallets-holdings",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Wallets
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Select through your holdings for each wallet to ensure you have
  //               sold all even when purchasing with multi-wallet.
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
  //               {interactiveTutorialStepPage["holdings"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.8 0.7",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#dropdown-wallets-holdings-mobile",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Wallets
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Select through your holdings for each wallet to ensure you have
  //               sold all even when purchasing with multi-wallet.
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
  //               {interactiveTutorialStepPage["holdings"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.92 0.7",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#holdings-filter-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Filter
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Filter through your tokens to show your current positions.
  //             </p>
  //           </div>
  //         ),
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["holdings"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "bottom-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.85",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#holdings-filter-button-mobile",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Filter
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Filter through your tokens to show your current positions.
  //             </p>
  //           </div>
  //         ),
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["holdings"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "bottom-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.85",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#holding-sell-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Quick Sell
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               The user is able to quick sell directly from the holdings page
  //               to ensure no time is lost switching pages.
  //             </p>
  //           </div>
  //         ),
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["holdings"].start + 2} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "right-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.85",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#share-holding-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Share
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               The user is able to share their real-time PNL images directly
  //               from the holdings page.
  //             </p>
  //           </div>
  //         ),
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["holdings"].start + 3} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "left",
  //         styles: {
  //           spotlight: {
  //             scale: "0.8 0.8",
  //             transform: "translate(0, 0%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#hide-holding-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Hide Tokens
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Hide tokens you do not want to see, allowing you to make your
  //               holdings page to be less cluttered.
  //             </p>
  //           </div>
  //         ),
  //         styles: {
  //           spotlight: {
  //             scale: "0.8 0.8",
  //             transform: "translate(0, 0%)",
  //           },
  //         },
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["holdings"].start + 4} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "bottom-start",
  //       },
  //       {
  //         target: "#end",
  //         content: <div></div>,
  //       },
  //     ],
  //     run: isHoldingsTutorial,
  //   }));
  // }, [isHoldingsTutorial]);

  return null;

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { action, index, status, type } = data;

  //   // (index === 5 && action === ACTIONS.NEXT) ||
  //   if (status === "finished") {
  //     setState((prev) => ({ ...prev, run: false, stepIndex: 0 }));
  //     setIsTrendingTutorial(false);
  //     router.push("/wallets");
  //   }
  // };

  // return (
  //   <>
  //     {isClient && (
  //       <Joyride
  //         run={isHoldingsTutorial}
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
  //         setIsHoldingsTutorial(!isHoldingsTutorial);
  //       }}
  //       variant="primary"
  //       className="fixed right-4 top-4"
  //     >
  //       {isHoldingsTutorial ? "Stop Tutorial" : "Start Tutorial"}
  //     </BaseButton> */}
  //   </>
  // );
};

export default HoldingsInteractiveTutorials;
