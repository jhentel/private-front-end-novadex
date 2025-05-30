import { useMemo, useState } from "react";
import { useTwitterMonitorMessageStore } from "@/stores/footer/use-twitter-monitor-message.store";
import { useTSMonitorMessageStore } from "@/stores/footer/use-ts-monitor-message.store";
import { FeedType, MenuList } from "@/types/monitor";
import { useDiscordMonitorMessageStore } from "@/stores/footer/use-discord-monitor-message.store";

export const menuList: MenuList = [
  {
    label: "All",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/x-active.png",
      inactive: "/icons/footer/x-inactive.png",
    },
  },
  {
    label: "Comment",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/comment-twitter-active.png",
      inactive: "/icons/footer/comment-twitter-inactive.png",
    },
  },
  {
    label: "Retweet and Retruth",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/retweet-twitter-active.png",
      inactive: "/icons/footer/retweet-twitter-inactive.png",
    },
  },
  {
    label: "Tweet and Truth Post",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/post-twitter-active.png",
      inactive: "/icons/footer/post-twitter-inactive.png",
    },
  },
  {
    label: "Quote",
    description:
      "Customize trading presets up to 5 different settings and instantly switch between them.",
    icons: {
      active: "/icons/footer/quote-retweet-active.png",
      inactive: "/icons/footer/quote-retweet-inactive.png",
    },
  },
];

export const feedTypes: FeedType[] = ["All", "Twitter", "Truth", "Discord"];

