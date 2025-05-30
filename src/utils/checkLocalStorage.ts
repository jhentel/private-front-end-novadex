export const isLocalStorageNotExist = (key: string): boolean => {
  return !(typeof window !== "undefined" && localStorage.getItem(key));
};
