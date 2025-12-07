/**
 * ZK Proof Generator
 * Generates Semaphore proofs for anonymous voting
 */

import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import { loadCircuit, isCircuitCached } from './loader';
import { ProofGenerationStep, useZKPStore } from '@/lib/stores/zkp-store';

/**
 * Generate a Semaphore proof for voting
 */
export async function generateVoteProof(
  input,
  onProgress
) {
  const store = useZKPStore.getState();

  try {
    // Step 1: Load circuit if not cached
    if (!isCircuitCached()) {
      store.setStep(ProofGenerationStep.LOADING_CIRCUIT);
      onProgress?.(ProofGenerationStep.LOADING_CIRCUIT, 0);

      await loadCircuit((progress, _stage) => {
        store.setCircuitLoadProgress(progress);
        onProgress?.(ProofGenerationStep.LOADING_CIRCUIT, progress);
      });
    }

    store.setProgress(25);
    onProgress?.(ProofGenerationStep.GENERATING_IDENTITY, 25);

    // Step 2: Generate identity commitment check
    store.setStep(ProofGenerationStep.GENERATING_IDENTITY);
    const commitment = input.identity.commitment;

    // Verify identity is in the group
    const memberIndex = input.group.indexOf(commitment);
    if (memberIndex === -1) {
      throw new Error('Identity is not a member of this voting group');
    }

    store.setProgress(50);
    onProgress?.(ProofGenerationStep.COMPUTING_MERKLE, 50);

    // Step 3: Compute Merkle proof
    store.setStep(ProofGenerationStep.COMPUTING_MERKLE);
    // Merkle proof is computed internally by generateProof

    store.setProgress(75);
    onProgress?.(ProofGenerationStep.GENERATING_PROOF, 75);

    // Step 4: Generate the ZK proof
    store.setStep(ProofGenerationStep.GENERATING_PROOF);

    const proof = await generateProof(
      input.identity,
      input.group,
      input.externalNullifier,
      input.signal
    );

    store.setProgress(100);
    onProgress?.(ProofGenerationStep.COMPLETE, 100);
    store.setStep(ProofGenerationStep.COMPLETE);

    // Format proof for contract submission
    const proofData = {
      proof: {
        a: [proof.proof[0], proof.proof[1]],
        b: [
          [proof.proof[2], proof.proof[3]],
          [proof.proof[4], proof.proof[5]],
        ],
        c: [proof.proof[6], proof.proof[7]],
      },
      publicSignals: proof.publicSignals.map(String),
      nullifierHash: proof.nullifier.toString(),
    };

    store.setProofData(proofData);

    return proofData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during proof generation';
    store.setError(errorMessage);
    throw error;
  }
}

/**
 * Verify a Semaphore proof (client-side verification for testing)
 */
export async function verifyVoteProof(proof) {
  return verifyProof(proof);
}

/**
 * Format proof for smart contract submission
 * Converts proof to the format expected by the Solidity verifier
 */
export function formatProofForContract(proofData) {
  return {
    a: [BigInt(proofData.proof.a[0]), BigInt(proofData.proof.a[1])],
    b: [
      [BigInt(proofData.proof.b[0][0]), BigInt(proofData.proof.b[0][1])],
      [BigInt(proofData.proof.b[1][0]), BigInt(proofData.proof.b[1][1])],
    ],
    c: [BigInt(proofData.proof.c[0]), BigInt(proofData.proof.c[1])],
    input: proofData.publicSignals.map(BigInt),
  };
}

/**
 * Calculate nullifier hash for a given identity and external nullifier
 * This is used to check if a user has already voted
 */
export function calculateNullifierHash(
  identity,
  externalNullifier
) {
  // The nullifier hash is computed by the circuit
  // This is a placeholder - actual implementation uses Poseidon hash
  // In practice, we get this from the proof public signals
  const hash = BigInt(identity.nullifier) ^ externalNullifier;
  return hash;
}

/**
 * Estimate proof generation time based on device capabilities
 */
export async function estimateProofTime() {
  // Simple benchmark - actual time varies by device
  const startTime = performance.now();

  // Simple computation to estimate device speed
  let result = 0n;
  for (let i = 0; i < 10000; i++) {
    result += BigInt(i) * BigInt(i);
  }

  const elapsed = performance.now() - startTime;

  // Rough estimate: slower devices take longer
  // Base time ~10s, adjusted by computation speed
  const baseTime = 10000; // 10 seconds
  const speedFactor = Math.min(Math.max(elapsed / 50, 0.5), 3);

  return Math.round(baseTime * speedFactor);
}
