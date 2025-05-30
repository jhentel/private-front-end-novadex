import PointsClient from "@/components/customs/PointsClient";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Points",
});

export default function PointsPage() {
  return <PointsClient />;
}
