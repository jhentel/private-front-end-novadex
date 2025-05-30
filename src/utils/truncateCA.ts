export default function truncateCA(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;

  const firstPartLength = Math.ceil(maxLength / 2);
  const secondPartLength = Math.floor(maxLength / 2) - 1;

  const firstPart = str.substring(0, firstPartLength);
  const secondPart = str.substring(str.length - secondPartLength);

  return `${firstPart}...${secondPart}`;
}
