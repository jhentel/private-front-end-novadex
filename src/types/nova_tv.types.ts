export type ChartPrice = {
  mint: string;
  price: string;
  price_usd: string;
  supply: string;
  solana_price: string;
  volume: string;
  transaction: string;
};

export type MessageStatus = { success: boolean; channel: string; mint: string };

export type Candle = {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
};

export type Ping = {
  channel: string;
  success: boolean;
};

export type InitialChartTrades = {
  success: boolean;
  channel: "chartTrades";
  data: Trade[];
};

export type Trade = {
  average_price_sol: string;
  average_price_usd: string;
  average_sell_price_sol: string;
  average_sell_price_usd: string;
  colour: string;
  letter: string;
  price: string;
  price_usd: string;
  supply: string;
  timestamp: number;
  wallet: string;
  token_amount: string;
  signature?: string;
  imageUrl?: string;
  name?: string;
  mint?: string;
  adjusted?: boolean;
};

export type Order = {
  type: string;
  price: string;
  priceUsd: string;
};

export type SolanaPrice = {
  channel: string;
  data: {
    price: number;
  };
};

export type NovaChart = {
  candles: Candle[];
  no_data: boolean;
  message?: string;
  success?: boolean;
  supply?: string;
};
export type NovaChartTrades = {
  developer_trades: Trade[];
  insider_trades: Trade[];
  other_trades: Trade[];
  sniper_trades: Trade[];
  trades: Trade[];
  user_trades: Trade[];
  no_data: boolean;
};

export type TradeFilter =
  | "my_trades"
  | "sniper_trades"
  | "dev_trades"
  | "insider_trades"
  | "tracked_trades"
  | "other_trades";

export type TradeLetter =
  | "B"
  | "S"
  | "DB"
  | "DS"
  | "SB"
  | "SS"
  | "IB"
  | "IS"
  | string;

export type CurrencyChart = "SOL" | "USD";
export type ChartType = "Price" | "MCap";
