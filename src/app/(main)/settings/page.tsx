// ######## Components 🧩 ########
import Image from "next/image";
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import SettingsMenu from "@/components/customs/setting/SettingsMenu";
import { generateMetadata } from "@/utils/generateMetadata";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { get2FAStatus } from "@/apis/rest/settings/two-factor-auth";
import { cookies } from "next/headers";
import SettingsClient from "@/components/customs/setting/SettingsClient";

export const metadata = generateMetadata({
  title: "Settings",
});

export default async function SettingsPage() {
  const queryClient = new QueryClient();

  const token = (await cookies()).get("_nova_session");
  await queryClient.prefetchQuery({
    queryKey: ["2faStatus"],
    queryFn: () => get2FAStatus(token?.value),
  });

  return (
    <NoScrollLayout>
      <SettingsClient />
    </NoScrollLayout>
  );
}
