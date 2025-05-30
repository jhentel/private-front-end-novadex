import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { SimilarToken } from "@/types/similar-tokens";

const API_BASE_URL = process.env.NEXT_PUBLIC_REST_MAIN_URL || "";

const API_ONCHAIN_BASE_URL = process.env.NEXT_PUBLIC_REST_ONCHAIN_URL || "";

export const getSimilarTokens = async (
  tokenSymbol: string,
): Promise<SimilarToken[]> => {
  try {
    const { data } = await axios.get<SimilarToken[]>(
      `${API_BASE_URL}/similar-tokens`,
      {
        params: { query: tokenSymbol },
        withCredentials: false,
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch similar tokens",
      );
    }
    throw new Error("Failed to fetch similar tokens");
  }
};

export interface TokenSecurityData {
  dexPaid: boolean;
  liquidityLocked: boolean;
}

export const fetchAdditionalTokenData = async (
  mint: string,
  pair: string,
): Promise<TokenSecurityData> => {
  try {
    const sanitizedMint = mint.startsWith("/token/") ? mint.slice(7) : mint;

    const { data } = await axios.get<TokenSecurityData>(
      `${API_ONCHAIN_BASE_URL}/token-security?mint=${sanitizedMint}&pair=${pair}`,
    );

    return data;
  } catch (error) {
    console.warn("Failed to fetch additional token data:", error);
    throw error;
  }
};
