import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { z } from "zod";
import { getBaseURLBasedOnRegion } from "../../../utils/getBaseURLBasedOnRegion";

// #################### VALIDATOR📜 ####################
export const quickBuyPresetSchema = z.object({
  preset: z.string(),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1),
  autoTipEnabled: z.boolean(),
  fee: z.number().min(0),
  tip: z.number().min(0),
  processor: z.string(),
  amounts: z.array(z.number().min(0)),
  autoFeeEnabled: z.boolean().optional(),
});

export const quickSellPresetSchema = z.object({
  preset: z.string(),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  autoTipEnabled: z.boolean(),
  fee: z.number().min(0),
  tip: z.number().min(0),
  processor: z.string(),
  amounts: z.array(z.number().min(0)),
  autoFeeEnabled: z.boolean().optional(),
});

export const customButtonSettingsSchema = z.object({
  tokenFontSizeSetting: z.enum([
    "normal",
    "large",
    "extralarge",
    "doubleextralarge",
  ]),
  buttonSetting: z.enum([
    "normal",
    "large",
    "extralarge",
    "doubleextralarge",
    "tripleextralarge",
    "quadripleextralarge",
  ]),
  fontSetting: z.enum(["normal", "large", "extralarge", "doubleextralarge"]),
  colorSetting: z.enum([
    "normal",
    "blue",
    "purple",
    "fluorescentblue",
    "neutral",
    "lemon",
  ]),
  avatarSetting: z.enum(["normal", "large", "extralarge", "doubleextralarge"]),
  avatarBorderRadiusSetting: z.enum(["rounded", "squared"]),
  socialSetting: z.enum(["normal", "large", "extralarge", "doubleextralarge"]),
});

export const customTokenInformationSettingsSchema = z.object({
  tokenInformationSetting: z.enum(["normal", "simplify"]),
});

export const buySniperPresetSchema = z.object({
  preset: z.string(),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  fee: z.number().min(0),
  minTip: z.number().min(0),
  maxTip: z.number().min(0),
  buyAmount: z.number().min(0),
  processor: z.enum(["fast", "secure"]),
  minAmountOut: z.number().min(0),
  mevProtectEnabled: z.enum(["ON", "OFF"]),
  amounts: z.array(z.number().min(0)),
});

export const sellSniperPresetSchema = z.object({
  preset: z.string(),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  fee: z.number().min(0),
  minTip: z.number().min(0),
  maxTip: z.number().min(0),
  sellAmount: z.number().min(0),
  processor: z.enum(["fast", "secure", "auto"]),
  mevProtectEnabled: z.enum(["ON", "OFF"]),
  amounts: z.array(z.number().min(0)),
});

export const copyTradePresetSchema = z.object({
  preset: z.string(),
  wallets: z.array(z.string()),
  buyMethod: z.enum(["Exact", "Percentage", "Fixed"]),
  buyAmount: z.number().min(0),
  minMarketCap: z.number().min(0),
  maxMarketCap: z.number().min(0),
  minBuyTrigger: z.number().min(0),
  maxBuyTrigger: z.number().min(0),
  followSales: z.boolean(),
  buyOnce: z.boolean(),
  buySlippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  buyFee: z.number().min(0),
  buyTip: z.number().min(0),
  sellSlippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  sellFee: z.number().min(0),
  sellTip: z.number().min(0),
  buyProcessor: z.string(),
  sellProcessor: z.string(),
});

export const limitOrderPresetSchema = z.object({
  preset: z.string(),
  wallets: z.array(z.string()),
  buySlippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  sellSlippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  buyFee: z.number().min(0),
  sellFee: z.number().min(0),
  buyTip: z.number().min(0),
  sellTip: z.number().min(0),
  buyProcessor: z.string(),
  sellProcessor: z.string(),
});

export type QuickBuyPresetRequest = z.infer<typeof quickBuyPresetSchema>;
export type QuickSellPresetRequest = z.infer<typeof quickSellPresetSchema>;
export type BuySniperPresetRequest = z.infer<typeof buySniperPresetSchema>;
export type SellSniperPresetRequest = z.infer<typeof sellSniperPresetSchema>;
export type CopyTradePresetRequest = z.infer<typeof copyTradePresetSchema>;
export type LimitOrderPresetRequest = z.infer<typeof limitOrderPresetSchema>;

// #################### TYPES📅 ####################
export type QuickBuyPreset = z.infer<typeof quickBuyPresetSchema>;

interface BaseResponse {
  success: boolean;
  message: string;
}

export interface BasePresetData {
  slippage: number;
  fee: number;
  tip: number;
  processor: string;
  autoTipEnabled: boolean;
}

export interface QuickPresetData extends BasePresetData {
  amounts: number[];
}

export interface BuySniperPresetData extends BasePresetData {
  amounts: number[];
  buyAmount: number;
  processor: "fast" | "secure";
  minAmountOut: number;
  autoTipEnabled: boolean;
  mevProtectEnabled: "ON" | "OFF";
  minTip: number;
  maxTip: number;
}

export interface SellSniperPresetData extends BasePresetData {
  amounts: number[];
  sellAmount: number;
  // wallets: string[];
  selectedWalletList: string[];
  customizedSellSniperPercentage: { order: number; percentage: number }[];
  mevProtectEnabled: "ON" | "OFF";
  autoTipEnabled: boolean;
  // minAmountOut: number;
  processor: "fast" | "secure";
  minTip: number;
  maxTip: number;
}

