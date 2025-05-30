// ######## Libraries 📦 & Hooks 🪝 ########
import { QueryClient } from "@tanstack/react-query";
import { get2FAStatus } from "@/apis/rest/settings/two-factor-auth";
import { cookies } from "next/headers";
import React from "react";
// ######## Components 🧩 ########
import PageHeading from "@/components/customs/headings/PageHeading";
import TwoFactoryAuthenticationSecuritySettings from "@/components/customs/setting/TwoFactoryAuthenticationSecuritySettings";
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "2FA Authentication",
  description: "Set up and manage two-factor authentication for your Nova account"
});

export default async function TwoFactorAuthenticationPage() {
  const queryClient = new QueryClient();
  const token = (await cookies()).get("_nova_session");

  await queryClient.prefetchQuery({
    queryKey: ["2faStatus"],
    queryFn: () => get2FAStatus(token?.value),
  });

  return (
    <NoScrollLayout>
      <div className="hidden w-full items-center justify-between border-border md:flex md:px-4 md:py-6">
        <PageHeading
          title="Two-Factor Authentication (2FA)"
          description="Add an extra layer of security to your account"
          line={1}
        />
      </div>
      <div className="flex flex-grow flex-col items-center justify-center md:mb-16 md:px-4">
        <TwoFactoryAuthenticationSecuritySettings />
      </div>
    </NoScrollLayout>
  );
}
