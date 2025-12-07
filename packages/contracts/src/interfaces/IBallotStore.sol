// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IBallotStore
 * @notice Interface for the ballot store contract
 */
interface IBallotStore {
    struct VoteCommitment {
        uint256 electionId;
        uint256 candidateId;
        uint256 nullifierHash;
        uint256 signalHash;
        uint256 timestamp;
    }

    function submitVote(
        uint256 electionId,
        uint256 candidateId,
        uint256[8] calldata proof,
        uint256[4] calldata publicSignals
    ) external;

    function getVoteCount(uint256 electionId, uint256 candidateId) external view returns (uint256);
    function getTotalVotes(uint256 electionId) external view returns (uint256);
    function getElectionResults(
        uint256 electionId,
        uint256 candidateCount
    ) external view returns (uint256[] memory);
    function getElectionVotes(uint256 electionId) external view returns (VoteCommitment[] memory);
    function getWinner(
        uint256 electionId,
        uint256 candidateCount
    ) external view returns (uint256 winnerId, uint256 winnerVotes);
}

