/**
 * Validates if a string is a valid Solana address (public key)
 * A valid Solana address is a base58 encoded string of 32-44 characters
 */
export function isValidSolanaAddress(address: string): boolean {
  // Basic length check (most Solana addresses are 32-44 characters)
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }

  // Check if the address contains only base58 characters
  // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  const base58Regex =
    /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

  return base58Regex.test(address);
}