export type TokenFontSizeSetting =
  | "normal"
  | "large"
  | "extralarge"
  | "doubleextralarge";
export type ButtonSetting =
  | "normal"
  | "large"
  | "extralarge"
  | "doubleextralarge"
  | "tripleextralarge"
  | "quadripleextralarge";
export type FontSetting =
  | "normal"
  | "large"
  | "extralarge"
  | "doubleextralarge";
export type ColorSetting =
  | "normal"
  | "blue"
  | "purple"
  | "fluorescentblue"
  | "neutral"
  | "lemon";
export type AvatarSetting =
  | "normal"
  | "large"
  | "extralarge"
  | "doubleextralarge";
export type AvatarBorderRadiusSetting = "rounded" | "squared";
export type SocialSetting =
  | "normal"
  | "large"
  | "extralarge"
  | "doubleextralarge";
export type TokenInformationSetting = "normal" | "simplify";

export interface CustomizePresetData {
  tokenFontSizeSetting: TokenFontSizeSetting;
  buttonSetting: ButtonSetting;
  fontSetting: FontSetting;
  colorSetting: ColorSetting;
  avatarSetting: AvatarSetting;
  avatarBorderRadiusSetting: AvatarBorderRadiusSetting;
  socialSetting: SocialSetting;
  tokenInformationSetting: TokenInformationSetting;
}

export interface CopyTradePresetData {
  wallets: string[];
  selectedWalletList: string[]; // Add this
  buyMethod: "Exact" | "Percentage" | "Fixed";
  buyAmount: number;
  minMarketCap: number;
  maxMarketCap: number;
  minBuyTrigger: number;
  maxBuyTrigger: number;
  followSales: boolean;
  buyOnce: boolean;
  buySlippage: number;
  buyFee: number;
  buyTip: number;
  sellSlippage: number;
  sellFee: number;
  sellTip: number;
  buyProcessor: string;
  sellProcessor: string;
}

export interface LimitOrderPresetData extends BasePresetData {
  wallets: string[];
  buySlippage: number;
  sellSlippage: number;
  buyFee: number;
  sellFee: number;
  buyTip: number;
  sellTip: number;
  buyProcessor: string;
  sellProcessor: string;
}

export interface QuickBuyAmountRequest {
  type: "cosmo" | "footer" | "trending" | "twitter" | "wallet-tracker";
  amount: number;
}

interface Settings {
  quickBuySettings: QuickBuySettings;
  quickSellSettings: Record<`preset${1 | 2 | 3 | 4 | 5}`, QuickPresetData>;
  buySniperSettings: Record<`preset${1 | 2 | 3 | 4 | 5}`, BuySniperPresetData>;
  sellSniperSettings: Record<
    `preset${1 | 2 | 3 | 4 | 5}`,
    SellSniperPresetData
  >;
  copyTradeSettings: Record<`preset${1 | 2 | 3 | 4 | 5}`, CopyTradePresetData>;
  limitOrderSettings: Record<
    `preset${1 | 2 | 3 | 4 | 5}`,
    LimitOrderPresetData
  >;
}

interface QuickBuySettings
  extends Record<`preset${1 | 2 | 3 | 4 | 5}`, QuickPresetData> {
  cosmoQuickBuyAmount: number;
  trackerQuickBuyAmount: number;
  footerQuickBuyAmount: number;
  trendingQuickBuyAmount: number;
  twitterQuickBuyAmount: number;
  walletTrackerQuickBuyAmount: number;
  autoFeeEnabled: boolean;
}

// #################### API🔥 ####################
export const updateQuickBuyPreset = async (
  preset: QuickBuyPresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/quick-buy");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update quick buy preset",
      );
    }
    throw new Error("Failed to update quick buy preset");
  }
};

export const updateQuickSellPreset = async (
  preset: QuickSellPresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/quick-sell");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update quick sell preset",
      );
    }
    throw new Error("Failed to update quick sell preset");
  }
};

export const updateBuySniperPreset = async (
  preset: BuySniperPresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/buy-sniper");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update buy sniper preset",
      );
    }
    throw new Error("Failed to update buy sniper preset");
  }
};

export const updateSellSniperPreset = async (
  preset: SellSniperPresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/sell-sniper");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update sell sniper preset",
      );
    }
    throw new Error("Failed to update sell sniper preset");
  }
};

export const updateCopyTradePreset = async (
  preset: CopyTradePresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/copy-trade");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update copy trade preset",
      );
    }
    throw new Error("Failed to update copy trade preset");
  }
};

export const updateLimitOrderPreset = async (
  preset: LimitOrderPresetRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/limit-order");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, preset);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update limit order preset",
      );
    }
    throw new Error("Failed to update limit order preset");
  }
};

export const updateQuickBuyAmount = async (
  request: QuickBuyAmountRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings/quick-buy-amount");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, request);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update quick buy amount",
      );
    }
    throw new Error("Failed to update quick buy amount");
  }
};

export const getSettings = async (): Promise<Settings> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/settings");

  try {
    const { data } = await axios.get<Settings>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch settings",
      );
    }
    throw new Error("Failed to fetch settings");
  }
};
