import { getWallets, Wallet } from "@/apis/rest/wallet-manager";
import WalletsClient from "@/components/customs/WalletsClient";
import { generateMetadata } from "@/utils/generateMetadata";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = generateMetadata({
  title: "Wallet Manager",
});

export default async function WalletManagerPage() {
  const token = await (await cookies()).get("_nova_session")?.value;
  let initialData: Wallet[] | null = null;

  try {
    initialData = await getWallets(token);
  } catch (error) {
    console.warn("Error: ", error);
    if ((error as any).response?.status === 401) {
      redirect("/login");
    }
  }

  return <WalletsClient initialData={initialData} />;
}
