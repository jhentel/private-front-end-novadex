"use client";
import React, { useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import BaseButton from "./buttons/BaseButton";
import Image from "next/image";
import { Slider } from "../ui/slider";
import { useVolumeStore } from "@/stores/use-volume.store";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Howl, Howler } from "howler";
import debounce from "lodash/debounce";
import { useNotificationToggleStore } from "@/stores/notifications/use-notification-toggle.store";

const VolumePopover = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { volume } = useVolumeStore();
  const isNotMuted = useNotificationToggleStore((state) => state.isNotMuted);
  if (isMobile) {
    return (
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          <BaseButton
            disabled={!isNotMuted}
            variant="gray"
            className="relative size-8"
            size="short"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/volume.svg"
                alt="Volume Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </BaseButton>
        </DialogTrigger>

        <DialogContent className="flex w-full max-w-[90vw] flex-col gap-y-0 rounded-md bg-[#080812] pb-9 pt-[14px] text-white sm:rounded-[8px] [&>button]:hidden">
          <DialogTitle className="sr-only">Edit Volume</DialogTitle>
          <div>
            <SliderContainer onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <BaseButton
          disabled={!isNotMuted}
          variant="gray"
          className="relative size-8"
          size="short"
        >
          <div className="relative aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src={volume === 0 ? "/icons/mute.svg" : "/icons/volume.svg"}
              alt="Volume Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </BaseButton>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        align="start"
        className="z-50 w-[280px] bg-background px-0 pb-9 pt-[14px]"
      >
        <SliderContainer onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

const SliderContainer = ({ onClose }: { onClose: () => void }) => {
  const { setVolume, volume } = useVolumeStore();
  const sound = new Howl({
    src: ["/sfx/notification.mp3"],
    html5: true,
    volume: volume / 100,
  });

  const debouncedChange = useCallback(
    debounce((newValue) => {
      sound.play();
      Howler.volume(newValue / 100);
    }, 200),
    [],
  );

  const handleChangeVolume = (e: number[]) => {
    const value = e[0];
    const isValid = /^(0|[1-9][0-9]?|100)$/.test(value.toString());
    if (isValid) {
      setVolume(value);
      debouncedChange(value);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 pb-[14px]">
        <h2 className="text-semibold font-semibold">Volume Notifications</h2>

        <button
          title="Close"
          onClick={onClose}
          className="relative aspect-square h-6 w-6 flex-shrink-0"
        >
          <Image
            src="/icons/close.png"
            alt="Close Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </button>
      </div>
      <div className="flex items-center gap-2 px-4 pt-[14px]">
        <Image
          src={volume === 0 ? "/icons/mute.svg" : "/icons/volume.svg"}
          alt="Volume Icon"
          width={15}
          height={15}
          quality={100}
          className="object-contain"
        />

        <Slider
          value={[volume]}
          customValue={volume}
          onValueChange={handleChangeVolume}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
};

export default React.memo(VolumePopover);
