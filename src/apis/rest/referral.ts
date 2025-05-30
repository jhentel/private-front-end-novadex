import axios from "@/libraries/axios";

const API_BASE_URL = "https://referrals-api-a0cfaf9fa01e.herokuapp.com/api-v1";

export type ReferralStatus = "processing" | "available" | "claimed";

export interface ReferralHistoryAPIItem {
  date: string;
  dateHover: string;
  referrals: string;
  earnings: string;
  status: ReferralStatus;
  id: string;
  url: string;
}

export interface ReferralData {
  username: string;
  userId: number;
  url: string;
  intent: string;
  "tier-1": {
    volume: string;
    users: number;
  };
  "tier-2": {
    volume: string;
    users: number;
  };
  "tier-3": {
    volume: string;
    users: number;
  };
  referrals: {
    earnings: string;
    users: number;
    volume: string;
  };
  wallet: string;
  paid: string;
  paidUsd: string;
  pending: string;
  pendingUsd: string;
  history: ReferralHistoryAPIItem[];
}

export const getReferralData = async (): Promise<ReferralData> => {
  const { data } = await axios.get(`${API_BASE_URL}/referrals`, {
    headers: {
      "X-Auth-Token":
        "faa50167817839b75cfa44de4c6f8bc98079f47785ebe5a9bc05b39390f8e198.YjBmZDI3ZDIzNzU5NzExZDViYzk4MjJlNDFmNTFhMjQzMTcxZmQyNjMzZWI1ZjlhMmQ1ZjhiM2M1ZDQxYTgxNi03YWJjMmQ2NC04MzIzLTRhNmYtOTJlZS00MDIwZjg5YmJhZjMtMTc0MTc1MDUyNw==",
    },
  });

  return data;
};

export const claimReferral = async (
  id: string,
): Promise<{ transaction_url: string }> => {
  const { data } = await axios.post(`${API_BASE_URL}/referrals/claim`, {
    date: id,
  });

  return data;
};

export const changeReferralCode = async (
  code: string,
): Promise<{
  sucess: boolean;
  code: string;
}> => {
  const { data } = await axios.post(
    `${API_BASE_URL}/referrals/change-referral-code`,
    {
      code,
    },
  );

  return data;
};
