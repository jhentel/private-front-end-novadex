export const interactiveTutorialStyle: any = {
  options: {
    zIndex: 10000,
    backgroundColor: "#080811",
    textColor: "#9191A4",
    primaryColor: "#df74ff",
  },

  tooltip: {
    borderRadius: 8,
    padding: 0,
    border: "1px solid #242436",
    fontSize: 14,
    alignItems: "start",
    textAlign: "start",
  },
  tooltipContent: {
    padding: 16,
    textAlign: "start",
  },
  tooltipFooter: {
    borderRadius: 0,
    padding: 12,
    borderTop: "1px solid #242436",
    marginTop: 0,
  },
  spotlight: {
    backgroundColor: "rgba(255, 255, 255, 30%)",
    border: "1px solid #f2c4ff",
    borderRadius: 8,
    padding: 0,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  buttonClose: {
    strokeWidth: 4,
  },
  buttonNext: {
    backgroundColor: "#df74ff",
    fontWeight: 600,
    borderRadius: 8,
    padding: "7px 12px",
    color: "#080811",
    fontSize: 14,
  },
  buttonBack: {
    backgroundColor: "#17171F",
    fontWeight: 600,
    borderRadius: 8,
    padding: "7px 12px",
    color: "#ffffff",
    fontSize: 14,
  },
  tooltipFooterSpacer: {
    backgroundColor: "transparent",
  },
};

export const interactiveTutorialStepPage = {
  cosmo: {
    start: 1,
    end: 5,
  },
  trending: {
    start: 6,
    end: 7,
  },
  holdings: {
    start: 8,
    end: 12,
  },
  wallets: {
    start: 13,
    end: 16,
  },
  token: {
    start: 17,
    end: 21,
  },
  "wallet-tracker": {
    start: 22,
    end: 24,
  },
  totalStep: 24,
};
