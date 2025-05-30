"use client";
import { fetchChartsWithRetry } from "@/apis/rest/charts";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCharts({
  mintAddress,
  enabled = true,
}: {
  mintAddress: string;
  enabled?: boolean;
}) {
  const router = useRouter();

  return useQuery({
    queryKey: ["chart", mintAddress],
    queryFn: async () => {
      // console.time("⌛ FETCHING CHART");
      try {
        const { data } = await fetchChartsWithRetry(mintAddress);
        // console.timeEnd("⌛ FETCHING CHART");
        return data;
      } catch (error) {
        /* console.log("ERROR FETCHING CHART 🚫:", error) */;
        router.push("/");
        throw error;
      }
    },
    staleTime: 15_000,
    gcTime: 15_000,
    enabled: enabled,
  });
}
