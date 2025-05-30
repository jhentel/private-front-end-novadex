export const getIsStrippedHoldingPreviewData = (
  amount: string | number,
  balance: string | number,
) => {
  return Number(amount) <= 0 && Number(balance) > 0;
};
