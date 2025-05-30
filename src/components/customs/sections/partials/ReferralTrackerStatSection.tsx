"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import PayoutCard from "@/components/customs/cards/PayoutCard";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { useReferralStore } from "@/stores/use-referral.store";
import { truncateString } from "@/utils/truncateString";
import { changeReferralCode } from "@/apis/rest/referral";

export default function ReferralTrackerStatSection() {
  const referralData = useReferralStore((state) => state.referralData);
  const isFetching = useReferralStore((state) => state.isFetching);
  const referralLinkPrefix = "https://t.me/TradeOnNovaBot?start=";
  const [referralName, setReferralName] = useState<string>(".");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previousReferralName, setPreviousReferralName] = useState<string>("");
  const firstTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const secondTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyReferralLink = () => {
    const referralLink = `${referralLinkPrefix}${referralName}`;

    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setIsCopied(true);
        firstTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.warn("Failed to referral link:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          secondTimeoutRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        } catch (err) {
          console.warn("Failed to copy referral link:", err);
        }
        document.body.removeChild(textArea);
      });
  };

  useEffect(() => {
    if (referralData?.url) {
      const newReferralName = referralData.url.split("start=")[1];
      setReferralName(newReferralName);
    }
  }, [referralData?.url]);

  const handleReferralNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralName(e.target.value);
  };

  const handleSave = async () => {
    if (!referralName || referralName === previousReferralName) {
      setIsEditing(false);
      return;
    }

    // Store the previous value for rollback
    const oldReferralName = referralName;
    setPreviousReferralName(oldReferralName);

    // Optimistically update the UI
    try {
      setIsEditing(false);

      // Make the API call
      await changeReferralCode(referralName);

      // Show success toast
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Referral code updated successfully"
          className="mt-[104px]"
        />
      ));
    } catch (error) {
      // Show error toast
      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          state="ERROR"
          message="Failed to update referral code"
          className="mt-[104px]"
        />
      ));

      // Rollback to previous value
      setReferralName(previousReferralName);
      setIsEditing(true);
    }
  };

  useEffect(() => {
    return () => {
      if (firstTimeoutRef.current) {
        clearTimeout(firstTimeoutRef.current);
        firstTimeoutRef.current = null;
      }
      if (secondTimeoutRef.current) {
        clearTimeout(secondTimeoutRef.current);
        secondTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative z-10 h-[406px] w-full max-sm:overflow-hidden lg:h-[316px]">
      <div className="absolute -bottom-[362px] left-1/2 z-20 flex aspect-square h-[680px] w-[680px] -translate-x-1/2 items-center justify-center rounded-full border border-white/30 lg:-bottom-[702px] lg:h-[1054px] lg:w-[1054px]">
        {/* Decorations */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[528px] w-[528px] -translate-x-1/2 -translate-y-1/2 scale-[1.75] lg:h-[816px] lg:w-[816px]">
          <Image
            src="/images/decorations/referral-tracker-gradient-decoration.png"
            alt="Referral Tracker Gradient Decoration Image"
            fill
            quality={100}
            className="object-contain"
          />
        </div>

        <div
          style={{
            boxShadow: "0px 0px 40px 0px #DF74FF",
          }}
          className="referral__tracker__content relative z-20 flex aspect-square h-[528px] w-[528px] flex-col items-center justify-start rounded-full bg-gradient-to-b from-[#0D0D18] to-border pt-[73px] lg:h-[816px] lg:w-[816px] lg:pt-[57px]"
        >
          <div className="absolute -top-[42px] left-1/2 aspect-square h-[84px] w-[84px] -translate-x-1/2">
            <Image
              src="/images/referral-tracker.png"
              alt="Referral Tracker Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>

          <div className="relative z-20 flex w-full flex-col items-center gap-y-6 px-1 lg:px-0">
            <h2 className="relative z-20 font-geistSemiBold text-[40px] text-fontColorPrimary">
              Referral Tracker
            </h2>

            <div
              className={cn(
                "flex h-[64px] w-full max-w-[382px] items-center justify-between rounded-[12px] border border-transparent bg-secondary py-2 pl-4 pr-2 duration-300 lg:max-w-[398px]",
                isEditing && "border-[#e896ff9f]",
              )}
            >
              <div className="-mb-0.5 flex w-full max-w-[258px] flex-col items-start justify-end gap-y-0.5 overflow-hidden">
                <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                  Your Referral Link
                </span>
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "inline-block text-nowrap font-geistSemiBold text-base duration-300",
                      isEditing
                        ? "text-fontColorPrimary/[20%]"
                        : "text-fontColorPrimary",
                    )}
                  >
                    {truncateString(referralLinkPrefix.slice(8), 5)}=
                  </span>
                  <input
                    type="text"
                    value={referralName}
                    onChange={handleReferralNameChange}
                    disabled={!isEditing}
                    placeholder="ex: @A123"
                    style={{
                      width:
                        referralName?.length > 0
                          ? referralName.length * 10.2 + 5 > 160
                            ? 160
                            : referralName.length * 10.2 + 5
                          : 160,
                    }}
                    className="block h-auto text-nowrap bg-transparent pl-[1px] font-geistSemiBold text-base text-[#E896FF] placeholder:text-[#e896ff9f] focus:outline-none focus:ring-0"
                  />
                  {!isEditing && (
                    <div
                      onClick={() => setIsEditing(true)}
                      className="relative ml-0.5 aspect-square h-4 w-4 flex-shrink-0 cursor-pointer"
                    >
                      <Image
                        src="/icons/edit.png"
                        alt="Edit Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={isEditing ? handleSave : handleCopyReferralLink}
                className={cn(
                  "hover:bg-primary-1 relative flex h-12 flex-shrink-0 items-center justify-center gap-x-2 rounded-[8px] bg-primary duration-300",
                  isEditing ? "w-[88px] px-6" : "w-[100px] pl-3 pr-4",
                )}
              >
                {isEditing ? (
                  <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                    Save
                  </span>
                ) : (
                  <>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src="/icons/black-copy.png"
                        alt="Black Copy Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block font-geistSemiBold text-base text-[#080811]">
                      Copy
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          <PayoutCard
            context="Payout Paid"
            isFetching={isFetching}
            values={{
              USD: referralData?.paidUsd || "$0",
              SOL: referralData?.paid || "0 SOL",
            }}
            className="-left-[120px] top-[80px] z-50"
          />
          <PayoutCard
            context="Payout Pending"
            isFetching={isFetching}
            values={{
              USD: referralData?.pendingUsd || "$0",
              SOL: referralData?.pending || "0 SOL",
            }}
            className="-right-[120px] top-[80px] z-50"
          />
        </div>
      </div>
    </div>
  );
}
