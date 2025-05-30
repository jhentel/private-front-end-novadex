import TwitterMonitorClient from "@/components/customs/TwitterMonitorClient";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Monitor",
});

export default function TwitterMonitorPage() {
  return <TwitterMonitorClient />;
}
