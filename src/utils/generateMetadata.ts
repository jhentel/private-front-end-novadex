import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export function generateMetadata({
  title = "Nova",
  description = "The Fastest All-In-One Trading Platform 🌠",
  keywords = [
    "Nova",
    "Nova Dex",
    "Solana",
    "Trading Bot",
    "Fastest Trading Bot",
    "Solana Trading Bot",
    "Solana Trading",
    "Solana Bot",
    "Solana Fastest Trading Bot",
  ],
}: MetadataProps = {}): Metadata {
  return {
    title: `Nova - ${title}`,
    description,
    keywords: keywords.join(", "),
    applicationName: `Nova - ${title}`,
    creator: "Nova",
    generator: "Next.js",
    // icons: {
    //   icon: [`${process.env.NEXT_PUBLIC_WEB_URL}/favicon.ico`],
    //   apple: [`${process.env.NEXT_PUBLIC_WEB_URL}/apple-touch-icon.png`],
    //   shortcut: [`${process.env.NEXT_PUBLIC_WEB_URL}/apple-touch-icon.png`],
    // },
    manifest: "/site.webmanifest",
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_WEB_URL}`),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEB_URL}`,
    },
  };
}
