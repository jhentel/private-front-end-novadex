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

const TrendingInteractiveTutorials = () => {
  // ########## Interactive Tutorial🤌 ##########
  const router = useRouter();
  // const [{ run, stepIndex, steps }, setState] = useState<State>({
  //   run: false,
  //   sidebarOpen: false,
  //   stepIndex: 0,
  //   steps: [],
  // });
  const [isClient, setIsClient] = useState(false);
  const isTrendingTutorial = useUserInfoStore(
    (state) => state.isTrendingTutorial,
  );
  const setIsCosmoTutorial = useUserInfoStore(
    (state) => state.setIsCosmoTutorial,
  );

  useEffect(() => {
    if (!isTrendingTutorial) return;
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
  }, [isTrendingTutorial]);

  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     steps: [
  //       {
  //         target: "#trending-dexes-filter",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Filter
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Filter the tokens you see by choosing your filters depending on
  //               how are as a trader
  //             </p>
  //           </div>
  //         ),
  //         placement: "right",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["trending"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.8",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#trending-dexes-filter-mobile",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Filter
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Filter the tokens you see by choosing your filters depending on
  //               how are as a trader
  //             </p>
  //           </div>
  //         ),
  //         placement: "right",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["trending"].start} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.95 0.8",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#trending-quick-buy-button-first",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Quick Buy
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Automatically purchase a token by simply click the "Quick Buy"
  //               button
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
  //               {interactiveTutorialStepPage["trending"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.92 0.8",
  //             transform: "translate(0, 2%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#end",
  //         content: <div></div>,
  //       },
  //     ],
  //     run: isTrendingTutorial,
  //   }));
  // }, [isTrendingTutorial]);

  return null;

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { action, index, status, type } = data;

  //   // (index === 2 && action === ACTIONS.NEXT) ||
  //   if (status === "finished") {
  //     setState((prev) => ({ ...prev, run: false, stepIndex: 0 }));
  //     setIsCosmoTutorial(false);
  //     router.push("/holdings");
  //   }
  // };

  // return (
  //   <>
  //     {isClient && (
  //       <Joyride
  //         run={isTrendingTutorial}
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
  //         setIsTrendingTutorial(!isTrendingTutorial);
  //       }}
  //       variant="primary"
  //       className="fixed right-4 top-4"
  //     >
  //       {isTrendingTutorial ? "Stop Tutorial" : "Start Tutorial"}
  //     </BaseButton> */}
  //   </>
  // );
};

export default TrendingInteractiveTutorials;
