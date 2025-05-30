"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React from "react";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
// ######## Components 🧩 ########
import TwitterHoverPopover from "@/components/customs/TwitterHoverPopover";
import TwitterCommentHoverPopover from "@/components/customs/TwitterCommentHoverPopover";
import InstagramPopover from "@/components/customs/InstagramPopover";
import TruthSocialHoverPopover from "@/components/customs/TruthSocialHoverPopover";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
import TiktokHoverPopover from "@/components/customs/TiktokHoverPopover";
import WebsiteHoverPopover from "../../WebsiteHoverPopover";
import YoutubeHoverPopover from "../../YoutubeHoverPopover";
import { DEX } from "@/types/ws-general";

const iconSizeContainerMap = {
  normal: "!size-[20px]",
  large: "!size-[22px]",
  extralarge: "!size-[24px]",
  doubleextralarge: "!size-[28px]",
};

const iconSizeMap = {
  normal: "!size-[16px]",
  large: "!size-[18px]",
  extralarge: "!size-[20px]",
  doubleextralarge: "!size-[24px]",
};

const SocialLinks = React.memo(
  ({
    dex,
    isFirst,
    twitter,
    mint,
    telegram,
    website,
    youtube,
    tiktok,
    instagram,
    twitterStatusPopoverAlignment,
    isTokenPage = false,
  }: {
    dex: DEX;
    isFirst: boolean;
    twitter?: string;
    mint?: string;
    telegram?: string;
    website?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    twitterStatusPopoverAlignment?: "center" | "end" | "start";
    isTokenPage?: boolean;
  }) => {
    const customizedSettingPresets = useCustomizeSettingsStore(
      (state) => state.presets,
    );
    const customizedSettingActivePreset = useCustomizeSettingsStore(
      (state) => state.activePreset,
    );

    const currentSocialPreset =
      customizedSettingPresets[customizedSettingActivePreset].socialSetting ||
      "normal";

    const isTruthSocial = website?.includes("truthsocial.com");
    const isTruthSocialPost =
      isTruthSocial &&
      (website?.includes("posts") || /\d+/.test(website ?? ""));
    const isValidWebsite = website && website !== "https://";

    const shouldExcludeTwitterLink = (twitterUrl: string): boolean => {
      const excludedPatterns = [
        "https://x.com/search?q=",
        "https://x.com/intent/",
        "https://x.com/i/lists/",
        "https://twitter.com/search?q=",
        "https://twitter.com/intent/",
        "https://twitter.com/i/lists/"
      ];
      
      return excludedPatterns.some(pattern => twitterUrl.includes(pattern));
    };

    return (
      <div
        id={isFirst ? "social-links-first" : undefined}
        className="relative z-20 flex items-center gap-x-1"
      >
         {twitter &&
          (twitter.includes("x.com") || twitter.includes("twitter.com")) &&
          !twitter.includes("status") &&
          !twitter.includes("truthsocial.com") &&
          !shouldExcludeTwitterLink(twitter) && (
            <TwitterHoverPopover
              variant="primary"
              href={twitter}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              isTokenPage={isTokenPage}
            />
          )}

        {twitter &&
          (twitter.includes("x.com") || twitter.includes("twitter.com")) &&
          twitter.includes("status") &&
          !twitter.includes("communities") &&
          !twitter.includes("truthsocial.com") && (
            <TwitterCommentHoverPopover
              align={twitterStatusPopoverAlignment}
              variant="primary"
              href={twitter}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
              isTokenPage={isTokenPage}
            />
          )}

        {telegram && (
          <SocialLinkButton
            containerSize={iconSizeContainerMap[currentSocialPreset]}
            iconSize={iconSizeMap[currentSocialPreset]}
            variant={"primary"}
            size="sm"
            href={telegram}
            icon="telegram-white"
            label="Telegram"
            typeImage="svg"
          />
        )}

        {Boolean(website) &&
          (isTruthSocial ? (
            isTruthSocialPost ? (
              <TruthSocialHoverPopover
                url={website as string}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            ) : (
              <SocialLinkButton
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant="primary"
                size="sm"
                href={website as string}
                icon="truthsocial"
                label="Truth Social"
                typeImage="svg"
              />
            )
          ) : (
            isValidWebsite && (
              <WebsiteHoverPopover
                variant="primary"
                href={website as string}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            )
          ))}

        {/* Special Case */}
        {twitter &&
          (twitter.includes("truthsocial.com") && twitter.includes("posts") ? (
            <TruthSocialHoverPopover
              url={twitter}
              containerSize={iconSizeContainerMap[currentSocialPreset]}
              iconSize={iconSizeMap[currentSocialPreset]}
            />
          ) : (
            twitter.includes("truthsocial.com") && (
              <SocialLinkButton
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={twitter}
                icon="truthsocial"
                label="Truth Social"
                typeImage="svg"
              />
            )
          ))}

        {Boolean(youtube) && (
          <>
            {youtube?.includes("/watch?v=") ||
            youtube?.includes("/embed/") ||
            youtube?.includes("youtu.be/") ||
            youtube?.includes("/shorts/") ? (
              <YoutubeHoverPopover
                url={youtube}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            ) : (
              <SocialLinkButton
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={youtube ?? ""}
                icon="youtube-white"
                label="YouTube"
                typeImage="svg"
              />
            )}
          </>
        )}

        {Boolean(instagram) && (
          <>
            {instagram?.includes("instagram.com/p/") ||
            instagram?.includes("instagram.com/reel/") ? (
              <InstagramPopover
                href={instagram}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            ) : (
              <SocialLinkButton
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={instagram ?? ""}
                icon="instagram-white"
                label="Instagram"
                typeImage="svg"
              />
            )}
          </>
        )}

        {Boolean(tiktok) && (
          <>
            {tiktok?.includes("video") ||
            tiktok?.includes("vm.tiktok.com") ||
            tiktok?.includes("photo") ? (
              <TiktokHoverPopover
                url={tiktok as string}
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
              />
            ) : (
              <SocialLinkButton
                containerSize={iconSizeContainerMap[currentSocialPreset]}
                iconSize={iconSizeMap[currentSocialPreset]}
                variant={"primary"}
                size="sm"
                href={tiktok ?? ""}
                icon="tiktok-white"
                label="TikTok"
                typeImage="svg"
              />
            )}
          </>
        )}

        {mint && (dex === "Pump.Fun" || dex === "Pump.Swap") && (
          <SocialLinkButton
            containerSize={iconSizeContainerMap[currentSocialPreset]}
            iconSize={iconSizeMap[currentSocialPreset]}
            variant={"primary"}
            size="sm"
            href={`https://pump.fun/${mint}`}
            icon="pumpfun"
            label="Pumpfun"
            typeImage="svg"
          />
        )}
      </div>
    );
  },
);
SocialLinks.displayName = "SocialLinks";
export default SocialLinks;
