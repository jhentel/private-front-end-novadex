import React, { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SocialLinkButton from "./buttons/SocialLinkButton";
import Image from "next/image";
import { truncateString } from "@/utils/truncateString";
import { fetchTiktokPosts, TiktokPost } from "@/apis/rest/social-feed";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/libraries/utils";

const formatTikTokNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

const TiktokContent = ({ url }: { url: string }) => {
  const { data, isLoading, error } = useQuery<TiktokPost>({
    queryKey: ["tiktok", url],
    queryFn: () => fetchTiktokPosts(url),
    enabled: !!url,
    retry: false,
  });

  const [current, setCurrent] = useState(0);
  const images = data?.image_urls || [];
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="z-[1000] mt-4 flex h-24 items-center justify-center">
        <div className="relative size-6 animate-spin">
          <Image
            src="/icons/search-loading.png"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (error || !data?.posting_account?.username) {
    return (
      <div className="z-50 flex w-full flex-col items-center justify-center p-3">
        <Image
          src="/icons/social/tiktok-empty.svg"
          alt="Tiktok Empty"
          height={64}
          width={64}
          className="mb-2 object-contain"
        />
        <p className="mb-1 text-[#FCFCFD]">No Tiktok Found</p>
        <p className="text-center font-geistRegular text-xs font-normal text-[#9191A4]">
          Oops! It looks like there are no tikok available at the moment. Check
          back later!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex items-center gap-x-2">
        <div className="flex flex-1 flex-col gap-y-0">
          <div className="flex items-center gap-x-1.5">
            <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
              @{truncateString(data?.posting_account.username || "", 13)}
            </p>
          </div>
        </div>
        <div className="relative aspect-square size-6">
          <Image
            src="/icons/social/tiktok-white.svg"
            alt="Tiktok"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      </div>
      <div>
        <div className="relative h-auto w-full overflow-hidden rounded-[6px]">
          {!data?.video_url && data?.image_urls ? (
            images.length > 1 ? (
              <div className="h-64">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[current]}
                      alt={`Image-${current}`}
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <button
                    title="previous button"
                    onClick={prev}
                    className="rounded-full bg-black/50 p-1 transition hover:bg-black/70"
                  >
                    <ChevronLeft className="size-4 text-white" />
                  </button>
                  <button
                    title="next button"
                    onClick={next}
                    className="rounded-full bg-black/50 p-1 transition hover:bg-black/70"
                  >
                    <ChevronRight className="size-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <Image
                src={images[0]}
                alt="Single Image"
                fill
                className="object-contain"
              />
            )
          ) : (
            <video
              ref={videoRef}
              key={data?.video_url}
              src={data?.video_url}
              className="rounded-[6px]"
              controls
              width="100%"
              height="auto"
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              autoPlay
              muted
            >
              <source src={data?.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/50 px-2 py-3">
        <div className="flex items-center gap-x-1">
          <Eye className="size-4 text-[#9191A4]" />
          <span className="font-geistRegular text-xs text-[#9191A4]">
            {formatTikTokNumber(data?.views || 0)}
          </span>
        </div>
        <div className="flex items-center gap-x-1">
          <Heart className="size-4 text-[#9191A4]" />
          <span className="font-geistRegular text-xs text-[#9191A4]">
            {formatTikTokNumber(data?.likes || 0)}
          </span>
        </div>
        <div className="flex items-center gap-x-1">
          <MessageCircle className="size-4 text-[#9191A4]" />
          <span className="font-geistRegular text-xs text-[#9191A4]">
            {formatTikTokNumber(data?.comments || 0)}
          </span>
        </div>
        <div className="flex items-center gap-x-1">
          <Share2 className="size-4 text-[#9191A4]" />
          <span className="font-geistRegular text-xs text-[#9191A4]">
            {formatTikTokNumber(data?.shares || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TiktokHoverPopover = React.memo(
  ({
    url,
    containerSize,
    iconSize,
  }: {
    url: string;
    containerSize?: string;
    iconSize?: string;
  }) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={url as string}
              target="_blank"
              className={cn(
                "gb__white__btn_xs relative flex h-[20px] w-auto flex-shrink-0 items-center justify-center gap-0.5 rounded-[4px] bg-white/[6%] p-1.5 duration-300 hover:bg-white/[12%]",
                containerSize,
              )}
            >
              <div
                className={cn(
                  "relative aspect-square size-[16px] flex-shrink-0",
                  iconSize,
                )}
              >
                <Image
                  src="/icons/social/tiktok-eye.svg"
                  alt="Tiktok Social Icon"
                  fill
                  quality={100}
                  loading="lazy"
                  className="object-contain"
                />
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent
            isWithAnimation={false}
            align="center"
            side="bottom"
            className="gb__white__popover z-[1000] max-h-[50dvh] w-[300px] overflow-y-auto rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
          >
            <iframe className="absolute left-0 top-0 size-full" />
            <TiktokContent url={url} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

TiktokHoverPopover.displayName = "TiktokHoverPopover";

export default TiktokHoverPopover;
