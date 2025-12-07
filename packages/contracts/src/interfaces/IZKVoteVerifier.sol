// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IZKVoteVerifier
 * @notice Interface for the ZK vote verifier contract
 */
interface IZKVoteVerifier {
    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }

    function verifyVote(
        uint256 electionId,
        Proof calldata proof,
        uint256[4] calldata publicSignals
    ) external returns (bool);

    function isNullifierUsed(uint256 electionId, uint256 nullifierHash) external view returns (bool);
}

