interface Feature {
  id: number;
  title: string;
  description: string;
  video: string;
}

export const newFeatures: Feature[] = [
  {
    id: 1,
    title: "Discord Monitor",
    description: "Monitor new CA's mentioned in Discord servers and instantly purchase the token. ",
    video: '/videos/new-features/discord-monitor-2.mp4',
  },
  {
    id: 2,
    title: "Trades Panel",
    description: "You can now choose where you view ongoing trades. An added option of the right of the chart, allows you to view other metrics at the same time.",
    video: '/videos/new-features/trades-panel.mp4',
  },
  {
    id: 3,
    title: "A new look for Top Holders",
    description:
      "A thinner, more compact look for the Top Holders allows you to view more on your token page at one time. ",
    video: '/videos/new-features/thinner-top-holders.mp4',
  },
  {
    id: 4,
    title: "Customise your Cosmo sounds",
    description: "Whether it be on New Pairs, About to Graduate, or Graduated, if a token pops up, you will be notified. ",
    video: '/videos/new-features/sound-on-cosmo.mp4',
  },
  {
    id: 5,
    title: "Quick Buy Presets",
    description: "More choice for your Cosmo page quickbuys. You can now choose a separate quick buy amount for each column.",
    video: '/videos/new-features/quickbuy-presets.mp4',
  },
  {
    id: 6,
    title: "Persistent Presets",
    description: "Keep your presets the same across all pages for seamless navigation.",
    video: '/videos/new-features/persistent-presets.mp4',
  },
  {
    id: 7,
    title: "New X Hover",
    description: "Brand new placement to the X preview. ",
    video: '/videos/new-features/new-twitter-hover.mp4',
  },
  {
    id: 8,
    title: "Hide Token From Token Page",
    description: "Never want to see a token again? We got you. Hide any unwanted tokens directly within the token page.",
    video: '/videos/new-features/hide-token-from-token-page.mp4',
  },
  {
    id: 9,
    title: "Collapse Buy and Sell Tabs",
    description: "Make your UI simpler by collapsing the Buy and Sell Tabs.",
    video: '/videos/new-features/collapse-on-buysell.mp4',
  },
];
