export const truncateAddress = (address: string): string => {
  if (!address) return "";
  const length = 4;
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};
