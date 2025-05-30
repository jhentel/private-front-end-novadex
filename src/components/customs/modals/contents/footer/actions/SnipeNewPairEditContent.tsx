"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import SnipeNewPairForm from "@/components/customs/forms/footer/SnipeNewPairForm";
import { SniperTask } from "@/apis/rest/sniper";
import SnipeNewPairEditForm from "@/components/customs/forms/footer/SnipeNewPairEditForm";

type SnipeNewPairContentProps = {
  toggleModal: () => void;
  task: SniperTask;
};

export default function SnipeNewPairEditContent({
  toggleModal,
  task,
}: SnipeNewPairContentProps) {
  return (
    <>
      <div className="flex h-[58px] w-full items-center justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
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

      <div className="flex w-full flex-grow flex-col">
        <div className="relative grid w-full flex-grow grid-cols-1">
          <SnipeNewPairEditForm toggleModal={toggleModal} prevData={task} />
        </div>
      </div>
    </>
  );
}
