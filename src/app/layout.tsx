import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "overlayscrollbars/overlayscrollbars.css";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import GlobalDefs from "@/components/customs/GlobalDefs";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { SolanaProvider } from "@/providers/SolanaProvider";
import ClientWrapper from "@/components/ClientWrapper";
import { WebsocketMonitor } from "@/components/customs/WebsocketMonitor";
import SentryProvider from "@/providers/SentryProvider";
import Script from "next/script";

const geistLight = localFont({
  src: "./fonts/static/geist/Geist-Light.ttf",
  variable: "--font-geist-light",
  weight: "300",
  display: "swap",
});
const geistRegular = localFont({
  src: "./fonts/static/geist/Geist-Regular.ttf",
  variable: "--font-geist-regular",
  weight: "400",
  display: "swap",
});
const geistMedium = localFont({
  src: "./fonts/static/geist/Geist-Medium.ttf",
  variable: "--font-geist-medium",
  weight: "500",
  display: "swap",
});
const geistSemiBold = localFont({
  src: "./fonts/static/geist/Geist-SemiBold.ttf",
  variable: "--font-geist-semibold",
  weight: "600",
  display: "swap",
});
const geistBold = localFont({
  src: "./fonts/static/geist/Geist-Bold.ttf",
  variable: "--font-geist-bold",
  weight: "700",
  display: "swap",
});
const geistBlack = localFont({
  src: "./fonts/static/geist/Geist-Black.ttf",
  variable: "--font-geist-black",
  weight: "900",
  display: "swap",
});
const geistMonoLight = localFont({
  src: "./fonts/static/geist-mono/GeistMono-Light.ttf",
  variable: "--font-geist-mono-light",
  weight: "300",
  display: "swap",
});
const geistMonoRegular = localFont({
  src: "./fonts/static/geist-mono/GeistMono-Regular.ttf",
  variable: "--font-geist-mono-regular",
  weight: "400",
  display: "swap",
});
const geistMonoMedium = localFont({
  src: "./fonts/static/geist-mono/GeistMono-Medium.ttf",
  variable: "--font-geist-mono-medium",
  weight: "500",
  display: "swap",
});
const geistMonoSemiBold = localFont({
  src: "./fonts/static/geist-mono/GeistMono-SemiBold.ttf",
  variable: "--font-geist-mono-semibold",
  weight: "600",
  display: "swap",
});
const geistMonoBold = localFont({
  src: "./fonts/static/geist-mono/GeistMono-Bold.ttf",
  variable: "--font-geist-mono-bold",
  weight: "700",
  display: "swap",
});
const outfitSemiBold = localFont({
  src: "./fonts/static/outfit/Outfit-SemiBold.ttf",
  variable: "--font-outfit-semibold",
  weight: "500",
  display: "swap",
});
const outfitBold = localFont({
  src: "./fonts/static/outfit/Outfit-Bold.ttf",
  variable: "--font-outfit-bold",
  weight: "700",
  display: "swap",
});
const outfitBlack = localFont({
  src: "./fonts/static/outfit/Outfit-Black.ttf",
  variable: "--font-outfit-black",
  weight: "900",
  display: "swap",
});

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

export const metadata: Metadata = {
  metadataBase: new URL(`${WEB_URL}`),
  title: "Nova",
  description: "The Fastest All-In-One Trading Platform 🌠",
  keywords: [
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
  creator: "Nova",
  openGraph: {
    title: "Nova",
    description: "The Fastest All-In-One Trading Platform 🌠",
    url: `${WEB_URL}`,
    siteName: "Nova",
    locale: "en_UK",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 600,
        height: 200,
        alt: "Nova Dex",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova",
    description: "The Fastest All-In-One Trading Platform 🌠",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: WEB_URL,
  },
  applicationName: "Nova",
  generator: "Next.js",
  icons: {
    icon: [
      "/favicon-32x32.png",
      "/favicon-16x16.png",
      "/favicon-150x150.png",
      "/favicon-192x192.png",
      "/favicon-512x512.png",
    ],
    apple: ["/apple-touch-icon.png"],
    shortcut: ["/apple-touch-icon.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <script
          async={false}
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        ></script> */}
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        ></link>
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        ></link>
        <link
          href="/favicon-150x150.png"
          rel="icon"
          sizes="150x150"
          type="image/png"
        ></link>
        <link
          href="/favicon-192x192.png"
          rel="icon"
          sizes="192x192"
          type="image/png"
        ></link>
        <link
          href="/favicon-512x512.png"
          rel="icon"
          sizes="512x512"
          type="image/png"
        ></link>

        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        ></link>

        <link rel="canonical" href={WEB_URL} />

        {/* <link */}
        {/*   rel="preload" */}
        {/*   href="/static/charting_library/charting_library.standalone.js" */}
        {/*   as="script" */}
        {/* /> */}
        {/* <link rel="dns-prefetch" href="/static/charting_library" /> */}

        {/* <link rel="preconnect" href="https://nova.trade" />
        <link rel="dns-prefetch" href="https://nova.trade" />
        <Script
          strategy="afterInteractive"
          src="/static/datafeeds/udf/dist/bundle.js"
        ></Script> */}
      </head>
      <body
        className={`${outfitSemiBold.variable} ${outfitBlack.variable} ${outfitBold.variable} ${geistLight.variable} ${geistBold.variable} ${geistRegular.className} ${geistRegular.variable} ${geistMedium.variable} ${geistSemiBold.variable} ${geistBlack.variable} ${geistMonoLight.variable} ${geistMonoRegular.variable} ${geistMonoMedium.variable} ${geistMonoSemiBold.variable} ${geistMonoBold.variable} antialiased`}
      >
        <SentryProvider>
          <ReactQueryProvider>
            <SolanaProvider>
              <NextTopLoader
                color="#DF74FF"
                zIndex={10000}
                showSpinner={false}
                speed={100}
              />
              {/* <ClientWrapper> */}
              {children}
              {/* </ClientWrapper> */}
            </SolanaProvider>
          </ReactQueryProvider>
        </SentryProvider>
        <GlobalDefs />
        {/* <PerformanceMonitor /> */}
        {/* we should change node_env to staging on vercel */}
        {/* {process.env.NEXT_PUBLIC_NODE_ENV !== "production" && ( */}
        {/*   <WebsocketMonitor /> */}
        {/* )} */}
        <Toaster
          toastOptions={{
            duration: 2000,
          }}
        />
        <Script
          strategy="afterInteractive"
          src="/static/charting_library/charting_library.standalone.js"
        />
      </body>
    </html>
  );
}
