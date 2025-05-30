// Global cache for both loaded images and promises
const IMAGE_CACHE: Record<string, string> = {};
const LOADING_CACHE: Record<string, Promise<string> | undefined> = {};

export const preloadImage = (src: string): Promise<string> => {
  // Return cached image immediately if available
  if (IMAGE_CACHE[src]) {
    return Promise.resolve(IMAGE_CACHE[src]);
  }

  // Return existing promise if the image is already loading
  const existingPromise = LOADING_CACHE[src];
  if (existingPromise) {
    return existingPromise;
  }

  // Create new loading promise
  const promise = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      IMAGE_CACHE[src] = src;
      delete LOADING_CACHE[src];
      resolve(src);
    };
    img.onerror = () => {
      delete LOADING_CACHE[src];
      reject(new Error(`Failed to load image: ${src}`));
    };
  });

  LOADING_CACHE[src] = promise;
  return promise;
};

export const getCachedImage = (src: string): string => {
  if (!IMAGE_CACHE[src]) {
    // Start loading if not already cached
    preloadImage(src).catch(console.warn);
    return src; // Return original src while loading
  }
  return IMAGE_CACHE[src];
};
