"use client";

import Image from "next/image";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { Particles } from "./Particles";

export function EarnClaimButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group relative isolate flex max-h-10 min-h-10 min-w-10 items-center justify-center rounded-lg bg-gradient-to-b from-[#DF74FF] to-[#F0B0FF] px-5 py-3 shadow-[0_0_10px_2px_rgba(245,133,255,0.8)] transition duration-500 hover:from-[#D043FA] hover:to-[#DC86F0] max-sm:w-full">
          <div className="absolute inset-0 left-[1px] top-[1px] h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-lg border border-white bg-transparent group-hover:border-white/30" />
          <span className="font-geist relative z-10 w-full text-[16px] font-[600] leading-5 sm:w-[420px]">
            Claim
          </span>
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="h-[505px] max-w-[856px] rounded-[20px] border-none"
          showCloseButton={false}
        >
          <div className="relative isolate h-full w-full">
            <div
              className="absolute left-1/2 h-[78px] w-[384px] -translate-x-1/2 bg-[#F6C7FF] blur-[48px]"
              style={{ borderRadius: "100%" }}
            />
            <Image
              className="absolute -top-20 left-1/2 z-20 -translate-x-1/2"
              src="/images/decorations/speaker.svg"
              alt="Speaker Image"
              width={120}
              height={120}
            />
            <div className="absolute inset-0 z-10 space-y-5 rounded-[20px] border border-[#242436] bg-gradient-to-b from-[#17171F] via-[#080811] to-[#080811] p-4 pt-14">
              <div className="font-geist text-center text-2xl font-semibold leading-8 text-white">
                Earn Nova Points for Sharing! 😉
              </div>
              <div className="relative mx-auto h-[239px] w-[824px] overflow-hidden rounded-[20px] bg-gradient-to-b from-[#0E0228] to-[#4F1A83]">
                <div className="absolute inset-0 bg-[url('/images/decorations/polkadots-3.svg')] bg-contain bg-repeat opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-transparent to-25%" />
                <div className="absolute inset-0 bg-gradient-to-bl from-black/70 to-transparent to-25%" />
                <div
                  className="absolute -bottom-8 h-1/4 w-full bg-white/50 blur-xl"
                  style={{ borderRadius: "100%" }}
                />

                <div className="absolute inset-0 z-10 flex h-full items-center justify-center gap-10 px-20 py-10">
                  <div className="relative flex size-[120px] -rotate-[5deg] items-center justify-center overflow-hidden rounded-2xl border-2 border-[#71558f] bg-gradient-to-b from-[#180025] to-[#350257] shadow-xl shadow-black/80">
                    <Image src="/logo.png" alt="Logo" width={80} height={80} />

                    <div
                      className="absolute -bottom-24 h-3/4 w-full scale-125 bg-[#7938a6]/60 blur-xl"
                      style={{ borderRadius: "100%" }}
                    />
                    <div
                      className="absolute -bottom-12 h-2/4 w-full bg-white/80 blur-xl"
                      style={{ borderRadius: "100%" }}
                    />
                    <div className="absolute inset-0 bg-[url('/images/decorations/polkadots-3.svg')] bg-cover bg-repeat opacity-10" />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="inline-block rounded-lg border border-[#5807B1] bg-[#5704c7]/70 px-3 py-1 font-geistBold text-[18px] font-bold italic text-white backdrop-blur-lg">
                      CHA-CHING 💸
                    </div>
                    <div className="font-geistBlack text-4xl font-[700] tracking-wide text-white drop-shadow-2xl filter">
                      <div className="flex items-end gap-2">
                        <span style={{ textShadow: "4px 4px 8px black" }}>
                          You earned
                        </span>{" "}
                        <div className="relative inline">
                          <span
                            className="absolute inset-0 font-geistBlack text-5xl text-transparent"
                            style={{ textShadow: "4px 4px 8px black" }}
                          >
                            $726.29
                          </span>

                          <span className="absolute inset-0 font-geistBlack text-5xl text-white/10">
                            $726.29
                          </span>

                          <span className="relative z-10 bg-gradient-to-b from-[#c6f9c5] to-[#abfa85] to-80% bg-clip-text font-geistBlack text-5xl text-transparent">
                            $726.29
                          </span>
                        </div>
                      </div>
                      <div style={{ textShadow: "4px 4px 8px black" }}>
                        in rewards today.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                <span className="font-geist text-[16px] font-semibold leading-6 text-white">
                  Share to
                </span>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <button className="flex size-[60px] items-center justify-center rounded-full border border-[#FFFFFF20] bg-gradient-to-b from-[#FFFFFF1A] to-[#FFFFFF33]">
                      <Download className="size-6 text-white" />
                    </button>
                    <span className="text-xs font-semibold leading-[18px] text-white">
                      Save Image
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <button className="flex size-[60px] items-center justify-center rounded-full border border-[#FFFFFF20] bg-gradient-to-b from-[#FFFFFF1A] to-[#FFFFFF33]">
                      <Image
                        src="/icons/x-white.svg"
                        alt="X Icon"
                        width={24}
                        height={24}
                      />
                    </button>
                    <span className="text-xs font-semibold leading-[18px] text-white">
                      Twitter
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
