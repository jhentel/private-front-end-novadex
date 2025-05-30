"use client";

// ######## Components 🧩 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import { EarnLevels } from "@/components/customs/EarnLevels";
import { EarnBalance } from "@/components/customs/EarnBalance";
import { EarnReferralLink } from "@/components/customs/EarnReferralLink";
import { EarnReferralHistory } from "@/components/customs/EarnReferralHistory";
import { EarnCashBack } from "@/components/customs/EarnCashBack";
import { EarnClaimHistory } from "@/components/customs/EarnClaimHistory";
import Image from "next/image";

const EarnClient = () => {
  return (
    <>
      <NoScrollLayout mobileOnWhichBreakpoint="xl">
        <div className="flex w-full items-center justify-between px-4 pb-2 pt-4 lg:pt-3 xl:px-0">
          <div className="flex items-center gap-x-3">
            <PageHeading
              title="Earn"
              description="Get a bonus as you share to people."
              line={1}
              showDescriptionOnMobile
            />
          </div>
        </div>

        <div className="pb-12 max-xl:px-4">
          <div className="flex items-start justify-start gap-6">
            <div className="w-[390px] max-md:hidden lg:w-[448px]">
              <div className="space-y-4">
                <EarnLevels />

                <div className="relative">
                  <Image
                    src="/images/campaigns/competition.png"
                    alt="$2000 Competition Campaign"
                    width={448}
                    height={152}
                    quality={100}
                    className="rounded-[16px]"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 md:-mt-[48px]">
              <EarnBalance />

              <div className="space-y-6">
                <EarnReferralLink id="APN34G171" />

                <div className="md:hidden">
                  <EarnLevels />
                </div>

                <EarnReferralHistory />

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 xl:col-span-1">
                    <EarnCashBack />
                  </div>
                  <div className="col-span-2 xl:col-span-1">
                    <EarnClaimHistory />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>
    </>
  );
};

export default EarnClient;
