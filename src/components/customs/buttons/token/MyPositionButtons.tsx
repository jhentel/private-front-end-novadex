"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "../BaseButton";

export default function MyPositionButtons() {
  return (
    <>
      <BaseButton
        prefixIcon={
          <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src="/icons/share.png"
              alt="Share Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        }
      >
        <span className="relative z-30 font-geistSemiBold text-sm text-fontColorPrimary">
          Share
        </span>
      </BaseButton>
    </>
  );
}
