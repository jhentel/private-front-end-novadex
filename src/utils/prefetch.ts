import axios from "@/libraries/axios";
import { QueryClient } from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const prefetchTokenData = (
  queryClient: QueryClient,
  router: AppRouterInstance,
  mint: string,
) => {
  router.prefetch(`/token/${mint}`);
  // queryClient.prefetchQuery({
  //   queryKey: ["token", mint],
  //   queryFn: () =>
  //     axios
  //       .get(`${process.env.NEXT_PUBLIC_REST_MAIN_URL}/charts?mint=${mint}`)
  //       .then((res) => res.data),
  // });
};
