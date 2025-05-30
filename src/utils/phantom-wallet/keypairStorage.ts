import * as nacl from "tweetnacl";
import bs58 from "bs58";

export interface SerializedKeyPair {
  publicKey: string;
  secretKey: string;
}

export const storeKeyPair = (keyPair: nacl.BoxKeyPair): void => {
  if (typeof window === "undefined") return;

  const serialized: SerializedKeyPair = {
    publicKey: bs58.encode(keyPair.publicKey),
    secretKey: bs58.encode(keyPair.secretKey),
  };

  try {
    localStorage.setItem("phantom_dapp_keypair", JSON.stringify(serialized));
  } catch (e) {
    console.warn("Failed to store keypair", e);
  }
};

export const retrieveKeyPair = (): nacl.BoxKeyPair | null => {
  if (typeof window === "undefined") return null;

  try {
    const serialized = localStorage.getItem("phantom_dapp_keypair");
    if (!serialized) return null;

    const parsed: SerializedKeyPair = JSON.parse(serialized);

    return {
      publicKey: bs58.decode(parsed.publicKey),
      secretKey: bs58.decode(parsed.secretKey),
    };
  } catch (e) {
    console.warn("Failed to retrieve keypair", e);
    return null;
  }
};

export const generateAndStoreKeyPair = (): nacl.BoxKeyPair => {
  const keyPair = nacl.box.keyPair();
  storeKeyPair(keyPair);
  return keyPair;
};

export const getOrCreateKeyPair = (): nacl.BoxKeyPair => {
  const existing = retrieveKeyPair();
  if (existing) return existing;
  return generateAndStoreKeyPair();
};
