// ######## Components 🧩 ########
import HoldingsMarquee from "@/components/layouts/partials/HoldingsAndWatchlist";
import Header from "@/components/layouts/partials/Header";
import Separator from "@/components/customs/Separator";
import { HoldingsConvertedMessageType } from "@/types/ws-general";
import axios from "@/libraries/axios";
import { convertHoldingsResponse } from "@/helpers/convertResponses";
import { cookies } from "next/headers";

export default async function EmptyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full flex-col overflow-hidden">
      <main className="flex w-full grow flex-col px-[32px]">{children}</main>
    </section>
  );
}
