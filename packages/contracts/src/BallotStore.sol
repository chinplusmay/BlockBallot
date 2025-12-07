// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IZKVoteVerifier} from "./interfaces/IZKVoteVerifier.sol";

/**
 * @title BallotStore
 * @notice Stores and tallies encrypted vote commitments
 * @dev Uses ZK proofs to verify votes while maintaining voter privacy
 */
contract BallotStore is Ownable, ReentrancyGuard {
    // ============ Structs ============

    struct VoteCommitment {
        uint256 electionId;
        uint256 candidateId;
        uint256 nullifierHash;
        uint256 signalHash;
        uint256 timestamp;
    }

    struct ElectionResults {
        uint256 totalVotes;
        mapping(uint256 => uint256) candidateVotes;
    }

    // ============ State Variables ============

    /// @notice The ZK vote verifier contract
    IZKVoteVerifier public verifier;

    /// @notice Authorized addresses that can submit votes
    mapping(address => bool) public voteSubmitters;

    /// @notice Vote count per election per candidate
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts;

    /// @notice Total votes per election
    mapping(uint256 => uint256) public totalVotes;

    /// @notice All vote commitments (for audit)
    VoteCommitment[] public voteCommitments;

    /// @notice Vote commitments by election
    mapping(uint256 => uint256[]) public electionVoteIndices;

    // ============ Events ============

    event VoteSubmitted(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        uint256 nullifierHash,
        uint256 timestamp
    );

    event VoteSubmitterUpdated(address indexed submitter, bool status);
    event VerifierUpdated(address indexed newVerifier);

    // ============ Errors ============

    error InvalidElection();
    error InvalidCandidate();
    error InvalidProof();
    error NotVoteSubmitter();
    error VoteAlreadySubmitted();
    error VerifierNotSet();

    // ============ Modifiers ============

    modifier onlyVoteSubmitter() {
        if (!voteSubmitters[msg.sender] && msg.sender != owner()) {
            revert NotVoteSubmitter();
        }
        _;
    }

    // ============ Constructor ============

    constructor(address _verifier) Ownable(msg.sender) {
        if (_verifier != address(0)) {
            verifier = IZKVoteVerifier(_verifier);
        }
        voteSubmitters[msg.sender] = true;
    }

    // ============ External Functions ============

    /**
     * @notice Submit a vote with ZK proof
     * @param electionId The election ID
     * @param candidateId The candidate being voted for
     * @param proof The Groth16 proof (a, b, c components)
     * @param publicSignals The public signals from the proof
     */
    function submitVote(
        uint256 electionId,
        uint256 candidateId,
        uint256[8] calldata proof,
        uint256[4] calldata publicSignals
    ) external onlyVoteSubmitter nonReentrant {
        if (electionId == 0) {
            revert InvalidElection();
        }

        if (candidateId == 0) {
            revert InvalidCandidate();
        }

        // Verify the ZK proof if verifier is set
        if (address(verifier) != address(0)) {
            IZKVoteVerifier.Proof memory zkProof = IZKVoteVerifier.Proof({
                a: [proof[0], proof[1]],
                b: [[proof[2], proof[3]], [proof[4], proof[5]]],
                c: [proof[6], proof[7]]
            });

            bool isValid = verifier.verifyVote(electionId, zkProof, publicSignals);
            if (!isValid) {
                revert InvalidProof();
            }
        }

        // Store the vote
        uint256 nullifierHash = publicSignals[1];
        uint256 signalHash = publicSignals[2];

        // Increment vote counts
        voteCounts[electionId][candidateId]++;
        totalVotes[electionId]++;

        // Store commitment for audit
        uint256 commitmentIndex = voteCommitments.length;
        voteCommitments.push(
            VoteCommitment({
                electionId: electionId,
                candidateId: candidateId,
                nullifierHash: nullifierHash,
                signalHash: signalHash,
                timestamp: block.timestamp
            })
        );

        electionVoteIndices[electionId].push(commitmentIndex);

        emit VoteSubmitted(electionId, candidateId, nullifierHash, block.timestamp);
    }

    /**
     * @notice Submit a vote without proof verification (for testing/demo)
     * @dev Only callable by owner - for demonstration purposes
     * @param electionId The election ID
     * @param candidateId The candidate being voted for
     */
    function submitVoteDemo(
        uint256 electionId,
        uint256 candidateId
    ) external onlyOwner nonReentrant {
        if (electionId == 0) {
            revert InvalidElection();
        }

        if (candidateId == 0) {
            revert InvalidCandidate();
        }

        // Increment vote counts
        voteCounts[electionId][candidateId]++;
        totalVotes[electionId]++;

        // Store minimal commitment for demo
        uint256 commitmentIndex = voteCommitments.length;
        voteCommitments.push(
            VoteCommitment({
                electionId: electionId,
                candidateId: candidateId,
                nullifierHash: uint256(keccak256(abi.encodePacked(block.timestamp, commitmentIndex))),
                signalHash: uint256(keccak256(abi.encodePacked(candidateId))),
                timestamp: block.timestamp
            })
        );

        electionVoteIndices[electionId].push(commitmentIndex);

        emit VoteSubmitted(
            electionId,
            candidateId,
            voteCommitments[commitmentIndex].nullifierHash,
            block.timestamp
        );
    }

    /**
     * @notice Set vote submitter status
     * @param submitter The address to update
     * @param status Whether the address can submit votes
     */
    function setVoteSubmitter(address submitter, bool status) external onlyOwner {
        voteSubmitters[submitter] = status;
        emit VoteSubmitterUpdated(submitter, status);
    }

    /**
     * @notice Update the verifier contract
     * @param _verifier The new verifier address
     */
    function setVerifier(address _verifier) external onlyOwner {
        verifier = IZKVoteVerifier(_verifier);
        emit VerifierUpdated(_verifier);
    }

    // ============ View Functions ============

    /**
     * @notice Get vote count for a candidate in an election
     * @param electionId The election ID
     * @param candidateId The candidate ID
     * @return The number of votes
     */
    function getVoteCount(
        uint256 electionId,
        uint256 candidateId
    ) external view returns (uint256) {
        return voteCounts[electionId][candidateId];
    }

    /**
     * @notice Get total votes for an election
     * @param electionId The election ID
     * @return The total number of votes
     */
    function getTotalVotes(uint256 electionId) external view returns (uint256) {
        return totalVotes[electionId];
    }

    /**
     * @notice Get vote counts for all candidates in an election
     * @param electionId The election ID
     * @param candidateCount The number of candidates
     * @return Array of vote counts indexed by candidate ID - 1
     */
    function getElectionResults(
        uint256 electionId,
        uint256 candidateCount
    ) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](candidateCount);

        for (uint256 i = 1; i <= candidateCount; ) {
            results[i - 1] = voteCounts[electionId][i];
            unchecked {
                ++i;
            }
        }

        return results;
    }

    /**
     * @notice Get all vote commitments for an election
     * @param electionId The election ID
     * @return Array of vote commitments
     */
    function getElectionVotes(
        uint256 electionId
    ) external view returns (VoteCommitment[] memory) {
        uint256[] memory indices = electionVoteIndices[electionId];
        VoteCommitment[] memory votes = new VoteCommitment[](indices.length);

        for (uint256 i = 0; i < indices.length; ) {
            votes[i] = voteCommitments[indices[i]];
            unchecked {
                ++i;
            }
        }

        return votes;
    }

    /**
     * @notice Get the total number of vote commitments
     * @return The total count
     */
    function getVoteCommitmentCount() external view returns (uint256) {
        return voteCommitments.length;
    }

    /**
     * @notice Get the winning candidate for an election
     * @param electionId The election ID
     * @param candidateCount The number of candidates
     * @return winnerId The winning candidate ID (0 if tie or no votes)
     * @return winnerVotes The number of votes for the winner
     */
    function getWinner(
        uint256 electionId,
        uint256 candidateCount
    ) external view returns (uint256 winnerId, uint256 winnerVotes) {
        for (uint256 i = 1; i <= candidateCount; ) {
            uint256 votes = voteCounts[electionId][i];
            if (votes > winnerVotes) {
                winnerVotes = votes;
                winnerId = i;
            }
            unchecked {
                ++i;
            }
        }
    }
}

