import Image from "next/image";
import React from "react";

const ComingSoon = ({ customText }: { customText?: string }) => {
  return (
    <div className="flex size-full flex-col items-center justify-center bg-[#080811]">
      <div className="relative mb-[32px] inline-block size-[160px]">
        <Image
          src="/images/coming-soon.png"
          alt="Coming Soon Icon"
          objectFit="contain"
          fill
          quality={100}
        />
      </div>
      <h1 className="font-geistSemiBold text-[24px] text-fontColorPrimary">
        Coming Soon!
      </h1>
      <p className="max-w-[340px] text-center font-geistLight text-sm text-fontColorSecondary">
        {customText || "We will notify you once this feature is ready."}
      </p>
    </div>
  );
};

export default ComingSoon;
