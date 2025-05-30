import { cn } from "@/libraries/utils";
import { MediaSize } from "@/types/ws-general";
import Image from "next/image";
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DialogClose } from "@radix-ui/react-dialog";

const TwitterImageModal = ({
  images,
}: {
  images: {
    media_url_https: string;
    sizes: {
      large: MediaSize;
      medium: MediaSize;
      small: MediaSize;
      thumb: MediaSize;
    };
  }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <div className={cn("flex w-full gap-[1px]")}>
        {images.length > 0 &&
          images.map((image, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setIsOpen(true);
              }}
              style={{
                aspectRatio: `${image.sizes.large.w}/${image.sizes.large.h}`,
                width:
                  image.sizes.large.w == image.sizes.large.h
                    ? "100%"
                    : image.sizes.large.w,
              }}
              className={cn(
                "relative cursor-pointer overflow-hidden border border-border",
                image.sizes.large.w / image.sizes.large.h < 1
                  ? "max-w-[80%]"
                  : "max-w-full",
                images.length == 1
                  ? "rounded-xl"
                  : index == 0
                    ? "rounded-l-xl"
                    : index == images.length - 1
                      ? "rounded-r-xl"
                      : "",
              )}
            >
              <Image
                src={image.media_url_https}
                alt="Twitter Monitor Content Image"
                fill
                quality={100}
                className={cn(
                  images.length == 1 ? "object-contain" : "object-cover",
                )}
              />
            </div>
          ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="p-0 lg:h-[70vh] lg:max-w-[70vw]"
        >
          <DialogClose className="absolute right-4 top-4 z-[1000] rounded-sm text-fontColorSecondary ring-0 ring-offset-transparent transition-opacity focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500">
            <div className="relative aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </DialogClose>
          <Swiper
            initialSlide={activeIndex}
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="h-full w-full"
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={image.media_url_https}
                    alt="Twitter Monitor Content Image"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwitterImageModal;
