import { generateMetadata } from "@/utils/generateMetadata";
// import EarnClient from "@/components/customs/EarnClient";
import NotFoundPage from "@/app/not-found";

export const metadata = generateMetadata({
  title: "Earn",
});

export default async function EarnPage() {
  // return <EarnClient />;
  return <NotFoundPage />;
}
