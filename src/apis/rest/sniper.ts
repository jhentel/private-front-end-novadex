import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { z } from "zod";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";
// #################### VALIDATOR📜 ####################
const baseTaskSchema = z.object({
  mint: z.string().min(1, { message: "Token address is required" }),
  method: z.enum(["buy", "sell"], {
    required_error: "Method is required",
    invalid_type_error: "Must be either buy or sell",
  }),
  amount: z.number().optional(),
  mode: z.enum(["fast", "secure"], { message: "Mode is required" }).optional(),
  slippage: z
    .number({
      message: "Slippage must be a number between 0 and 100",
    })
    .min(1)
    .max(100),
  mevProtectEnabled: z.boolean().optional(),
  autoTipEnabled: z.boolean().optional(),
  fee: z.number().min(0),
  minTip: z.number().min(0),
  maxTip: z.number().min(0),
  minAmountOut: z.number().min(0).default(0).optional(),
});

export const migrationTaskSchema = baseTaskSchema.extend({
  wallets: z.union([
    z.array(
      z.object({
        address: z.string().min(1, "Wallet address is required"),
        amount: z.number(),
      }),
    ),
    z.array(z.string()),
  ]),
  name: z.string(),
  dex: z.string(),
  symbol: z.string(),
  image: z.string(),
  percentage: z.number().optional(),
});

export const editMigrationTaskSchema = baseTaskSchema.extend({
  taskId: z.string(),
  wallet: z.string(),
  percentage: z.number().optional(),
});

export const newPairTaskSchema = baseTaskSchema.extend({
  wallets: z.union([
    z.array(
      z.object({
        address: z.string().min(1, "Wallet address is required"),
        amount: z.number(),
      }),
    ),
    z.array(z.string()),
  ]),
  developer: z.string().min(1, "Dev address is required"),
  ticker: z.string().min(1, "Ticker is required"),
  method: z.string().optional(),
});

export const editNewPairTaskSchema = baseTaskSchema.extend({
  taskId: z.string(),
  wallet: z.string(),
  developer: z.string().min(1, "Dev address is required"),
  ticker: z.string().min(1, "Ticker is required"),
  method: z.string().optional(),
});

export const deleteTaskSchema = z.object({
  taskId: z.string(),
});

// Add new Twitter Sniper types and schemas
export interface TwitterSniperUser {
  username: string;
  amount: number;
  snipeTweet: boolean;
  snipeReply: boolean;
  snipeRetweet: boolean;
  snipeBio: boolean;
  minMarketCap: number;
  maxMarketCap: number;
  minTokenAge: number;
  maxTokenAge: number;
  dex: string;
  checkFreeze: boolean;
  checkMint: boolean;
  slippage: number;
  mevProtectEnabled: boolean;
  autoTipEnabled: boolean;
  fee: number;
  tip: number;
  configured: boolean;
}

export interface TwitterSniperTask {
  username: string;
  amount: number;
  snipeTweet: boolean;
  snipeReply: boolean;
  snipeRetweet: boolean;
  snipeBio: boolean;
  minMarketCap: number;
  maxMarketCap: number;
  minTokenAge: number;
  maxTokenAge: number;
  dex: string;
  checkFreeze: boolean;
  checkMint: boolean;
  slippage: number;
  mevProtectEnabled: boolean;
  autoTipEnabled: boolean;
  fee: number;
  tip: number;
}

export const twitterSniperSchema = z.object({
  username: z.string().min(1, "Username is required"),
  amount: z.number().min(0, "Amount must be positive"),
  snipeTweet: z.boolean(),
  snipeReply: z.boolean(),
  snipeRetweet: z.boolean(),
  snipeBio: z.boolean(),
  minMarketCap: z.number().min(0),
  maxMarketCap: z.number().min(0),
  minTokenAge: z.number().min(0),
  maxTokenAge: z.number().min(0),
  dex: z.string(),
  checkFreeze: z.boolean(),
  checkMint: z.boolean(),
  slippage: z.number().max(100),
  mevProtectEnabled: z.boolean(),
  autoTipEnabled: z.boolean(),
  fee: z.number().min(0),
  tip: z.number().min(0),
});

