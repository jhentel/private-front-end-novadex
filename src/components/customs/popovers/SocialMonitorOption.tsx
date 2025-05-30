import React, { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import AddTwitterWithConfirmation from "../modals/contents/footer/twitter/AddTwitter";
import AddTSWithConfirmation from "../modals/contents/footer/twitter/AddTruthSocial";
import ManageTwitter from "../modals/contents/footer/twitter/ManageTwitter";
import ManageTruthSocial from "../modals/contents/footer/twitter/ManageTruthSocial";
import Separator from "@/components/customs/Separator";
import AddDiscordWithConfirmation from "@/components/customs/modals/contents/footer/twitter/AddDiscord";
import ManageDiscord from "@/components/customs/modals/contents/footer/twitter/ManageDiscord";

const SOCIAL_PLATFORMS = {
  twitter: {
    name: "Twitter",
    icon: "/icons/social/twitter.svg",
    AddComponent: AddTwitterWithConfirmation,
    ManageComponent: ManageTwitter,
  },
  truthSocial: {
    name: "Truth Social",
    icon: "/icons/social/truthsocial.svg",
    AddComponent: AddTSWithConfirmation,
    ManageComponent: ManageTruthSocial,
  },
  discord: {
    name: "Discord",
    icon: "/icons/social/discord.svg",
    AddComponent: AddDiscordWithConfirmation,
    ManageComponent: ManageDiscord,
  },
};

const SocialOption = ({
  platform,
  type,
  isOpen,
  setIsOpen,
}: {
  platform: keyof typeof SOCIAL_PLATFORMS;
  type: "add" | "manage";
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { name, icon, AddComponent, ManageComponent } =
    SOCIAL_PLATFORMS[platform];
  const Component = type === "add" ? AddComponent : ManageComponent;
  const actionText = name;

  // Create a ref to the container element to use as the portal container
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full">
      <Component
        open={isOpen}
        setOpen={setIsOpen}
        trigger={
          <div
            className="z-[1002] flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-white/[6%] p-2 hover:bg-white/[16%] focus:bg-white/[16%]"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src={icon}
              alt={`${name} Icon`}
              className="h-5 w-5"
              width={20}
              height={20}
            />
            <span className="text-sm font-medium text-fontColorPrimary">
              {actionText}
            </span>
          </div>
        }
      />
    </div>
  );
};

const SocialMonitorOption = ({
  trigger,
  type,
  isMobile,
}: {
  trigger: React.ReactNode;
  type: "add" | "manage";
  isMobile?: boolean;
}) => {
  const [openTwitter, setOpenTwitter] = useState(false);
  const [openTruthSocial, setOpenTruthSocial] = useState(false);
  const [openDiscord, setOpenDiscord] = useState(false);
  const popoverContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={popoverContainerRef}
      className="relative w-full"
    >
      <Popover>
        <PopoverTrigger className="w-full">{trigger}</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="gb__primary__btn z-[1001] flex w-[240px] flex-grow flex-col gap-y-2 p-2 xl:w-[270px]"
        >
          <div className="flex w-full flex-col gap-y-2 flex-grow">
            {
              isMobile && type==='manage'&& (
                <>
                  <p className="px-2 text-sm font-bold">Manage Account</p>
                  <Separator />
                </>
              )
            }
            <SocialOption
              platform="twitter"
              type={type}
              isOpen={openTwitter}
              setIsOpen={setOpenTwitter}
            />
            <SocialOption
              platform="truthSocial"
              type={type}
              isOpen={openTruthSocial}
              setIsOpen={setOpenTruthSocial}
            />
            <SocialOption
              platform="discord"
              type={type}
              isOpen={openDiscord}
              setIsOpen={setOpenDiscord}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SocialMonitorOption;
