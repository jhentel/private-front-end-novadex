import TrendingClient from "@/components/customs/TrendingClient";
import { generateMetadata } from "@/utils/generateMetadata";
import { cookies } from "next/headers";

export const metadata = generateMetadata({
  title: "Trending",
});

export default async function TrendingPage() {
  const cookieStore = await cookies();
  const trendingTimeCookie = cookieStore.get("trending-time-filter")?.value;
  const initTrendingTimeOption =
    (trendingTimeCookie as "1m" | "5m" | "30m" | "1h") || "1m";

  const moreFilterCookie = cookieStore.get("trending-more-filter")
    ?.value as string;

  const dexesFilterCookie = cookieStore.get("trending-dexes-filter")
    ?.value as string;

  return (
    <TrendingClient
      initTrendingTime={initTrendingTimeOption}
      moreFilterCookie={moreFilterCookie}
      dexesFilterCookie={dexesFilterCookie}
    />
  );
}
