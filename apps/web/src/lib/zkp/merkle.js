/**
 * Merkle Tree Helper
 * Builds Merkle trees and generates inclusion proofs for Semaphore identity groups
 */

import { Group } from '@semaphore-protocol/group';

// Cache for Merkle trees by group ID
const groupCache = new Map<string, Group>();

/**
 * Create or get a Semaphore group with the given members
 */
export function createGroup(groupId: bigint, members: bigint[] = []): Group {
  const cacheKey = groupId.toString();

  // Check cache
  if (groupCache.has(cacheKey)) {
    return groupCache.get(cacheKey);
  }

  // Create new group
  const group = new Group(members);

  // Cache it
  groupCache.set(cacheKey, group);

  return group;
}

/**
 * Add a member to an existing group
 */
export function addMember(groupId: bigint, commitment: bigint): void {
  const group = getGroup(groupId);
  if (group) {
    group.addMember(commitment);
  }
}

/**
 * Remove a member from an existing group
 */
export function removeMember(groupId: bigint, commitment: bigint): void {
  const group = getGroup(groupId);
  if (group) {
    const index = group.indexOf(commitment);
    if (index !== -1) {
      group.removeMember(index);
    }
  }
}

/**
 * Get an existing group from cache
 */
export function getGroup(groupId) {
  return groupCache.get(groupId.toString()) ?? null;
}

/**
 * Get the Merkle root of a group
 */
export function getMerkleRoot(groupId) {
  const group = getGroup(groupId);
  return group ? group.root : null;
}

/**
 * Generate a Merkle proof for a member's inclusion in the group
 */
export function generateMerkleProof(
  groupId: bigint,
  commitment: bigint
): {
  root: bigint;
  siblings: bigint[];
  pathIndices: number[];
  index: number;
} | null {
  const group = getGroup(groupId);
  if (!group) {
    return null;
  }

  const index = group.indexOf(commitment);
  if (index === -1) {
    return null;
  }

  const proof = group.generateMerkleProof(index);

  return {
    root: proof.root,
    siblings: proof.siblings,
    pathIndices: proof.index.toString(2).padStart(proof.siblings.length, '0').split('').map(Number).reverse(),
    index,
  };
}

/**
 * Check if a commitment is a member of a group
 */
export function isMember(groupId: bigint, commitment: bigint): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  return group.indexOf(commitment) !== -1;
}

/**
 * Get all members of a group
 */
export function getMembers(groupId: bigint): bigint[] {
  const group = getGroup(groupId);
  return group ? group.members : [];
}

/**
 * Clear a group from cache
 */
export function clearGroup(groupId: bigint): void {
  groupCache.delete(groupId.toString());
}

/**
 * Clear all groups from cache
 */
export function clearAllGroups(): void {
  groupCache.clear();
}

/**
 * Update group with members from on-chain data
 */
export function syncGroupFromChain(groupId: bigint, members: bigint[]): Group {
  // Clear existing group
  clearGroup(groupId);

  // Create new group with members
  return createGroup(groupId, members);
}

