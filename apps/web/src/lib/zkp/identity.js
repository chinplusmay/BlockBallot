/**
 * Semaphore Identity Helper
 * Creates and manages Semaphore v4 identities from wallet signatures
 */

import { Identity } from '@semaphore-protocol/identity';

// Cache for created identities
const identityCache = new Map<string, Identity>();

/**
 * Create a deterministic Semaphore identity from a wallet signature
 * The identity is derived from a signed message, ensuring it's unique per wallet
 */
export async function createIdentityFromSignature(
  address: string,
  signMessage: (message: string) => Promise<string>
): Promise<Identity> {
  // Check cache first
  const cacheKey = address.toLowerCase();
  if (identityCache.has(cacheKey)) {
    return identityCache.get(cacheKey);
  }

  // Create a deterministic message to sign
  const message = `Sign this message to create your Cursor Pro Voting identity.\n\nThis signature will be used to generate a private identity for anonymous voting.\n\nAddress: ${address}\nApp: Cursor Pro Voting`;

  // Get signature from wallet
  const signature = await signMessage(message);

  // Create identity from signature (Semaphore v4 uses the secret directly)
  const identity = new Identity(signature);

  // Cache the identity
  identityCache.set(cacheKey, identity);

  return identity;
}

/**
 * Get the identity commitment (public identifier)
 * This is what gets stored on-chain to prove group membership
 */
export function getIdentityCommitment(identity) {
  return identity.commitment;
}

/**
 * Get the trapdoor (private)
 * Used for proof generation
 */
export function getTrapdoor(identity) {
  return identity.trapdoor;
}

/**
 * Get the nullifier (private)
 * Used for proof generation
 */
export function getNullifier(identity) {
  return identity.nullifier;
}

/**
 * Export identity for backup (BE CAREFUL - this exposes private data)
 */
export function exportIdentity(identity) {
  return identity.export();
}

/**
 * Import identity from backup string
 */
export function importIdentity(exportedIdentity) {
  return Identity.import(exportedIdentity);
}

/**
 * Clear identity from cache
 */
export function clearIdentityCache(address) {
  if (address) {
    identityCache.delete(address.toLowerCase());
  } else {
    identityCache.clear();
  }
}

/**
 * Check if identity exists in cache
 */
export function hasIdentity(address) {
  return identityCache.has(address.toLowerCase());
}

/**
 * Get cached identity (returns null if not found)
 */
export function getCachedIdentity(address) {
  return identityCache.get(address.toLowerCase()) ?? null;
}

