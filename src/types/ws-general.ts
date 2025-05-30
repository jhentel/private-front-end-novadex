import { FinalDiscordMessage } from "@/types/monitor";

export type PingMessageType = {
  channel: string;
  success: boolean;
  rooms: string[];
};

export type SuccessMessageType = {
  success: boolean;
  channel: string;
};

export type WSMessage<T = any> = {
  channel: string;
  data: T;
} & PingMessageType &
  CosmoDataBatchUpdateMessageType &
  SuccessMessageType;

export type ChartHoldingMessageType = {
  wallet: string;
  holding: HoldingsTokenData;
};

export type DEX =
  | "Pump.Fun"
  | "Launch a Coin"
  | "Bonk"
  | "Moonshot"
  | "LaunchLab"
  | "Boop"
  | "Dynamic Bonding Curve"
  | "Meteora AMM V2"
  | "Meteora AMM"
  | "Raydium"
  | "Pump.Swap";
export type LAUNCHPAD = "" | "Bonk" | "Launch a Coin";

// ### Cosmo Page Types
export type CosmoDataMessageType = {
  mint: string;
  symbol: string;
  name: string;
  image: string;
  twitter: string;
  website: string;
  telegram: string;
  tiktok: string;
  instagram: string;
  youtube: string;
  created: number;
  stars: number;
  snipers: number;
  developer: string;
  insider_percentage: number;
  top10_percentage: number;
  dev_holding_percentage: number;
  bundled: boolean;
  bundled_percentage?: number;
  dev_sold: boolean;
  market_cap_usd: number;
  volume_usd: number;
  liquidity_usd: number;
  holders: number;
  dex: DEX;
  launchpad: LAUNCHPAD;
  progress: number;
  dev_migrated: number;
  bot_holders: number;
  buys: number;
  sells: number;
  migrating: boolean;
  migrated_time: number;
  last_update: number;
  origin_dex: DEX;
  type: "update" | "new";
  is_discord_monitored?: boolean;
  discord_details?: FinalDiscordMessage;
};

export type CosmoDataNewlyMessageType = {
  channel: string;
  data: CosmoDataMessageType;
};

export type CosmoDataBatchUpdateMessageType = {
  created: CosmoDataMessageType[];
  aboutToGraduate: CosmoDataMessageType[];
  graduated: CosmoDataMessageType[];
};

export type CosmoFilterSubscribeMessageType = {
  show_keywords: string;
  hide_keywords: string;
  dexes: string;
  blacklist_developers: string;
  hidden_tokens: string;
  show_hidden: string;
  min_holders: string;
  max_holders: string;
  min_top10_holders: string;
  max_top10_holders: string;
  min_dev_holdings: string;
  max_dev_holdings: string;
  min_dev_migrated: string;
  max_dev_migrated: string;
  min_snipers: string;
  max_snipers: string;
  min_insider_holding: string;
  max_insider_holding: string;
  min_bot_holders: string;
  max_bot_holders: string;
  min_age: string;
  max_age: string;
  min_liquidity: string;
  max_liquidity: string;
  min_market_cap: string;
  max_market_cap: string;
  min_volume: string;
  max_volume: string;
  min_transactions: string;
  max_transactions: string;
  min_buys: string;
  max_buys: string;
  min_sells: string;
  max_sells: string;
};

export type DynamicCosmoFilterSubscriptionMessageType = {
  action: "update";
  channel: "cosmo2";
  token: string;
  created?: CosmoFilterSubscribeMessageType;
  aboutToGraduate?: CosmoFilterSubscribeMessageType;
  graduated?: CosmoFilterSubscribeMessageType;
};

// ### Trending Page Types
export type TrendingDataMessageType = {
  name: string;
  symbol: string;
  mint: string;
  image: string;
  supply: number;
  dex: DEX;
  launchpad: LAUNCHPAD;
  twitter: string;
  telegram: string;
  website: string;
  youtube: string;
  tiktok: string;
  instagram: string;
  created: number;
  volume_sol: number;
  volume_usd: number;
  volume_sol_str: string;
  volume_usd_str: string;
  liquidity_usd: number;
  liquidity_usd_str: string;
  liquidity_sol: number;
  liquidity_sol_str: string;
  market_cap_usd: number;
  market_cap_usd_str: string;
  market_cap_sol: number;
  market_cap_sol_str: string;
  holders: number;
  buys: number;
  sells: number;
  "1m": number;
  "5m": number;
  "30m": number;
  "1h": number;
  mint_disabled: boolean;
  freeze_disabled: boolean;
  burned: boolean;
  top10: number;
  bundled: boolean;
  bundled_percentage?: number;
  category: "1m" | "5m" | "30m" | "1h";
};

// ### Holdings Page Types
export type HoldingsToken = {
  name: string;
  symbol: string;
  dex: DEX;
  launchpad: LAUNCHPAD;
  mint: string;
  pair?: string;
  supply: number;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
};

