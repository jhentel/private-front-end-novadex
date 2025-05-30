"use client";
import React, { useState, useEffect } from "react";
import { Howler } from "howler";
import BaseButton from "./buttons/BaseButton";
import Image from "next/image";
import { MdNotificationsNone } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useNotificationToggleStore } from "@/stores/notifications/use-notification-toggle.store";
import { useVolumeStore } from "@/stores/use-volume.store";
import { cn } from "@/libraries/utils";
import CustomToast from "./toasts/CustomToast";
import toast from "react-hot-toast";

const NotificationPopover = ({
  isLarge = false,
  isLabel = false,
}: {
  isLarge?: boolean;
  isLabel?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use the dedicated notification toggle store
  const isNotMuted = useNotificationToggleStore((state) => state.isNotMuted);
  const toggleMute = useNotificationToggleStore((state) => state.toggleMute);

  const { setVolume, volume } = useVolumeStore();
  // showImageIcon is the opposite of isNotMuted (show bell icon when not muted)
  const [showImageIcon, setShowImageIcon] = useState(!isNotMuted);

  useEffect(() => {
    // Update icon when mute state changes
    setShowImageIcon(!isNotMuted);
  }, [isNotMuted]);

  useEffect(() => {
    // When muted, volume should be 100 (unmuted)
    // When unmuted, volume should be 0 (muted)
    if (isNotMuted) {
      if (volume) {
        setVolume(volume);
        Howler.volume(volume / 100);
      } else {
        setVolume(100);
        Howler.volume(1);
      }
    } else {
      Howler.volume(0);
    }
  }, [isNotMuted, setVolume]);

  const handleToggle = () => {
    toggleMute();
    setIsOpen(false);
    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message={isNotMuted ? "Notifications Muted" : "Notifications Unmuted"}
        state="SUCCESS"
      />
    ));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BaseButton
            onClick={handleToggle}
            variant="gray"
            className={cn("relative", isLarge ? "h-10" : "size-8")}
            size="short"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              {showImageIcon ? (
                <Image
                  src="/icons/notification.svg"
                  alt="Notification Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              ) : (
                <MdNotificationsNone className="h-full w-full" />
              )}
            </div>
            {isLabel && (
              <span className="whitespace-nowrap font-geistSemiBold text-sm">
                {showImageIcon ? "Enable Notification" : "Disable Notification"}
              </span>
            )}
          </BaseButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isNotMuted ? "Notification Unmuted" : "Notification Muted"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(NotificationPopover);
