"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// ######## Utils & Helpers 🤝 ########
import BaseButton from "@/components/customs/buttons/BaseButton";
import { X } from "lucide-react";
import AlertTable from "@/components/customs/tables/footer/AlertTable";

// ######## Main Component 🚀 ########
export default function AlertsModalContent({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-between max-md:gap-3">
        <div className="flex h-[58px] w-full items-center justify-between border-border p-4 max-md:border-b md:h-[56px]">
          <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
            Alerts
          </h4>

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
      </div>

      {/* Table Tabs */}
      <div className="flex w-full flex-grow flex-col">
        <div className="relative grid w-full flex-grow grid-cols-1">
          <AlertTable />
        </div>
      </div>
    </>
  );
}
