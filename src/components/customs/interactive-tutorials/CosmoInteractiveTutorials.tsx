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

const CosmoInteractiveTutorials = () => {
  // ########## Interactive Tutorial🤌 ##########
  const router = useRouter();
  // const [{ run, stepIndex, steps }, setState] = useState<State>({
  //   run: false,
  //   sidebarOpen: false,
  //   stepIndex: 0,
  //   steps: [],
  // });
  const [isClient, setIsClient] = useState(false);
  const isCosmoTutorial = useUserInfoStore((state) => state.isCosmoTutorial);

  useEffect(() => {
    if (!isCosmoTutorial) return;
    // setTimeout(() => {
    setIsClient(true);
    // }, 250);

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
  }, [isCosmoTutorial]);

  // useEffect(() => {
  //   setState((prev) => ({
  //     ...prev,
  //     steps: [
  //       {
  //         target: "#quick-buy-button-first",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Quick Buy
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Instantly buy any token with just one click using the "Quick
  //               Buy" button. Simple and fast!
  //             </p>
  //           </div>
  //         ),
  //         placement: "right-start",
  //         disableBeacon: true,
  //         locale: {
  //           skip: (
  //             <strong
  //               aria-label="skip"
  //               className="pointer-events-none size-full"
  //             >
  //               {interactiveTutorialStepPage["cosmo"].start} of{" "}
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
  //         target: "#social-links-first",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Social Links
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Explore each token's background through its social links. Our
  //               tech also reveals if the X page has been reused or renamed!
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
  //               {interactiveTutorialStepPage["cosmo"].start + 1} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         placement: "right-start",
  //         styles: {
  //           spotlight: {
  //             scale: "0.92 0.75",
  //             transform: "translate(0, 1%)",
  //           },
  //         },
  //       },
  //       {
  //         target: "#snipe-button-first",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Sniper
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Stay ahead by setting up a Snipe or Sell Snipe for any coin
  //               right after it migrates. Always be the first transaction!
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
  //               {interactiveTutorialStepPage["cosmo"].start + 2} of{" "}
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
  //         placement: "right-start",
  //       },
  //       {
  //         target: "#sniper-task",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Sniper Tab
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Monitor and edit your active sniper tasks in one place.
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
  //               {interactiveTutorialStepPage["cosmo"].start + 3} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.93 0.82",
  //             transform: "translate(0, 0)",
  //           },
  //         },
  //         placement: "bottom",
  //       },
  //       {
  //         target: "#blacklist-button",
  //         content: (
  //           <div className="flex flex-col gap-y-[8px]">
  //             <h1 className="text-base font-bold text-fontColorPrimary">
  //               Blacklist Developers
  //             </h1>
  //             <p className="text-[14px] text-fontColorSecondary">
  //               Blacklist developers to avoid the rug pulls and scam coins.
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
  //               {interactiveTutorialStepPage["cosmo"].start + 4} of{" "}
  //               {interactiveTutorialStepPage["totalStep"]}
  //             </strong>
  //           ),
  //         },
  //         styles: {
  //           spotlight: {
  //             scale: "0.8 0.8",
  //           },
  //         },
  //         placement: "right-start",
  //       },
  //       {
  //         target: "#end",
  //         content: <div></div>,
  //       },
  //     ],
  //     run: isCosmoTutorial,
  //   }));
  // }, [isCosmoTutorial]);
  return null;

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { action, index, status, type } = data;

  //   if (status === "finished") {
  //     setState((prev) => ({ ...prev, run: false, stepIndex: 0 }));
  //     router.push("/trending");
  //   }
  // };

  // return (
  //   <>
  //     {isClient && (
  //       <Joyride
  //         run={isCosmoTutorial}
  //         continuous
  //         callback={handleJoyrideCallback}
  //         showSkipButton
  //         steps={steps as any}
  //         styles={{
  //           ...interactiveTutorialStyle,
  //         }}
  //       />
  //     )}
  //     {/* <BaseButton
  //       onClick={() => {
  //         console.log("clicked");
  //         setIsCosmoTutorial(!isCosmoTutorial);
  //       }}
  //       variant="primary"
  //       className="fixed right-4 top-4"
  //     >
  //       {isCosmoTutorial ? "Stop Tutorial" : "Start Tutorial"}
  //     </BaseButton> */}
  //   </>
  // );
};

export default CosmoInteractiveTutorials;
