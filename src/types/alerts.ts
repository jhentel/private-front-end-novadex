export interface Alert {
  dex: string;
  image: string;
  marketCap: string;
  mint: string;
  module: "Quick Buy" | "Quick Sell" | "Buy Sniper" | "Sell Sniper";
  name: string;
  price: string;
  signature: string;
  solAmount: string;
  symbol: string;
  timestamp: number;
  tokenAmount: string;
  type: "buy" | "sell";
  walletAddress: string;
  walletName: string;
  status: "success" | "failed";
}
