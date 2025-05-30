import { DiscordMonitorMessageType } from "@/types/ws-general";

export type FeedType = "All" | "Twitter" | "Truth" | "Discord";

export type MenuLabel =
  | "All"
  | "Comment"
  | "Retweet and Retruth"
  | "Tweet and Truth Post"
  | "Quote";

export type MenuList = {
  label: MenuLabel;
  description: string;
  icons: {
    active: string;
    inactive: string;
  };
}[];

export interface TSUser {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  group: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  verified: boolean;
  location: string;
  website: string;
  unauth_visibility: boolean;
  chats_onboarded: boolean;
  feeds_onboarded: boolean;
  accepting_messages: boolean;
  emojis: any[];
  fields: any[];
}

export interface TSSearchResponse {
  num_results: number;
  users: TSUser[];
}

export interface SuggestedTSAccount {
  name: string;
  profilePicture: string;
  username: string;
  type: "suggested";
}

export interface TwitterUser {
  friends_count: number;
  user_id: string;
  media_count: number;
  verified: boolean;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
  favourites_count: number;
  followers_count: number;
}

export interface TwitterSearchResponse {
  num_results: number;
  users: TwitterUser[];
}

export interface SuggestedTwitterAccount {
  name: string;
  profilePicture: string;
  username: string;
  type: "suggested";
}

export interface DiscordChannel {
  name: string;
  image: string;
}

export interface SuggestedDiscordChannel {
  name: string;
  image: string;
}

export type TokenDataDiscord = {
  buys: number;
  marketCap: number;
  sells: number | null;
  token_dex: string;
  token_image: string;
  token_instagram: string;
  token_mint: string;
  token_name: string;
  token_symbol: string;
  token_telegram: string;
  token_tiktok: string;
  token_twitter: string;
  token_website: string;
  token_youtube: string;
  volume: string;
};

export type PingDiscord = {
  group: string;
  channel: string;
  count: number;
  pinged_first: boolean;
  pinged_timestamp?: string;
};

export type PingResponseDiscord = {
  token: string;
  pings: PingDiscord[];
  total_count: number;
};

export type FinalDiscordMessage = DiscordMonitorMessageType & {
  total_count: number;
  group_counts: {
    name: string;
    count: number;
    image: string;
    pinged_first: boolean;
    pinged_timestamp?: string;
  }[];
  channel_counts: Record<string, Record<string, number>>;
  last_updated: string;
};
