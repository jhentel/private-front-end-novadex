interface Feature {
  id: number;
  image: string;
  title: string;
  description: string;
  route: string;
}

export const newFeatures: Feature[] = [
  {
    id: 1,
    image: "/images/new-features/1.png",
    title: "Raydium new LAUNCHLAB support",
    description: "Trade any token launched on LaunchLab with Nova.",
    route: "/",
  },
  {
    id: 2,
    image: "/images/new-features/2.png",
    title: "Instant Twitter Preview on Hover",
    description: "Easily view a Twitter (X) post by hovering over the X icon.",
    route: "/twitter-monitor",
  },
  {
    id: 3,
    image: "/images/new-features/3.png",
    title: "Instant Instagram Preview on Hover",
    description:
      "Easily view an Instagram post by hovering over the Instagram icon.",
    route: "/twitter-monitor",
  },
  {
    id: 4,
    image: "/images/new-features/4.png",
    title: "Wallet Tracker Volume Toggle",
    description: "Easily adjust your wallet tracker's volume.",
    route: "/wallet-tracker",
  },
  {
    id: 5,
    image: "/images/new-features/5.png",
    title: "Deposit Funds with a QR Code",
    description: "Fund your Nova wallets instantly by scanning a QR code.",
    route: "/wallets",
  },
  {
    id: 6,
    image: "/images/new-features/6.png",
    title: "Instant Trade Decrease Size",
    description: "Effortlessly adjust your instant trade panel's size.",
    route: "/trending",
  },
  {
    id: 7,
    image: "/images/new-features/7.png",
    title: "Find Similar Tokens Instantly",
    description: "Discover similar tokens directly from the token page.",
    route: "/token-client/example-mint",
  },
  {
    id: 8,
    image: "/images/new-features/8.png",
    title: "Search Tokens with OG mode",
    description: "Discover original tokens instantly with OG Mode search.",
    route: "/search",
  },
  {
    id: 9,
    image: "/images/new-features/9.png",
    title: "Transactions, Chart & Twitter Speed Optimization",
    description:
      "Experience instant transactions, charts, and Twitter loading with speed optimizations on Nova.",
    route: "/trending",
  },
];
