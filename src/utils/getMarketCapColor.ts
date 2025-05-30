export const getMarketCapColor = (marketCap: string) => {
  // Handle undefined or empty string
  if (!marketCap) return "text-fontColorSecondary";

  try {
    // Remove '$' and convert 'K' to lowercase for processing
    const cleanValue = marketCap.replace("$", "").replace("K", "k");
    // Extract numeric value
    const numericPart = parseFloat(cleanValue.replace("k", ""));

    if (cleanValue.includes("k")) {
      if (numericPart >= 100) return "text-success"; // 100k+ MCAP - green (#85D6B1)
      if (numericPart >= 30) return "text-warning"; // 30k+ MCAP - orange (#F0A664)
      if (numericPart === 15) return "text-[#66B0FF]"; // 15k MCAP - blue
      if (numericPart < 15) return "text-fontColorSecondary"; // <15k MCAP - grey (#9191A4)
    }
    // Default fallback
    return "text-fontColorSecondary";
  } catch (error) {
    // In case of parsing errors, return default
    return "text-fontColorSecondary";
  }
};
