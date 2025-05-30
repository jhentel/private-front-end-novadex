import dynamic from "next/dynamic";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Wallet Tracker",
});

const WalletTrackerClient = dynamic(() =>
  import("@/components/customs/WalletTrackerClient").then((mod) => mod.default),
);

export default function WalletTrackerPage() {
  return <WalletTrackerClient />;
}
