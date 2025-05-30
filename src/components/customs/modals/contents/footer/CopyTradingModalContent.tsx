"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import CopyTradingTable from "@/components/customs/tables/footer/CopyTradingTable";
import BaseButton from "@/components/customs/buttons/BaseButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FooterModal from "../../FooterModal";
import { X } from "lucide-react";

export default function CopyTradingModalContent({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [openAddTaskModal, setOpenTaskModal] = useState<boolean>(false);
  const handleToggleOpenAddTaskModal = () => {
    setOpenTaskModal((prev) => !prev);
  };

  return (
    <>
      <div className="flex h-[48px] w-full justify-between border-border px-4 pb-11 pt-4 max-md:items-center max-md:border-b max-md:py-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Copy Trading
        </h4>

        <div className="hidden gap-x-2 md:flex">
          <BaseButton
            variant="gray"
            size="short"
            className="aspect-square size-[32px]"
          >
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/import-primary.svg"
                alt="Add Icon"
                fill
                quality={100}
                className="object-contain duration-300"
              />
            </div>
          </BaseButton>
          <BaseButton
            variant="primary"
            className="h-[32px]"
            prefixIcon={
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/add.png"
                  alt="Add Icon"
                  fill
                  quality={100}
                  className="object-contain duration-300"
                />
              </div>
            }
          >
            <span className="inline-block font-geistSemiBold text-sm text-[#080811]">
              Add Order
            </span>
          </BaseButton>
        </div>

        {/* X for mobile close modal */}
        <button
          onClick={toggleModal}
          className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70 md:hidden"
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

      {/* Table Tabs */}
      <div className="flex w-full flex-grow flex-col border-t border-border">
        <div className="relative grid w-full flex-grow grid-cols-1">
          <CopyTradingTable />
        </div>
      </div>

      {/* Mobile Task Button */}
      <div className="grid w-full grid-cols-2 justify-center gap-x-4 border-t border-border bg-card p-3.5 md:hidden">
        <BaseButton
          variant="gray"
          className="h-[32px] w-full md:hidden"
          prefixIcon={
            <div className="relative aspect-square size-4 flex-shrink-0">
              <Image
                src="/icons/import-primary.svg"
                alt="Add Icon"
                fill
                quality={100}
                className="object-contain duration-300"
              />
            </div>
          }
        >
          <span className="inline-block font-geistSemiBold text-sm text-fontColorPrimary">
            Import
          </span>
        </BaseButton>
        <Popover>
          <PopoverTrigger asChild className="relative z-[5] w-full">
            <BaseButton
              variant="primary"
              className="h-[32px] w-full md:hidden"
              prefixIcon={
                <div className="relative aspect-square size-4 flex-shrink-0">
                  <Image
                    src="/icons/add.png"
                    alt="Add Icon"
                    fill
                    quality={100}
                    className="object-contain duration-300"
                  />
                </div>
              }
            >
              <span className="inline-block font-geistSemiBold text-sm text-[#080811]">
                Add Order
              </span>
            </BaseButton>
          </PopoverTrigger>
        </Popover>
      </div>
    </>
  );
}
