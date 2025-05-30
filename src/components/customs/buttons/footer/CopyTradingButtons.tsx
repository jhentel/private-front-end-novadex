"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FooterModal from "@/components/customs/modals/FooterModal";
import CopyTradingEditContent from "../../modals/contents/footer/actions/CopyTradingEditContent";
import BaseButton from "../BaseButton";

export default function CopyTradingButtons() {
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const handleToggleOpenEditModal = () => {
    setOpenEditModal((prev) => !prev);
  };

  const handleDelete = async () => {
    /* console.log("Delete button clicked") */;
  };

  return (
    <>
      <FooterModal
        modalState={openEditModal}
        toggleModal={handleToggleOpenEditModal}
        layer={2}
        responsiveWidthAt={920}
        triggerChildren={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BaseButton
                  onClick={handleToggleOpenEditModal}
                  size="short"
                  variant="gray"
                  className="h-[30px] w-[30px] rounded-[8px]"
                >
                  <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/edit.png"
                      alt="Edit Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </BaseButton>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-[320] px-2 py-1">
                <span className="inline-block text-nowrap text-xs">Edit</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
        contentClassName="w-full max-w-[456px] flex flex-col max-md:max-h-[93vh] h-[93vh] md:h-[560px]"
      >
        <CopyTradingEditContent toggleModal={handleToggleOpenEditModal} />
      </FooterModal>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BaseButton
              onClick={handleDelete}
              size="short"
              variant="gray"
              className="h-[30px] w-[30px] rounded-[8px]"
            >
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/footer/delete.png"
                  alt="Delete Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </BaseButton>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[320] px-2 py-1">
            <span className="inline-block text-nowrap text-xs">Delete</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
