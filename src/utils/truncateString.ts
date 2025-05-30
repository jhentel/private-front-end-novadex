export const truncateString = (str: string, maxLength: number): string => {
  if (!str) return "";

  // Use Array.from to properly handle Unicode characters
  const characters = Array.from(str);

  if (characters.length <= maxLength) {
    return str;
  }

  // Join only the first maxLength characters and add ellipsis
  return characters.slice(0, maxLength).join("") + "...";
};