export type HoldingsTransformedTokenData = {
  token: HoldingsToken & {
    origin_dex?: string;
    buys?: number;
    sells?: number;
    supply?: number;
  };
  list: [
    {
      wallet: string;
      token: {
        price: {
          liquidity_usd: number;
          market_cap_usd: number;
          migrating: boolean;
          price_sol: number;
          price_sol_str: string;
          price_usd: number;
          price_usd_str: string;
          progress: number;
          supply: number;
          volume_sol: string;
          volume_usd: string;
        };
        token?: HoldingsToken & {
          origin_dex?: string;
          buys?: number;
          sells?: number;
          supply?: number;
        };
        investedSolStr: string;
        investedSol: number;
        investedUsdStr: string;
        soldTokensStr: string;
        investedUsd: number;
        soldSol: number;
        soldSolStr: string;
        soldTokens: number;
        balance: number;
        balanceStr: string;
        lastBought: number;
        boughtTokens?: number;
        boughtTokensStr?: string;
        soldUsd?: number;
        soldUsdStr?: string;
        averagePriceSol?: number;
        averagePriceUsd?: number;
        averagePriceSolStr?: string;
        averagePriceUsdStr?: string;
        averageSellPriceSol?: number;
        averageSellPriceUsd?: number;
        averageSellPriceSolStr?: string;
        averageSellPriceUsdStr?: string;
        origin_dex?: string;
      };
    },
  ];
};

export type HoldingsTokenData = {
  token: HoldingsToken;
  price: {
    liquidity_usd: number;
    market_cap_usd: number;
    migrating: boolean;
    price_sol: number;
    price_sol_str: string;
    price_usd: number;
    price_usd_str: string;
    progress: number;
    supply: number;
    volume_sol: string;
    volume_usd: string;
  };
  investedSolStr: string;
  investedSol: number;
  investedUsdStr: string;
  soldTokensStr: string;
  investedUsd: number;
  soldSol: number;
  soldSolStr: string;
  soldTokens: number;
  balance: number;
  balanceStr: string;
  lastBought: number;
  walletName?: string;
} & {
  boughtTokens?: number;
  boughtTokensStr?: string;
  soldUsd?: number;
  soldUsdStr?: string;
  balance_str: string;
  averagePriceSol?: number;
  averagePriceUsd?: number;
  averagePriceSolStr?: string;
  averagePriceUsdStr?: string;
  averageSellPriceSol?: number;
  averageSellPriceUsd?: number;
  averageSellPriceSolStr?: string;
  averageSellPriceUsdStr?: string;
  origin_dex?: string;
};

export type HoldingsConvertedMessageType = {
  wallet: string;
  tokens: HoldingsTokenData[];
};

export type TokenHoldingsConvertedMessageType = {
  wallet: string;
  data: HoldingsTokenData[];
};
export type HoldingsRawMessageType = Record<string, HoldingsTokenData[]>;

// ### Token Page Types
export type TokenDataMessageType = {
  token: TokenInfo;
  transaction: TransactionInfo;
  transactions: TransactionInfo[];
  price: PriceInfo;
  volume: VolumeInfo;
  data_security: DataSecurityInfo;
  chart_holders: ChartHoldersInfo;
  chart_traders: ChartTraderInfo[];
  timestamp: number;
  message?: string;
  success?: boolean;
};

// Processed Token Page Type
export type TokenInfo = {
  mint: string;
  pair: string;
  name: string;
  symbol: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  tiktok: string;
  instagram: string;
  youtube: string;
  dex: DEX;
  origin_dex: DEX;
  launchpad: LAUNCHPAD;
  buys: number;
  sells: number;
  supply: number;
  isOld?: boolean;
};
export type TransactionInfo = {
  first_trade: boolean;
  is_sniper: boolean;
  is_developer: boolean;
  is_insider: boolean;
  animal: "fish" | "whale" | "dolphin";
  timestamp: number;
  type: "buy" | "sell" | "remove" | "add";
  value: number;
  value_usd: number;
  token_amount: number;
  sol_amount: number;
  sol_amount_usd: number;
  price: number;
  price_usd: number;
  price_str: string;
  price_usd_str: string;
  market_cap: number;
  market_cap_usd: number;
  maker: string;
  signature: string;
  buys: number;
  sells: number;
};
export type PriceInfo = {
  market_cap_usd: number;
  price_sol: number;
  price_sol_str: string;
  price_usd: number;
  price_usd_str: string;
  liquidity_usd: number;
  supply: number;
  progress: number;
  migrating: boolean;
  volume_sol: string;
  volume_usd: string;
};
export type Volume = {
  percentage: number;
  transactions: number;
  volume_usd: number;
  makers: number;
  sells: number;
  buys: number;
  sell_volume_usd: number;
  buy_volume_usd: number;
  sellers: number;
  buyers: number;
};
export type VolumeInfo = {
  total_volume_sol: number;
  total_volume_usd: number;
  volume_1m: Volume;
  volume_5m: Volume;
  volume_30m: Volume;
  volume_1h: Volume;
  volume_6h: Volume;
  volume_24h: Volume;
};
export type DataSecurityInfo = {
  sniper_wallets: string[];
  mint_disabled: boolean;
  freeze_disabled: boolean;
  deployer: string;
  burned: boolean;
  open_trading: number;
  bundled: boolean;
  bundled_percentage: number;
  snipers: number;
  sniper_holding: number;
  dev_holding: number;
  insider_holding: number;
  top10_holding: number;
};
export type ChartHolderInfo = {
  is_sniper: boolean;
  is_developer: boolean;
  is_insider: boolean;
  animal: "fish" | "whale" | "dolphin";
  rank: number;
  bought_sol: number;
  sold_sol: number;
  bought_tokens: number;
  sold_tokens: number;
  buys: number;
  sells: number;
  token_balance: number;
  percentage_owned: number;
  maker: string;
  sold_usd: number;
  bought_usd: number;
};
export type ChartHoldersInfo = {
  chart_holders: ChartHolderInfo[];
  total_holders: number;
};
export type ChartTraderInfo = {
  is_sniper: boolean;
  is_developer: boolean;
  is_insider: boolean;
  animal: "fish" | "whale" | "dolphin";
  rank: number;
  profit_percentage: number;
  profit_sol: number;
  profit_usd: number;
  bought_sol: number;
  sold_sol: number;
  bought_usd: number;
  sold_usd: number;
  bought_tokens: number;
  sold_tokens: number;
  buys: number;
  sells: number;
  token_balance: number;
  maker: string;
  percentage_owned: number;
};

