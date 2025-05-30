import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BaseButton from "../buttons/BaseButton";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { memo, useCallback, useMemo } from "react";
import {
  SoundType,
  useCosmoSoundStore,
} from "@/stores/cosmo/use-cosmo-sound.store";

const SOUNDS = ["None", "Ping", "Ding", "Blink"] as const;

type ListType = "newlyCreated" | "aboutToGraduate" | "graduated";

interface CosmoSoundProps {
  listType: ListType;
}

export const CosmoSound = memo(({ listType }: CosmoSoundProps) => {
  const {
    newlyCreatedSound,
    aboutToGraduateSound,
    graduatedSound,
    setNewlyCreatedSound,
    setAboutToGraduateSound,
    setGraduatedSound,
  } = useCosmoSoundStore();

  const currentSound = useMemo(() => {
    switch (listType) {
      case "newlyCreated":
        return newlyCreatedSound;
      case "aboutToGraduate":
        return aboutToGraduateSound;
      case "graduated":
        return graduatedSound;
    }
  }, [listType, newlyCreatedSound, aboutToGraduateSound, graduatedSound]);

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue !== "none") {
        const audio = new Audio(`/sfx/cosmo/${newValue}.mp3`);
        audio.play();
      }
      switch (listType) {
        case "newlyCreated":
          setNewlyCreatedSound(newValue as SoundType);
          break;
        case "aboutToGraduate":
          setAboutToGraduateSound(newValue as SoundType);
          break;
        case "graduated":
          setGraduatedSound(newValue as SoundType);
          break;
      }
    },
    [
      listType,
      setNewlyCreatedSound,
      setAboutToGraduateSound,
      setGraduatedSound,
    ],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <BaseButton variant="gray" className="relative size-8" size="short">
          <div className="relative aspect-square h-4 w-4 flex-shrink-0">
            {currentSound === "none" ? (
              <Image
                src="/icons/mute.svg"
                alt="Volume Icon"
                fill
                quality={100}
                className="object-contain"
              />
            ) : (
              <Image
                src="/icons/volume.svg"
                alt="Volume Icon"
                fill
                quality={100}
                className="object-contain"
              />
            )}
          </div>
        </BaseButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-[128px] p-0">
        <h1 className="p-2 text-base">Sound</h1>
        <RadioGroup
          defaultValue={currentSound}
          onValueChange={(value) => {
            handleValueChange(value);
          }}
        >
          {SOUNDS.map((item) => (
            <Label
              key={item}
              htmlFor={item?.toLowerCase()}
              className="relative flex cursor-pointer items-center space-x-2 py-2 transition-colors duration-200 hover:bg-black/20"
            >
              <div className="absolute inset-0 h-full w-full bg-white opacity-[4%]" />
              <RadioGroupItem
                value={item?.toLowerCase()}
                id={item?.toLowerCase()}
              />
              <p className="text-sm text-white">{item}</p>
            </Label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
});

CosmoSound.displayName = "CosmoSound";