const useSocialFeedMonitor = () => {
  // State for single selection
  const [selectedSettingMenu, setSelectedSettingMenu] = useState("All");
  const [selectedTypeFeed, setSelectedTypeFeed] = useState("All");

  // New state for multiple selection
  const [selectedTypeFeeds, setSelectedTypeFeeds] = useState<FeedType[]>([
    "All",
  ]);

  // Store values
  const twitterMessages = useTwitterMonitorMessageStore(
    (state) => state.messages,
  );
  const tsMessages = useTSMonitorMessageStore((state) => state.messages);
  const discordMessages = useDiscordMonitorMessageStore(
    (state) => state.messages,
  );
  const isLoadingTwitter = useTwitterMonitorMessageStore(
    (state) => state.isLoading,
  );
  const isLoadingTS = useTSMonitorMessageStore((state) => state.isLoading);
  const isLoadingDiscord = useDiscordMonitorMessageStore(
    (state) => state.isLoading,
  );

  // console.log("isLoading", {
  //   isLoadingTwitter,
  //   isLoadingTS,
  //   isLoadingDiscord,
  // });
  const isLoading = isLoadingTwitter && isLoadingTS && isLoadingDiscord;

  // Helper functions
  const normalizeTimestamp = (timestamp: any): number => {
    if (typeof timestamp === "number") return timestamp;
    return new Date(timestamp).getTime();
  };

  const sortByTimestamp = (a: any, b: any) => {
    const timestampA = normalizeTimestamp(a.created_at ?? a.timestamp);
    const timestampB = normalizeTimestamp(b.created_at ?? b.timestamp);
    return timestampB - timestampA;
  };

  const filterAndSortMessages = (messages: any[], type?: string) => {
    return messages
      .filter((message) => {
        const isValidTimestamp =
          normalizeTimestamp(message?.created_at ?? message?.timestamp) > 0;
        return type
          ? message?.type === type && isValidTimestamp
          : isValidTimestamp;
      })
      .sort(sortByTimestamp);
  };

  // Memoized message lists
  const twitterMessagesByType = useMemo(
    () => ({
      all: filterAndSortMessages(twitterMessages),
      comment: filterAndSortMessages(twitterMessages, "comment"),
      retweet: filterAndSortMessages(twitterMessages, "retweet"),
      post: filterAndSortMessages(twitterMessages, "post"),
      quoteRetweet: filterAndSortMessages(twitterMessages, "quote_retweet"),
    }),
    [twitterMessages],
  );

  const tsMessagesByType = useMemo(
    () => ({
      all: filterAndSortMessages(tsMessages),
      comment: filterAndSortMessages(tsMessages, "comment"),
      retweet: filterAndSortMessages(tsMessages, "retweet"),
      post: filterAndSortMessages(tsMessages, "post"),
      quoteRetweet: filterAndSortMessages(tsMessages, "quote"),
    }),
    [tsMessages],
  );

  const discordMessagesByType = useMemo(() => {
    return {
      all: filterAndSortMessages(discordMessages),
      comment: [],
      retweet: [],
      post: filterAndSortMessages(discordMessages),
      quoteRetweet: [],
    };
  }, [discordMessages]);

  // Combined messages
  const combinedMessagesByType = useMemo(
    () => ({
      all: [
        ...twitterMessagesByType.all,
        ...tsMessagesByType.all,
        ...discordMessagesByType.all,
      ].sort(sortByTimestamp),
      comment: [
        ...twitterMessagesByType.comment,
        ...tsMessagesByType.comment,
      ].sort(sortByTimestamp),
      retweet: [
        ...twitterMessagesByType.retweet,
        ...tsMessagesByType.retweet,
      ].sort(sortByTimestamp),
      post: [...twitterMessagesByType.post, ...tsMessagesByType.post].sort(
        sortByTimestamp,
      ),
      quoteRetweet: [
        ...twitterMessagesByType.quoteRetweet,
        ...tsMessagesByType.quoteRetweet,
      ].sort(sortByTimestamp),
    }),
    [twitterMessagesByType, tsMessagesByType, discordMessagesByType],
  );

  // Function to get messages based on feed types and content type
  const getMessagesByFeedTypes = (
    feedTypes: FeedType[],
    contentType: string,
  ) => {
    // If "All" is included, return combined messages
    if (feedTypes.includes("All")) {
      return (
        combinedMessagesByType[
          contentType as keyof typeof combinedMessagesByType
        ] || []
      );
    }

    // Otherwise, combine messages from selected feed types
    let messages: any[] = [];

    if (feedTypes.includes("Twitter")) {
      messages = [
        ...messages,
        ...(twitterMessagesByType[
          contentType as keyof typeof twitterMessagesByType
        ] || []),
      ];
    }

    if (feedTypes.includes("Truth")) {
      messages = [
        ...messages,
        ...(tsMessagesByType[contentType as keyof typeof tsMessagesByType] ||
          []),
      ];
    }

    if (feedTypes.includes("Discord")) {
      messages = [
        ...messages,
        ...(discordMessagesByType[
          contentType as keyof typeof discordMessagesByType
        ] || []),
      ];
    }

    return messages.sort(sortByTimestamp);
  };

  // Original single selection final messages
  const finalMessages = useMemo(() => {
    const messageMap = {
      All: combinedMessagesByType,
      Twitter: twitterMessagesByType,
      Truth: tsMessagesByType,
      Discord: discordMessagesByType,
    }[selectedTypeFeed];

    const typeMap = {
      All: messageMap?.all,
      Comment: messageMap?.comment,
      "Retweet and Retruth": messageMap?.retweet,
      "Tweet and Truth Post": messageMap?.post,
      Quote: messageMap?.quoteRetweet || [],
    }[selectedSettingMenu];

    return typeMap || [];
  }, [
    selectedTypeFeed,
    selectedSettingMenu,
    combinedMessagesByType,
    twitterMessagesByType,
    tsMessagesByType,
    discordMessagesByType,
  ]);

  // New multiple selection final messages
  const finalMessagesMulti = useMemo(() => {
    const contentTypeMap = {
      All: "all",
      Comment: "comment",
      "Retweet and Retruth": "retweet",
      "Tweet and Truth Post": "post",
      Quote: "quoteRetweet",
    }[selectedSettingMenu];

    const contentType = contentTypeMap || "all";

    // Special case: If Discord is one of the selected feeds and content type isn't compatible
    // with Discord (i.e., not "all" or "post"), filter Discord out for this query
    if (
      selectedTypeFeeds.includes("Discord") &&
      !selectedTypeFeeds.includes("All") &&
      contentType !== "all" &&
      contentType !== "post"
    ) {
      // Get messages without Discord
      const filteredFeeds = selectedTypeFeeds.filter(
        (feed) => feed !== "Discord",
      );

      // If we filtered everything out, default to All (which will apply content type filter)
      if (filteredFeeds.length === 0) {
        return (
          combinedMessagesByType[
            contentType as keyof typeof combinedMessagesByType
          ] || []
        );
      }

      return getMessagesByFeedTypes(filteredFeeds, contentType);
    }

    return getMessagesByFeedTypes(selectedTypeFeeds, contentType);
  }, [
    selectedTypeFeeds,
    selectedSettingMenu,
    combinedMessagesByType,
    twitterMessagesByType,
    tsMessagesByType,
    discordMessagesByType,
  ]);

  // Helper function to toggle a feed type in the multiple selection
  const toggleFeedType = (feedType: FeedType) => {
    setSelectedTypeFeeds((prev) => {
      // If clicking on "All", select only "All"
      if (feedType === "All") {
        return ["All"];
      }

      // Create a new array without "All" and the clicked type (if already present)
      const newSelection = prev.filter(
        (type) => type !== "All" && type !== feedType,
      );

      // If the type wasn't present before, add it
      if (!prev.includes(feedType)) {
        newSelection.push(feedType);
      }

      // If no selection remains, default to "All"
      if (newSelection.length === 0) {
        return ["All"];
      }

      return newSelection;
    });
  };

  return {
    discordMessages,
    isLoading,
    finalMessages,
    selectedTypeFeed,
    setSelectedTypeFeed,
    selectedSettingMenu,
    setSelectedSettingMenu,
    finalMessagesMulti,
    selectedTypeFeeds,
    setSelectedTypeFeeds,
    toggleFeedType,
  };
};

export default useSocialFeedMonitor;
