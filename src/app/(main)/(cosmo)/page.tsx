import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { generateMetadata } from "@/utils/generateMetadata";

// Dynamic imports with loading states
const CosmoClient = dynamic(() =>
  import("@/components/customs/CosmoClient").then((mod) => mod.default),
);

const OnboardingModal = dynamic(() =>
  import("@/components/customs/modals/OnboardingModal").then(
    (mod) => mod.default,
  ),
);

export const metadata = generateMetadata({
  title: "Cosmo",
});

export default async function Home() {
  const isNew = (await cookies()).get("isNew")?.value === "true";
  if (isNew) {
    redirect("/login");
  }
  const initialIsNewUser =
    (await cookies()).get("_is_new_user")?.value === "true";

  return (
    <>
      <CosmoClient initialIsNewUser={initialIsNewUser} />
      {initialIsNewUser && <OnboardingModal />}
    </>
  );
}
