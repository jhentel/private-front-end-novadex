"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import CopyTradingEditForm from "@/components/customs/forms/footer/CopyTradingEditForm";

type CopyTradingEditContentProps = {
  toggleModal: () => void;
};

export default function CopyTradingEditContent({
  toggleModal,
}: CopyTradingEditContentProps) {
  return (
    <>
      <div className="flex h-[58px] w-full justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[16px] text-fontColorPrimary md:text-[20px]">
          Edit
        </h4>

        <button onClick={toggleModal}>
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src="/icons/footer/close.png"
              alt="Footer Close Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </button>
      </div>

      {/* Copy Trading Form */}
      <div className="flex h-full w-full flex-grow flex-col md:h-auto">
        <div className="relative grid h-full w-full flex-grow grid-cols-1 md:h-auto">
          <CopyTradingEditForm toggleModal={toggleModal} />
        </div>
      </div>
    </>
  );
}
