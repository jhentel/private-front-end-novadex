import axios from "@/libraries/axios";
import { AxiosError } from "axios";
import cookies from "js-cookie";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

interface GenerateWalletResponse {
  success: boolean;
  wallet: {
    address: string;
    key: string;
  };
}

interface WithdrawResponse {
  signature: string;
  success: boolean;
}

export interface Wallet {
  name: string;
  address: string;
  balance: string;
  selected: boolean;
  archived: boolean;
  hasExported: boolean;
  createdAt: number;
}

interface ImportWallet {
  name: string;
  key: string;
}

interface ImportWalletResponse {
  success: boolean;
}

interface SelectWalletsRequest {
  wallets: string[];
}

interface SelectWalletsResponse {
  success: boolean;
}

interface RenameWalletRequest {
  address: string;
  name: string;
}

interface RenameWalletResponse {
  success: boolean;
}

export interface WalletBalance {
  [walletAddress: string]: number;
}

interface RevealKeyResponse {
  success: boolean;
  privateKey?: string;
  publicKey?: string;
}

interface WalletActionResponse {
  success: boolean;
  message?: string;
}

interface WalletActionRequest {
  wallets: string[];
}

// #################### API🔥 ####################
export const generateWallet = async (
  name: string,
): Promise<GenerateWalletResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/generate");

  try {
    const { data } = await axios.post<GenerateWalletResponse>(API_BASE_URL, {
      name,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to generate wallet",
      );
    }
    throw new Error("Failed to generate wallet");
  }
};

export const withdrawFromWallet = async (
  from: string | string[],
  to: string,
  amount: string,
  isMax?: boolean,
): Promise<WithdrawResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion(
    "/wallets/withdraw" + (isMax ? "?max=true" : ""),
  );

  try {
    const { data } = await axios.post<WithdrawResponse>(API_BASE_URL, {
      from,
      to,
      amount,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Withdrawal failed");
    }
    throw new Error("Withdrawal failed");
  }
};

export const getWallets = async (token?: string): Promise<Wallet[]> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets");

  try {
    const { data } = await axios.get<Wallet[]>(API_BASE_URL, {
      withCredentials: false,
      headers: {
        "X-Nova-Session": token || cookies.get("_nova_session"),
      },
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallets",
      );
    }
    throw new Error("Failed to fetch wallets");
  }
};

export const importWallets = async (
  wallets: ImportWallet[],
): Promise<ImportWalletResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/import");

  try {
    const { data } = await axios.post<ImportWalletResponse>(
      API_BASE_URL,
      wallets,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to import wallets",
      );
    }
    throw new Error("Failed to import wallets");
  }
};

export const selectWallets = async (
  wallets: string[],
): Promise<SelectWalletsResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/select");

  try {
    const { data } = await axios.post<SelectWalletsResponse>(API_BASE_URL, {
      wallets,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to select wallets",
      );
    }
    throw new Error("Failed to select wallets");
  }
};

export const deselectWallets = async (
  wallets: string[],
): Promise<SelectWalletsResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/deselect");

  try {
    const { data } = await axios.post<SelectWalletsResponse>(API_BASE_URL, {
      wallets,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to deselect wallets",
      );
    }
    throw new Error("Failed to deselect wallets");
  }
};

export const renameWallet = async (
  address: string,
  name: string,
): Promise<RenameWalletResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/rename");

  try {
    const { data } = await axios.post<RenameWalletResponse>(API_BASE_URL, {
      address,
      name,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to rename wallet",
      );
    }
    throw new Error("Failed to rename wallet");
  }
};

export const getWalletBalances = async (): Promise<WalletBalance> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/balances");

  try {
    const { data } = await axios.get<WalletBalance>(API_BASE_URL, {
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet balances",
      );
    }
    throw new Error("Failed to fetch wallet balances");
  }
};

export const getWalletBalancesNew = async (
  wallets: string[],
): Promise<{
  balances: WalletBalance;
  count: number;
}> => {
  const API_BASE_URL = "https://api-wallet.nova.trade/wallet-balances";

  try {
    const { data } = await axios.post<{
      balances: WalletBalance;
      count: number;
    }>(
      API_BASE_URL,
      {
        wallets,
      },
      {
        withCredentials: false,
      },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet balances",
      );
    }
    throw new Error("Failed to fetch wallet balances");
  }
};

export const revealWalletKey = async (
  address: string,
): Promise<RevealKeyResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/reveal-key");

  try {
    const { data } = await axios.post<RevealKeyResponse>(API_BASE_URL, null, {
      params: { address },
      withCredentials: false,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to reveal private key",
      );
    }
    throw new Error("Failed to reveal private key");
  }
};

export const archiveWallets = async (
  wallets: string[],
): Promise<WalletActionResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/archive");

  try {
    const { data } = await axios.post<WalletActionResponse>(API_BASE_URL, {
      wallets,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to archive wallets",
      );
    }
    throw new Error("Failed to archive wallets");
  }
};

export const unarchiveWallets = async (
  wallets: string[],
): Promise<WalletActionResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/unarchive");

  try {
    const { data } = await axios.post<WalletActionResponse>(API_BASE_URL, {
      wallets,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to unarchive wallets",
      );
    }
    throw new Error("Failed to unarchive wallets");
  }
};

export const deleteWallets = async (
  wallets: string[],
): Promise<WalletActionResponse> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/wallets/delete");

  try {
    const { data } = await axios.post<WalletActionResponse>(API_BASE_URL, {
      wallets,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to delete wallets",
      );
    }
    throw new Error("Failed to delete wallets");
  }
};
