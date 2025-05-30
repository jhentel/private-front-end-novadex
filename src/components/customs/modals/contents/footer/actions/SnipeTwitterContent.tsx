"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import { DrawerClose } from "@/components/ui/drawer";
import SnipeTwitterForm from "@/components/customs/forms/footer/SnipeTwitterForm";

type SnipeNewPairContentProps = {
  toggleModal: () => void;
  isDrawer?: boolean;
};

export default function SnipeTwitterContent({
  toggleModal,
  isDrawer = false,
}: SnipeNewPairContentProps) {
  return (
    <>
      <div className="flex h-[56px] w-full flex-shrink-0 items-center justify-between border-b border-border p-4">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary md:text-[20px]">
          Snipe Twitter
        </h4>
        {isDrawer ? (
          <DrawerClose asChild>
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
          </DrawerClose>
        ) : (
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
        )}
      </div>

      <div className="flex h-full w-full flex-grow flex-col">
        <div className="relative grid h-full w-full flex-grow grid-cols-1 pb-16 md:pb-0">
          <SnipeTwitterForm toggleModal={toggleModal} />
        </div>
      </div>
    </>
  );
}
