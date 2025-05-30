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

const TokenInteractiveTutorials = () => {
  // ########## Interactive Tutorial🤌 ##########
  const router = useRouter();
  // const [{ run, stepIndex, steps }, setState] = useState<State>({
  //   run: false,
  //   sidebarOpen: false,
  //   stepIndex: 0,
  //   steps: [],
  // });
  const [isClient, setIsClient] = useState(false);
  const isTokenTutorial = useUserInfoStore((state) => state.isTokenTutorial);
  const setIsWalletManagerTutorial = useUserInfoStore(
    (state) => state.setIsWalletManagerTutorial,
  );

  useEffect(() => {
    if (!isTokenTutorial) return;
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
  }, [isTokenTutorial]);

  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     steps: [
  //       {
  //         target: "#pnl-trigger",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">PNL</h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               View your live PNL with every wallet directly from the token
  //               page.
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
  //               {interactiveTutorialStepPage["token"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.965 0.82",
  //             transform: "translate(0, 2%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#trading-view",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Chart
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               View the fastest chart on any web platform with detailed
  //               analysis tools to never miss the next runner.
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
  //               {interactiveTutorialStepPage["token"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "bottom-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.99 0.97",
  //             transform: "translate(0, 0%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#tab-list",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Token
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               View token data clearly, with the fastest feed of information on
  //               the market.
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
  //               {interactiveTutorialStepPage["token"].start + 2} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "right-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.99 0.8",
  //             transform: "translate(0, 0%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#panel",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Panel
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Nova's quick buy and sell panel allows you to utilise your
  //               preset amounts with one button transactions.
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
  //               {interactiveTutorialStepPage["token"].start + 3} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "left-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.77 0.5",
  //             transform: "translate(0, 0%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#snipe-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Migration
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Snipe directly off migration via the token page.
  //             </p>
  //           </div>
  //         ),
  //         styles: {
  //           spotlight: {
  //             scale: 0.5,
  //           },
  //         },
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["token"].start + 4} of{" "}
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
  //     run: isTokenTutorial,
  //   }));
  // }, [isTokenTutorial]);

  return null;

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { action, index, status, type } = data;

  //   // (index === 4 && action === ACTIONS.NEXT) ||
  //   if (status === "finished") {
  //     setState((prev) => ({ ...prev, run: false, stepIndex: 0 }));
  //     setIsWalletManagerTutorial(false);
  //     router.push("/wallet-tracker");
  //   }
  // };

  // return (
  //   <>
  //     {isClient && (
  //       <Joyride
  //         run={isTokenTutorial}
  //         continuous
  //         callback={handleJoyrideCallback}
  //         showSkipButton
  //         // scrollOffset={64}
  //         // scrollToFirstStep
  //         // showProgress
  //         steps={steps as any}
  //         styles={{ ...interactiveTutorialStyle }}
  //       />
  //     )}
  //     {/* <BaseButton
  //       onClick={() => {
  //         console.log("clicked");
  //         setIsTokenTutorial(!isTokenTutorial);
  //       }}
  //       variant="primary"
  //       className="fixed right-4 top-4"
  //     >
  //       {isTokenTutorial ? "Stop Tutorial" : "Start Tutorial"}
  //     </BaseButton> */}
  //   </>
  // );
};

export default TokenInteractiveTutorials;
