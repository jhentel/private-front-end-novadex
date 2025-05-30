"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import FooterModal from "@/components/customs/modals/FooterModal";
import LimitOrdersTable from "@/components/customs/tables/footer/LimitOrdersTable";
import SnipeNewPairContent from "./actions/SnipeNewPairContent";
import { X } from "lucide-react";
import SnipeMigrationContent from "./actions/SnipeMigrationContent";
import Separator from "@/components/customs/Separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BaseButton from "@/components/customs/buttons/BaseButton";

export default function LimitOrdersModalContent({
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
      <div className="flex h-[65px] w-full items-center justify-between p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          Limit Orders
        </h4>

        {/* Desktop Task Button */}
        <Popover>
          <PopoverTrigger asChild>
            <BaseButton
              variant="primary"
              className="hidden h-[32px] md:flex"
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
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="z-[60] flex w-[188px] flex-col gap-y-1 rounded-[8px] border-2 border-border bg-card p-2 shadow-[0_0_20px_0_#000000]"
          >
            <FooterModal
              modalState={false}
              toggleModal={() => {}}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  // onClick={}
                  className="flex h-[40px] items-center gap-2 rounded-[8px] bg-white/[4%] px-4 py-1.5 hover:bg-white/[6%]"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-migration.png"
                      alt="Snipe Migration Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                    Limit Order
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto"
            >
              f
            </FooterModal>

            <FooterModal
              modalState={false}
              toggleModal={() => {}}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  // onClick={}
                  className="flex h-[40px] items-center gap-2 rounded-[8px] bg-white/[4%] px-4 py-1.5 hover:bg-white/[6%]"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-migration.png"
                      alt="Snipe Migration Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                    Limit Order
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto"
            >
              f
            </FooterModal>
          </PopoverContent>
        </Popover>

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
          <LimitOrdersTable />
        </div>
      </div>

      {/* Mobile Task Button */}
      <div className="flex w-full justify-center border-t border-border bg-card p-3.5 md:hidden">
        <Popover>
          <PopoverTrigger asChild className="relative z-[5] w-full">
            <button className="relative flex h-[32px] flex-shrink-0 items-center justify-center gap-x-2 rounded-[8px] bg-primary pl-2 pr-3 duration-300 hover:bg-primary-hover md:hidden">
              <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/add.png"
                  alt="Add Icon"
                  fill
                  quality={100}
                  className="object-contain duration-300"
                />
              </div>
              <span className="inline-block font-geistSemiBold text-sm text-[#080811]">
                Add Order
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            sideOffset={6}
            className="z-[60] flex w-[90vw] flex-col gap-y-1 rounded-[8px] border-2 border-border bg-card p-2 shadow-[0_0_20px_0_#000000]"
          >
            <FooterModal
              modalState={false}
              toggleModal={() => {}}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  // onClick={}
                  className="flex h-[40px] items-center gap-2 rounded-[8px] bg-white/[4%] px-4 py-1.5 hover:bg-white/[6%]"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-migration.png"
                      alt="Snipe Migration Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                    Limit Order
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto"
            >
              f
            </FooterModal>

            <FooterModal
              modalState={false}
              toggleModal={() => {}}
              layer={2}
              responsiveWidthAt={920}
              triggerChildren={
                <button
                  // onClick={}
                  className="flex h-[40px] items-center gap-2 rounded-[8px] bg-white/[4%] px-4 py-1.5 hover:bg-white/[6%]"
                >
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/footer/snipe-migration.png"
                      alt="Snipe Migration Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                    Limit Order
                  </span>
                </button>
              }
              contentClassName="w-full max-w-[456px] flex flex-col h-auto"
            >
              f
            </FooterModal>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
