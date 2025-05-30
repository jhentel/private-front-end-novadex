import {
  HoldingsTokenData,
  HoldingsConvertedMessageType,
} from "@/types/ws-general";

export const convertHoldingsResponse = (rawResponse: {
  [key: string]: HoldingsTokenData[];
}): HoldingsConvertedMessageType[] => {
  return Object.entries(rawResponse).map(([wallet, tokens]) => ({
    wallet,
    tokens,
  }));
};
