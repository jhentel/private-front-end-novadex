import { getWallets } from "@/apis/rest/wallet-manager";
import { useQuery } from "@tanstack/react-query";
import cookies from "js-cookie";

export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const token = cookies.get("_nova_session");
      return await getWallets(token);
    },
    staleTime: 60000,
  });
}
