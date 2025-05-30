import emojiRegex from "emoji-regex";

const PROXY_URLS = [
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL,
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL_2,
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL_3,
].filter(Boolean) as string[];

export const getRandomProxyUrl = (): string => {
  if (!PROXY_URLS.length) {
    throw new Error("No proxy URLs configured");
  }

  const randomIndex = Math.floor(Math.random() * PROXY_URLS.length);
  return PROXY_URLS[randomIndex];
};

export const getProxyUrl = (
  src?: string,
  fallback?: string,
): string => {
  // Helper function to remove emojis and special characters
  // Removes emoji Unicode ranges
  // Removes other special Unicode symbols
  // Keeps only printable ASCII characters
  // Trims whitespace
  // const sanitizeString = (str?: string) => {
  //   if (!str) return "";
  //   return str
  //     .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Remove emojis
  //     .replace(/[\u{2700}-\u{27BF}]/gu, "") // Remove dingbats
  //     .replace(/[\u{1F000}-\u{1F255}]/gu, "") // Remove other symbols
  //     .replace(/[^\x20-\x7E]/g, "") // Keep only printable ASCII
  //     .trim();
  // };
  const sanitizeString = (str?: string) => {
    if (!str) return "";

    const regex = emojiRegex();

    return str
      .replace(regex, "") // Remove all emojis
      .replace(/[^\x20-\x7E]/g, "") // Keep only printable ASCII characters
      .trim();
  };

  // Sanitize both src and fallback
  const cleanSrc = sanitizeString(src);
  const validChar = /^[a-zA-Z0-9]+$/
  const sanitizedFallback = sanitizeString(fallback);
  const cleanFallback = validChar.test(sanitizedFallback[0]) ? sanitizedFallback : "O";

  if (!cleanSrc)
    return `${getRandomProxyUrl()}/proxy?url=x&fallback=${cleanFallback}`.trimEnd();

  if (cleanSrc.startsWith("/images/")) return cleanSrc;

  if (cleanSrc.toLowerCase().includes("base64")) return cleanSrc;

  try {
    return `${getRandomProxyUrl()}/proxy?url=${encodeURIComponent(cleanSrc)}&fallback=${cleanFallback}`.trimEnd();
  } catch (error) {
    console.error("Failed to encode URL:", error);
    return "/logo.png";
  }
};
