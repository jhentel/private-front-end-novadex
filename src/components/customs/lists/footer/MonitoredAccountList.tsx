"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useMemo } from "react";
// ######## Components 🧩 ########
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import AccountSelectedCard from "@/components/customs/cards/footer/AccountSelectedCard";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { TwitterAccount } from "@/apis/rest/twitter-monitor";
import { DiscordChannel } from "@/types/monitor";

export default function MonitoredAccountList({
  data,
  type,
  handleDeleteTwitterAccount,
}: {
  data: TwitterAccount[] | DiscordChannel[];
  type: "twitter" | "truthSocial" | "discord";
  handleDeleteTwitterAccount: (
    account: TwitterAccount | DiscordChannel,
  ) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (type === "discord") {
        return (item as DiscordChannel)?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else {
        return (item as TwitterAccount).username
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
    });
  }, [data, searchQuery]);

  return (
    <>
      <Input
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        prefixEl={
          <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
            <Image
              src="/icons/search-input.png"
              alt="Search Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        }
        suffixEl={
          searchQuery.length > 0 ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2"
            >
              <Image
                src="/icons/white-close-circle.svg"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </button>
          ) : undefined
        }
      />
      <OverlayScrollbarsComponent
        defer
        element="div"
        className="invisible__overlayscrollbar relative h-full w-full flex-grow overflow-y-scroll rounded-[8px] border border-border md:h-auto"
      >
        <div className="absolute left-0 top-0 w-full flex-grow">
          <div className="flex h-auto w-full flex-col">
            {filteredData.map((item) =>
              type === "discord" ? (
                <AccountSelectedCard
                  key={(item as DiscordChannel).name}
                  account={item as DiscordChannel}
                  handleDeleteTwitterAccount={handleDeleteTwitterAccount}
                  type={type}
                />
              ) : (
                <AccountSelectedCard
                  key={(item as TwitterAccount).username}
                  account={item as TwitterAccount}
                  handleDeleteTwitterAccount={handleDeleteTwitterAccount}
                  type={type}
                />
              ),
            )}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </>
  );
}
