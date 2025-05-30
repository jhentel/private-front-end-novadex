"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import TierLevelCard from "@/components/customs/cards/TierLevelCard";
import { useReferralStore } from "@/stores/use-referral.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function TierLevelSection() {
  const referralData = useReferralStore((state) => state.referralData);
  const isFetching = useReferralStore((state) => state.isFetching);
  const width = useWindowSizeStore((state) => state.width);

  return (
    <div className="relative z-20 flex w-full flex-col items-center justify-center gap-y-6 overflow-hidden bg-[#0D0D18] lg:px-3 lg:py-8">
      <div className="relative z-20 hidden w-full items-center justify-center gap-x-7 lg:flex">
        <TierLevelCard
          level={1}
          amountReferred={referralData?.["tier-1"]?.users}
          volume={referralData?.["tier-1"].volume}
          isLoading={isFetching}
        />
        <TierLevelCard
          level={2}
          amountReferred={referralData?.["tier-2"]?.users}
          volume={referralData?.["tier-2"].volume}
          isLoading={isFetching}
        />
        <TierLevelCard
          level={3}
          amountReferred={referralData?.["tier-3"]?.users}
          volume={referralData?.["tier-3"].volume}
          isLoading={isFetching}
        />
      </div>

      <div className="tier__level__card__swiper relative z-20 flex w-full items-center justify-center gap-x-7 lg:hidden">
        <Swiper
          slidesPerView={width && width > 430 ? Math.floor(width / 305) : 1}
          spaceBetween={width && width > 430 ? 24 : -20}
          centeredSlides={true}
          pagination={{
            clickable: true,
          }}
          modules={[FreeMode]}
          className="mySwiper"
        >
          <SwiperSlide>
            <TierLevelCard
              level={1}
              amountReferred={referralData?.["tier-1"]?.users}
              volume={referralData?.["tier-1"]?.volume}
              isLoading={isFetching}
            />
          </SwiperSlide>
          <SwiperSlide>
            <TierLevelCard
              level={2}
              amountReferred={referralData?.["tier-2"]?.users}
              volume={referralData?.["tier-2"]?.volume}
              isLoading={isFetching}
            />
          </SwiperSlide>
          <SwiperSlide>
            <TierLevelCard
              level={3}
              amountReferred={referralData?.["tier-3"]?.users}
              volume={referralData?.["tier-3"]?.volume}
              isLoading={isFetching}
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {true ? (
        <div className="absolute left-0 top-0 -z-10 h-full w-screen overflow-hidden">
          <div
            className="absolute bottom-[0rem] left-1/2 aspect-square w-screen -translate-x-1/2 translate-y-1/2 scale-x-[1.7] scale-y-[1.4] opacity-60 md:bottom-[-18rem] md:scale-x-[1.2] md:scale-y-[1.1] md:opacity-40"
            style={{
              background: `radial-gradient(circle at center,
              rgba(170, 86, 215, 1) 25%,
                 rgba(150, 46, 215, 0.7) 35%,
                 rgba(150, 56, 215, 0.5) 40%,
                 rgba(125, 40, 205, 0.2) 55%,
                #0E0D1A 65%
              )`,
              filter: "blur(40px)",
            }}
          />
        </div>
      ) : (
        <div className="absolute -bottom-2 left-1/2 z-10 aspect-[1201/327] w-[1201px] -translate-x-1/2 lg:w-full">
          <Image
            src="/images/decorations/tier-level-gradient-decoration.png"
            alt="Tier Level Gradient Decoration Image"
            fill
            quality={100}
            className="object-contain object-center"
          />
        </div>
      )}
    </div>
  );
}
