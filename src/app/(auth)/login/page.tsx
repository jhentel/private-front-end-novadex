import LoginClient from "@/components/LoginClient";
import { generateMetadata } from "@/utils/generateMetadata";
import { decodeTelegramData } from "@/apis/rest/auth";

export const metadata = generateMetadata({
  title: "Login",
});

export default async function LoginPage(
  props: {
    searchParams: Promise<{ d?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const telegramData = searchParams.d
    ? decodeTelegramData(searchParams.d)
    : null;

  return <LoginClient telegramData={telegramData} />;
}