// #################### TYPES📅 ####################
export type MigrationTaskRequest = z.infer<typeof migrationTaskSchema>;
export type EditMigrationTaskRequest = z.infer<typeof editMigrationTaskSchema>;
export type NewPairTaskRequest = z.infer<typeof newPairTaskSchema>;
export type EditNewPairTaskRequest = z.infer<typeof editNewPairTaskSchema>;
export type DeleteTaskRequest = z.infer<typeof deleteTaskSchema>;

interface BaseResponse {
  success: boolean;
}

interface TaskResponse extends BaseResponse {
  taskId: string;
}

export interface SniperTask {
  taskId: string;
  name: string;
  image: string;
  symbol: string;
  mint: string;
  dex: string;
  developer?: string;
  ticker?: string;
  preset: number;
  amount: number;
  processor: string;
  slippage: number;
  autoTipEnabled: boolean;
  percentage: number;
  fee: number;
  minTip: number;
  maxTip: number;
  wallet: string;
  status: "running" | "stopped";
  progress: string;
  progressColour: "purple" | "red" | "green";
  type: "newpair" | "migration";
  isCompleted: boolean;
  minAmountOut: number;
  mevProtectEnabled: boolean;
  mode: "fast" | "secure";
  method: "buy" | "sell";
  marketCapUsd: number;
}

export interface TokenMetadata {
  symbol: string;
  image: string;
  dex: string;
  name: string;
}

// #################### API FUNCTIONS🔄 ####################

export const addMigrationTask = async (
  task: MigrationTaskRequest,
): Promise<TaskResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/add-migration-task");

  try {
    const { data } = await axios.post<TaskResponse>(API_BASE_URL, task);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to add migration task",
      );
    }
    throw new Error("Failed to add migration task");
  }
};

export const editMigrationTask = async (
  task: EditMigrationTaskRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/edit-migration-task");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, task);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to edit migration task",
      );
    }
    throw new Error("Failed to edit migration task");
  }
};

export const addNewPairTask = async (
  task: NewPairTaskRequest,
): Promise<TaskResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/add-new-pair-task");

  try {
    const { data } = await axios.post<TaskResponse>(API_BASE_URL, task);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to add new pair task",
      );
    }
    throw new Error("Failed to add new pair task");
  }
};

export const editNewPairTask = async (
  task: EditNewPairTaskRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/edit-new-pair-task");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, task);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to edit new pair task",
      );
    }
    throw new Error("Failed to edit new pair task");
  }
};

export const getSniperTasks = async (): Promise<SniperTask[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/tasks");

  try {
    const { data } = await axios.get<SniperTask[]>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sniper tasks",
      );
    }
    throw new Error("Failed to fetch sniper tasks");
  }
};

export const deleteSniperTask = async (
  task: DeleteTaskRequest,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/sniper/delete-task");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, task);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to delete sniper task",
      );
    }
    throw new Error("Failed to delete sniper task");
  }
};

export const getTwitterSniper = async (): Promise<TwitterSniperUser> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter-sniper");

  try {
    const { data } = await axios.get<TwitterSniperUser>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch Twitter sniper data",
      );
    }
    throw new Error("Failed to fetch Twitter sniper data");
  }
};

export const updateTwitterSniper = async (
  settings: TwitterSniperTask,
): Promise<BaseResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/twitter-sniper/update");

  try {
    const { data } = await axios.post<BaseResponse>(API_BASE_URL, settings);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to update Twitter sniper",
      );
    }
    throw new Error("Failed to update Twitter sniper");
  }
};

export const getTokenMetadata = async (
  address: string,
): Promise<TokenMetadata> => {
  const API_BASE_URL = getBaseURLBasedOnRegion(`/metadata?mint=${address}`);

  try {
    const { data } = await axios.get<TokenMetadata>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch token metadata",
      );
    }
    throw new Error("Failed to fetch token metadata");
  }
};
