// /**
//  * Determines if the current device is a mobile device
//  * Returns true only for actual mobile devices, not responsive desktop views
//  */
// export const isMobileDevice = (): boolean => {
//   if (typeof window === "undefined") return false;

//   // Check specifically for mobile platform indicators
//   const res = Boolean(
//     navigator.userAgent.match(
//       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
//     ) &&
//       // Additional check to exclude tablets and desktop browsers
//       navigator.platform.match(/iPhone|iPod|iPad|Android/i),
//   );

//   console.log("IS MOBILE", res);
//   return res;
// };

// /**
//  * Determines if the current device is a real mobile device
//  *
//  * This implementation checks the user agent string for known mobile device identifiers,
//  * and also confirms the device supports multiple touch points (to distinguish real mobile from emulators).
//  *
//  * Notes:
//  * - Avoids using navigator.platform as it's deprecated and unreliable.
//  * - Designed to avoid false positives from desktop browsers in responsive mode.
//  */
// export const isMobileDevice = (): boolean => {
//   if (typeof window === "undefined" || typeof navigator === "undefined") {
//     // If not running in a browser environment (e.g. SSR), assume not mobile
//     return false;
//   }

//   const userAgent = navigator.userAgent || navigator.vendor;

//   // Check if the user agent string matches known mobile device patterns
//   const isMobileUA =
//     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//       userAgent,
//     );

//   // Ensure the device supports more than 1 touch point (helps filter out fake mobile UAs)
//   const hasTouch =
//     "maxTouchPoints" in navigator && navigator.maxTouchPoints > 1;

//   return isMobileUA && hasTouch;
// };

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || "";

  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 0);

  const isAndroid = /Android/i.test(userAgent);
  const isInWalletBrowser = /Phantom|MetaMask|Trust|Rainbow|Coinbase/i.test(
    userAgent,
  );
  const isOtherMobile =
    /webOS|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile|Tablet/i.test(
      userAgent,
    );

  const result = isIOS || isAndroid || isInWalletBrowser || isOtherMobile;

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    // console.log("[Wallet Detection]", {
    //   userAgent,
    //   platform: navigator.platform,
    //   maxTouchPoints: navigator.maxTouchPoints,
    //   detected: { isIOS, isAndroid, isInWalletBrowser, isOtherMobile },
    //   result,
    // });
  }

  return result;
};
