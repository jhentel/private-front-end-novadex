import { DEX } from "./ws-general";

export interface SimilarToken {
  name: string;
  symbol: string;
  mint: string;
  dex: DEX;
  image: string;
  marketCap: string;
  createdAt: number;
  lastTrade: number;
}
