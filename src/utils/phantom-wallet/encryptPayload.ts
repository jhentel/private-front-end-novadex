import nacl from "tweetnacl";
import bs58 from "bs58";

export const encryptPayload = (
  payload: any,
  sharedSecret?: Uint8Array,
): [Uint8Array, Uint8Array] => {
  if (!sharedSecret) throw new Error("Missing shared secret");

  const nonce = nacl.randomBytes(24);

  const messageUint8 = Buffer.from(JSON.stringify(payload));
  const encrypted = nacl.box.after(messageUint8, nonce, sharedSecret);

  return [nonce, encrypted];
};
