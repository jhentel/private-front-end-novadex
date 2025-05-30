import { convertHoldingsResponse } from "@/helpers/convertResponses";
import axios from "@/libraries/axios";
import { HoldingsConvertedMessageType } from "@/types/ws-general";
import { getBaseURLBasedOnRegion } from "../../utils/getBaseURLBasedOnRegion";

export const getHoldings = async (
  token?: string,
): Promise<HoldingsConvertedMessageType[] | null> => {
  const API_BASE_URL = getBaseURLBasedOnRegion("/holdings");

  try {
    const { data } = await axios.get<any>(
      API_BASE_URL,
      ...(token
        ? [
            {
              headers: {
                "X-Nova-Session": token,
              },
            },
          ]
        : []),
    );
    return convertHoldingsResponse(data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch holdings",
    );
  }
};
