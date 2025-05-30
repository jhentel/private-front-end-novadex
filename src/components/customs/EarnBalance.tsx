"use client";

import Image from "next/image";
import { useWindowSize } from "@/hooks/use-window-size";
import { EarnClaimButton } from "@/components/customs/EarnClaimButton";
import { Particles } from "./Particles";

export function EarnBalance() {
  const { width } = useWindowSize();

  const particlesQty = width && width < 768 ? 50 : 100;

  return (
    // <div
    //   className="relative flex h-[258px] flex-col items-center justify-center gap-4 bg-[url('/images/decorations/balance-frame.svg')] bg-contain bg-no-repeat"
    //   style={{ backgroundPosition: "bottom center" }}
    // >
    <div className="relative flex h-[258px] flex-col items-center justify-center gap-4 overflow-hidden bg-opacity-40 bg-[url('/images/decorations/polkadots-2.svg')] bg-repeat">
      <div className="absolute inset-0">
        <Particles size={1} quantity={particlesQty} />
      </div>
      <div className="absolute left-0 top-0 h-[70px] w-full bg-gradient-to-b from-[#080811] to-[#08081100] md:h-[170px]"></div>
      <div className="absolute left-0 top-0 h-full w-[70px] bg-gradient-to-r from-[#080811] to-[#08081100] md:w-[170px]"></div>
      <div className="absolute right-0 top-0 h-full w-[70px] bg-gradient-to-l from-[#080811] to-[#08081100] md:w-[170px]"></div>
      <div
        className="absolute -bottom-9 h-1/3 w-3/4 animate-scale-bounce-slow bg-gradient-to-l from-[#C97DFF] to-[#661BC3] opacity-40 blur-xl"
        style={{
          borderRadius: "100%",
        }}
      ></div>
      <div
        className="absolute -bottom-9 h-1/3 w-3/4 animate-scale-bounce-slow bg-gradient-to-l from-[#C97DFF] to-[#661BC3] opacity-40 blur-2xl"
        style={{
          borderRadius: "100%",
        }}
      ></div>
      <div
        className="absolute -bottom-9 h-1/3 w-3/4 animate-scale-bounce-slow bg-gradient-to-l from-[#C97DFF] to-[#661BC3] opacity-40 blur-3xl"
        style={{
          borderRadius: "100%",
        }}
      ></div>
      <div
        className="absolute -bottom-9 h-1/3 w-3/4 animate-scale-bounce-slow bg-gradient-to-l from-[#C97DFF] to-[#661BC3] opacity-40 blur-lg"
        style={{
          borderRadius: "100%",
        }}
      ></div>
      <div className="relative z-10 flex size-10 items-center justify-center rounded-full border border-[#FFFFFF20] bg-gradient-to-b from-[#FFFFFF1A] to-[#FFFFFF33]">
        <Image
          src="/icons/solana.svg"
          alt="Solana Icon"
          width={28}
          height={28}
          quality={100}
          className="object-contain"
        />
      </div>
      <div className="relative z-10 flex items-center justify-center gap-1">
        <span className="font-geist text-nowrap text-xs text-[#9191A4]">
          Total SOL Earned on that Day
        </span>

        <div className="relative aspect-square h-4 w-4 flex-shrink-0 rounded-full">
          <Image
            src="/icons/info-tooltip.png"
            alt="Info Tooltip Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <span className="font-geist bg-gradient-to-b from-white to-[#9191A4] to-80% bg-clip-text text-4xl font-[600] leading-[44px] text-transparent lg:text-5xl lg:leading-[56px]">
          1024,000008
        </span>
      </div>
      <EarnClaimButton />
    </div>
  );
}
