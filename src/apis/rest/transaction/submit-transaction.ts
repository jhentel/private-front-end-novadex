import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { z } from "zod";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";

export const submitTransactionSchema = z.object({
  mint: z.string().min(1, "Token address is required"),
  wallets: z.union([
    z.array(
      z.object({
        address: z.string().min(1, "Wallet address is required"),
        amount: z.number(),
      }),
    ),
    z.array(z.string()),
  ]),
  preset: z.number().min(1).max(5),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1),
  mev_protect: z.boolean(),
  auto_tip: z.boolean(),
  fee: z.number().min(0),
  tip: z.number().min(0),
  type: z.enum(["buy", "sell"]),
  amount: z.number().optional(),
  module: z.enum(["Quick Buy", "Quick Sell"]),
  max: z.boolean().optional(),
});

export type SubmitTransactionRequest = z.infer<
  typeof submitTransactionSchema
> & {
  is_fetch?: boolean;
};

interface TransactionResponse {
  success: boolean;
  message: string;
  txId?: string;
}

// #################### API🔥 ####################
export const submitTransaction = async (
  data: SubmitTransactionRequest,
): Promise<TransactionResponse> => {
  const { is_fetch = false } = data;

  const API_BASE_URL = getBaseURLBasedOnRegion(
    is_fetch
      ? `/submit-transaction?fetch=true&max=${data.max}`
      : `/submit-transaction?max=${data.max}`,
  );

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000);

  const finalData = { ...data, max: undefined };

  try {
    const { data: response } = await axios.post<TransactionResponse>(
      API_BASE_URL,
      finalData,
      {
        withCredentials: false,
        signal: controller.signal,
      },
    );

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "CanceledError")
    ) {
      console.warn("Transaction submission timed out after 5 seconds.");
      throw new Error("Request timed out after 5 seconds.");
    }

    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to submit buy transaction",
      );
    }
    throw new Error("Failed to submit buy transaction");
  } finally {
    clearTimeout(timeoutId);
  }
};
