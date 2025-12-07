// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKVoteVerifier
 * @notice Verifies Groth16 zero-knowledge proofs for voting
 * @dev This is a template - the actual verifier should be generated from the circuit
 */
contract ZKVoteVerifier is Ownable {
    // ============ Structs ============

    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }

    struct VerifyingKey {
        uint256[2] alfa1;
        uint256[2][2] beta2;
        uint256[2][2] gamma2;
        uint256[2][2] delta2;
        uint256[2][] IC;
    }

    // ============ State Variables ============

    /// @notice The verifying key for the Semaphore circuit
    VerifyingKey public verifyingKey;

    /// @notice Mapping of nullifier hashes to prevent double voting
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Mapping of election ID to nullifier hash to check per-election
    mapping(uint256 => mapping(uint256 => bool)) public electionNullifiers;

    // ============ Events ============

    event ProofVerified(
        uint256 indexed electionId,
        uint256 indexed nullifierHash,
        uint256 signalHash
    );

    event VerifyingKeyUpdated(address indexed updater);

    // ============ Errors ============

    error InvalidProof();
    error NullifierAlreadyUsed();
    error InvalidPublicSignals();
    error VerifyingKeyNotSet();

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ External Functions ============

    /**
     * @notice Verify a ZK proof for voting
     * @param electionId The election ID (used as external nullifier)
     * @param proof The Groth16 proof
     * @param publicSignals The public signals [merkleRoot, nullifierHash, signalHash, externalNullifier]
     * @return True if the proof is valid
     */
    function verifyVote(
        uint256 electionId,
        Proof calldata proof,
        uint256[4] calldata publicSignals
    ) external returns (bool) {
        uint256 nullifierHash = publicSignals[1];
        uint256 externalNullifier = publicSignals[3];

        // Check external nullifier matches election ID
        if (externalNullifier != electionId) {
            revert InvalidPublicSignals();
        }

        // Check nullifier hasn't been used in this election
        if (electionNullifiers[electionId][nullifierHash]) {
            revert NullifierAlreadyUsed();
        }

        // Verify the proof
        if (!_verifyProof(proof, publicSignals)) {
            revert InvalidProof();
        }

        // Mark nullifier as used
        electionNullifiers[electionId][nullifierHash] = true;
        nullifierHashes[nullifierHash] = true;

        emit ProofVerified(electionId, nullifierHash, publicSignals[2]);

        return true;
    }

    /**
     * @notice Check if a nullifier has been used in an election
     * @param electionId The election ID
     * @param nullifierHash The nullifier hash to check
     * @return True if the nullifier has been used
     */
    function isNullifierUsed(
        uint256 electionId,
        uint256 nullifierHash
    ) external view returns (bool) {
        return electionNullifiers[electionId][nullifierHash];
    }

    /**
     * @notice Set the verifying key
     * @dev In production, this should be generated from the trusted setup
     * @param _vkAlfa1 Alpha1 point
     * @param _vkBeta2 Beta2 point
     * @param _vkGamma2 Gamma2 point
     * @param _vkDelta2 Delta2 point
     * @param _vkIC IC points
     */
    function setVerifyingKey(
        uint256[2] calldata _vkAlfa1,
        uint256[2][2] calldata _vkBeta2,
        uint256[2][2] calldata _vkGamma2,
        uint256[2][2] calldata _vkDelta2,
        uint256[2][] calldata _vkIC
    ) external onlyOwner {
        verifyingKey.alfa1 = _vkAlfa1;
        verifyingKey.beta2 = _vkBeta2;
        verifyingKey.gamma2 = _vkGamma2;
        verifyingKey.delta2 = _vkDelta2;

        // Clear and set IC
        delete verifyingKey.IC;
        for (uint256 i = 0; i < _vkIC.length; i++) {
            verifyingKey.IC.push(_vkIC[i]);
        }

        emit VerifyingKeyUpdated(msg.sender);
    }

    // ============ Internal Functions ============

    /**
     * @dev Verify a Groth16 proof
     * @notice This is a simplified implementation for demonstration
     * @notice In production, use the snarkjs-generated verifier contract
     */
    function _verifyProof(
        Proof calldata proof,
        uint256[4] calldata publicSignals
    ) internal view returns (bool) {
        // Verify the verifying key is set
        if (verifyingKey.IC.length == 0) {
            revert VerifyingKeyNotSet();
        }

        // Basic validation of proof elements
        // In production, this would be full elliptic curve pairing verification
        if (proof.a[0] == 0 && proof.a[1] == 0) {
            return false;
        }

        if (proof.c[0] == 0 && proof.c[1] == 0) {
            return false;
        }

        // Placeholder for actual Groth16 verification
        // The actual implementation would use bn128 pairing checks
        // This is just for testing purposes

        // For demo: always return true if proof structure is valid
        // IMPORTANT: Replace with actual verification in production!
        return true;
    }

    /**
     * @dev Scalar multiplication placeholder
     * @notice In production, use precompiled contract at 0x07
     */
    function _scalarMul(
        uint256[2] memory p,
        uint256 s
    ) internal pure returns (uint256[2] memory r) {
        // Placeholder - actual implementation uses ecMul precompile
        r[0] = p[0];
        r[1] = p[1];
        // In reality: assembly { ... call ecMul precompile ... }
    }

    /**
     * @dev Point addition placeholder
     * @notice In production, use precompiled contract at 0x06
     */
    function _pointAdd(
        uint256[2] memory p1,
        uint256[2] memory p2
    ) internal pure returns (uint256[2] memory r) {
        // Placeholder - actual implementation uses ecAdd precompile
        r[0] = p1[0] + p2[0];
        r[1] = p1[1] + p2[1];
        // In reality: assembly { ... call ecAdd precompile ... }
    }
}

