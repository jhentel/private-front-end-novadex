import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Gets an existing keypair from localStorage or creates a new one
 * This ensures the dapp has a consistent identity when connecting to Phantom
 */
export const getOrCreateKeyPair = (): nacl.BoxKeyPair => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return nacl.box.keyPair();
  }

  try {
    // Check if we have a stored keypair
    const storedKeyPair = localStorage.getItem("phantom_dapp_keypair");

    if (storedKeyPair) {
      // Parse the stored keypair
      const parsedKeyPair = JSON.parse(storedKeyPair);

      // Reconstruct the keypair from the stored values
      return {
        publicKey: bs58.decode(parsedKeyPair.publicKey),
        secretKey: bs58.decode(parsedKeyPair.secretKey),
      };
    }

    // No keypair found, create and store a new one
    const newKeyPair = nacl.box.keyPair();

    // Serialize and store the keypair
    const serializedKeyPair = {
      publicKey: bs58.encode(newKeyPair.publicKey),
      secretKey: bs58.encode(newKeyPair.secretKey),
    };

    localStorage.setItem(
      "phantom_dapp_keypair",
      JSON.stringify(serializedKeyPair),
    );

    return newKeyPair;
  } catch (e) {
    console.warn("Failed to retrieve or create keypair:", e);
    // Create a new keypair and make sure to store it before returning
    const fallbackKeyPair = nacl.box.keyPair();
    try {
      const serializedFallback = {
        publicKey: bs58.encode(fallbackKeyPair.publicKey),
        secretKey: bs58.encode(fallbackKeyPair.secretKey),
      };
      localStorage.setItem(
        "phantom_dapp_keypair",
        JSON.stringify(serializedFallback),
      );
    } catch (storageError) {
      console.warn("Failed to store fallback keypair:", storageError);
    }
    return fallbackKeyPair;
  }
};
