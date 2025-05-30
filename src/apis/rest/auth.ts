import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export interface AuthResponse {
  success: boolean;
  message: string;
  isTelegramConnected?: boolean;
  token?: string;
  isNew?: boolean;
  publicKey?: string;
  privateKey?: string;
  requires2FA?: boolean;
}

export interface CheckBalanceResponse {
  [key: string]: number;
}

export interface AuthenticateParams {
  signature: string;
  nonce: string;
  signer: string;
  code?: string;
  telegramUserId?: number;
  telegramUsername?: string;
  telegramToken?: string;
}

export interface AuthenticateSignatureRequest {
  signature: string;
  nonce: string;
  signer: string;
  code?: string;
  two_factor_code?: string;
}

export interface ConnectTelegramRequest {
  telegramUserId: number;
  telegramUsername: string;
  telegramToken: string;
}

// #################### API🔥 ####################
export const generateNonce = async (): Promise<string> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/generate-nonce");

  try {
    const { data } = await axios.post<AuthResponse>(API_BASE_URL);
    return data.message;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to generate nonce",
      );
    }
    throw new Error("Failed to generate nonce");
  }
};

export const validateAccessCode = async (
  code: string,
): Promise<AuthResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/validate-access-code");

  try {
    const response = await axios.post<AuthResponse>(API_BASE_URL, {
      code,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || "Invalid Access Code",
        };
      }
    }
    throw new Error("Network error. Please try again.");
  }
};

export const authenticate = async (
  params: AuthenticateSignatureRequest,
): Promise<AuthResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/authenticate");

  try {
    const { data } = await axios.post<AuthResponse>(API_BASE_URL, params, {
      withCredentials: false,
    });
    /* console.log("Authentication response:", data) */;
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Authentication failed");
    }
    throw new Error("Authentication failed");
  }
};

export const revealKey = async (): Promise<AuthResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/reveal-key");

  try {
    const { data } = await axios.post<AuthResponse>(API_BASE_URL, null, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to reveal key");
    }
    throw new Error("Failed to reveal key");
  }
};

export const checkBalance = async (
  walletAddress: string,
): Promise<CheckBalanceResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion(
    `/check-balance?address=${walletAddress}`,
  );

  try {
    const { data } = await axios.get(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to check balance",
      );
    }
    throw new Error("Failed to check balance");
  }
};

export const decodeTelegramData = (
  encodedData: string,
): {
  id: number;
  username: string;
  token: string;
} | null => {
  try {
    const decoded = JSON.parse(atob(encodedData));
    return {
      id: decoded.id,
      username: decoded.username,
      token: encodedData,
    };
  } catch (error) {
    console.warn("Failed to decode Telegram data:", error);
    return null;
  }
};

export const connectTelegram = async (
  params: ConnectTelegramRequest,
): Promise<AuthResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/connect-telegram");

  try {
    const { data } = await axios.post<AuthResponse>(API_BASE_URL, params, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to connect Telegram",
      );
    }
    throw new Error("Failed to connect Telegram");
  }
};
