import Image from "next/image";
import Separator from "@/components/customs/Separator";
import BaseButton from "@/components/customs/buttons/BaseButton";

import { cn } from "@/libraries/utils";

import { ChevronDown } from "lucide-react";

// Add Twitter ✖️
const AddPostButton = () => {
  return (
    <>
      <BaseButton
        as='div'
        variant="primary"
        className="h-8 w-full flex-grow justify-between py-0 pl-4 transition-colors max-xl:w-full"
      >
        <div className="flex items-center gap-x-2">
          <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
            <Image
              src="/icons/add.png"
              alt="Add Icon"
              fill
              quality={100}
              className="object-contain duration-300"
              sizes="16px"
            />
          </div>
          <span
            className={cn(
              "inline-block whitespace-nowrap font-geistSemiBold text-sm text-[#080811]",
            )}
          >
            Add Account
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <Separator
            color="#080811"
            orientation="vertical"
            unit="fixed"
            fixedHeight={32}
          />
          <ChevronDown className="h-4 w-4" />
        </div>
      </BaseButton>
    </>
  );
};

export default AddPostButton;