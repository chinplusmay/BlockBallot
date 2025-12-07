/**
 * ZKP Module Exports
 * Centralizes all ZK proof related functionality
 */

// Loader
export {
  loadCircuit,
  isCircuitCached,
  clearCircuitCache,
  preloadCircuit,
  type CircuitFiles,
  type LoadProgressCallback,
} from './loader';

// Identity
export {
  createIdentityFromSignature,
  getIdentityCommitment,
  getTrapdoor,
  getNullifier,
  exportIdentity,
  importIdentity,
  clearIdentityCache,
  hasIdentity,
  getCachedIdentity,
} from './identity';

// Merkle
export {
  createGroup,
  addMember,
  removeMember,
  getGroup,
  getMerkleRoot,
  generateMerkleProof,
  isMember,
  getMembers,
  clearGroup,
  clearAllGroups,
  syncGroupFromChain,
} from './merkle';

// Prover
export {
  generateVoteProof,
  verifyVoteProof,
  formatProofForContract,
  calculateNullifierHash,
  estimateProofTime,
  type ProofInput,
  type ProofProgressCallback,
} from './prover';

