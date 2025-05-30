"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import TokenPageLoading from "@/components/customs/loadings/TokenPageLoading";

export const runtime = "edge";

export default function TokenPrefetchPage(
  props: {
    params: Promise<{ "mint-address": string }>;
  }
) {
  const params = use(props.params);
  const mintAddress = params["mint-address"];
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(`/token/${mintAddress}`);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return <TokenPageLoading />;
}