// ### Footer Menu Types
export type AlertAndNotificationMessageType = {
  notificationId: string;
  userId: string;
  requestId: string;
  message: string;
  send: boolean;
};

export type MediaSize = {
  w: number;
  h: number;
  resize: "fit" | "crop";
};

export type MediaItem = {
  media_url_https: string;
  sizes: {
    large: MediaSize;
    medium: MediaSize;
    small: MediaSize;
    thumb: MediaSize;
  };
};

export type TweetProfile = {
  name: string;
  username: string;
  image: string;
};

// Updated parent tweet data to match the new backend format
export type ParentTweetData = {
  parent_username: string;
  parent_name: string;
  parent_profile_pic: string;
  parent_date: string;
  parent_text: string;
  parent_media?: MediaItem[];
};

export type TwitterMonitorMessageType = {
  id: string;
  tweet_id: string;
  account?: string;
  type: "retweet" | "post" | "quote_retweet" | "comment";
  tweet_link: string;
  profile: TweetProfile;
  content: {
    fulltext: string;
    image: {
      url: MediaItem[];
      width: number;
      height: number;
    };
    retweet_data: {
      original_tweet_account: string;
      original_tweet_account_name: string;
      original_tweet_profile_pic: string;
      original_tweet_date: string;
      original_tweet_media: MediaItem[] | null;
      original_tweet_text: string;
      // First level of nesting for retweets
      parent_tweet?: ParentTweetData;
    };
    comment_data: {
      comment_text: string;
      replied_to: string;
      replied_to_name: string;
      replied_to_profile_pic: string;
      replied_to_date?: string;
      replied_to_media: MediaItem[] | null;
      // First level of nesting for comments
      parent_tweet?: ParentTweetData;
    };
  };
  mint: string;
  created_at: number;
};

export type TSMonitorMessageType = {
  id: string;
  url: string;
  created_at: string;
  content: string;
  account: {
    id: string;
    username: string;
    display_name: string;
    verified: boolean;
    avatar: string;
  };
  card: null | unknown;
  media_attachments: {
    url: string;
    type: "image" | "video";
    width: number;
    height: number;
  }[];
  type: "post" | "retweet" | "comment" | "quote";
  reblog: null | {
    account: {
      id: string;
      username: string;
      display_name: string;
      verified: boolean;
      avatar: string;
    };
    content: string;
    id: string;
  };
  in_reply_to_id: string | null;
  in_reply_to: null | {
    account: {
      id: string;
      username: string;
      display_name: string;
      verified: boolean;
      avatar: string;
    };
    content: string;
    id: string;
  };
  quote: null | {
    account: {
      id: string;
      username: string;
      display_name: string;
      verified: boolean;
      avatar: string;
    };
    content: string;
    id: string;
  };
  mint?: string;
};

type TokenDiscordData = {
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

export type DiscordMonitorMessageType = {
  address: string;
  group: string;
  channel: string;
  timestamp: string;
  token_data: TokenDiscordData;
};

export interface DeveloperToken {
  name: string;
  symbol: string;
  image: string;
  mint: string;
  created: number;
  migrated: boolean;
  liquidityUsd: number;
  marketCapUsd: number;
  liquiditySol: number;
  marketCapSol: number;
  volume?: number;
  holderCount?: number;
  sells?: number;
  buys?: number;
}
