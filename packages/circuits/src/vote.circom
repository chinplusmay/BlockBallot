pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * @title Vote Circuit
 * @notice Zero-knowledge circuit for anonymous voting
 * @dev Extends Semaphore's identity verification with vote signal
 *
 * This circuit proves:
 * 1. The voter knows the secret (nullifier, trapdoor) that generates their identity commitment
 * 2. The identity commitment is a member of the Merkle tree (voting group)
 * 3. The nullifier hash is correctly computed for this election
 * 4. The signal (vote) hash is correctly computed
 *
 * All without revealing the voter's identity or linking votes across elections.
 */

/**
 * @notice Calculate identity commitment from secret
 * @param nullifier The identity nullifier (private)
 * @param trapdoor The identity trapdoor (private)
 * @return commitment The Poseidon hash of (nullifier, trapdoor)
 */
template CalculateIdentityCommitment() {
    signal input nullifier;
    signal input trapdoor;
    signal output commitment;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== nullifier;
    poseidon.inputs[1] <== trapdoor;

    commitment <== poseidon.out;
}

/**
 * @notice Calculate nullifier hash for double-voting prevention
 * @param externalNullifier The election ID (public)
 * @param identityNullifier The identity nullifier (private)
 * @return nullifierHash Unique hash per (election, identity)
 */
template CalculateNullifierHash() {
    signal input externalNullifier;
    signal input identityNullifier;
    signal output nullifierHash;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== externalNullifier;
    poseidon.inputs[1] <== identityNullifier;

    nullifierHash <== poseidon.out;
}

/**
 * @notice Verify Merkle tree inclusion proof
 * @param leaf The leaf value to verify
 * @param siblings Array of sibling hashes
 * @param pathIndices Array of path indices (0 = left, 1 = right)
 * @param root The expected Merkle root
 */
template MerkleTreeInclusionProof(TREE_DEPTH) {
    signal input leaf;
    signal input siblings[TREE_DEPTH];
    signal input pathIndices[TREE_DEPTH];
    signal input root;

    signal hashes[TREE_DEPTH + 1];
    hashes[0] <== leaf;

    component poseidons[TREE_DEPTH];
    component mux[TREE_DEPTH];

    for (var i = 0; i < TREE_DEPTH; i++) {
        // Ensure path index is binary
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        // Select order based on path index
        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];
        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];
        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    // Verify the computed root matches expected root
    root === hashes[TREE_DEPTH];
}

/**
 * @title Main Vote Circuit
 * @param TREE_DEPTH The depth of the Merkle tree (20 is standard)
 *
 * Private inputs:
 *   - identityNullifier: Part of identity secret
 *   - identityTrapdoor: Part of identity secret
 *   - treeSiblings[TREE_DEPTH]: Merkle proof siblings
 *   - treePathIndices[TREE_DEPTH]: Merkle proof path (0=left, 1=right)
 *
 * Public inputs:
 *   - merkleRoot: Root of the identity group Merkle tree
 *   - externalNullifier: Election ID (prevents cross-election replay)
 *   - signalHash: Hash of the vote (e.g., candidate ID)
 *
 * Outputs:
 *   - nullifierHash: Unique per (election, identity), prevents double voting
 */
template Vote(TREE_DEPTH) {
    // Private inputs
    signal input identityNullifier;
    signal input identityTrapdoor;
    signal input treeSiblings[TREE_DEPTH];
    signal input treePathIndices[TREE_DEPTH];

    // Public inputs
    signal input merkleRoot;
    signal input externalNullifier;
    signal input signalHash;

    // Output
    signal output nullifierHash;

    // Step 1: Calculate identity commitment from secrets
    component identityCommitment = CalculateIdentityCommitment();
    identityCommitment.nullifier <== identityNullifier;
    identityCommitment.trapdoor <== identityTrapdoor;

    // Step 2: Verify Merkle tree membership
    component merkleProof = MerkleTreeInclusionProof(TREE_DEPTH);
    merkleProof.leaf <== identityCommitment.commitment;
    merkleProof.root <== merkleRoot;

    for (var i = 0; i < TREE_DEPTH; i++) {
        merkleProof.siblings[i] <== treeSiblings[i];
        merkleProof.pathIndices[i] <== treePathIndices[i];
    }

    // Step 3: Calculate nullifier hash (for double-voting prevention)
    component nullifierHasher = CalculateNullifierHash();
    nullifierHasher.externalNullifier <== externalNullifier;
    nullifierHasher.identityNullifier <== identityNullifier;

    nullifierHash <== nullifierHasher.nullifierHash;

    // Step 4: Square the signal hash to include it in the proof
    // This creates a quadratic constraint that ensures signalHash
    // is actually used in the circuit (prevents malleability)
    signal signalHashSquared;
    signalHashSquared <== signalHash * signalHash;
}

// Instantiate with tree depth of 20 (supports up to ~1M members)
component main {public [merkleRoot, externalNullifier, signalHash]} = Vote(20);

