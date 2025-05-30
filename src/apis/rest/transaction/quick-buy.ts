import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";

// const TRANSACTION_ENDPOINTS = [
//   "https://transactions.tradeonnova.io",
//   "https://transactions2.tradeonnova.io",
//   "https://transactions3.tradeonnova.io",
//   "https://transactions4.tradeonnova.io",
//   "https://transactions5.tradeonnova.io",
//   "https://transactions6.tradeonnova.io",
// ];
const TRANSACTION_ENDPOINTS = [
  "https://tradeonnova-api-8440d298b8bb.herokuapp.com",
];

interface QuickBuyParams {
  mint: string;
  preset: number;
}

const getRandomBaseUrl = () => {
  const randomIndex = Math.floor(Math.random() * TRANSACTION_ENDPOINTS.length);
  return TRANSACTION_ENDPOINTS[randomIndex];
};

export const submitQuickBuy = async (params: QuickBuyParams): Promise<any> => {
  try {
    const baseUrl = getRandomBaseUrl();
    const { data } = await axios.post(
      `${baseUrl}/api-v1/transactions/submit`,
      params,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Transaction failed");
    }
    throw new Error("Failed to submit transaction");
  }
};
