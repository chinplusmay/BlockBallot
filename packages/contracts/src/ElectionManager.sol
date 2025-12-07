// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";
import {IBallotStore} from "./interfaces/IBallotStore.sol";

/**
 * @title ElectionManager
 * @notice Manages the lifecycle of elections
 * @dev Central contract for creating and managing voting elections
 */
contract ElectionManager is Ownable, ReentrancyGuard {
    // ============ Enums ============

    enum ElectionStatus {
        PENDING,
        ACTIVE,
        ENDED,
        CANCELLED
    }

    // ============ Structs ============

    struct Candidate {
        uint256 id;
        string name;
        string description;
        bool exists;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 groupId;
        uint256 candidateCount;
        ElectionStatus status;
        address creator;
        bool exists;
    }

    // ============ State Variables ============

    /// @notice Counter for election IDs
    uint256 public electionCount;

    /// @notice Identity registry contract
    IIdentityRegistry public identityRegistry;

    /// @notice Ballot store contract
    IBallotStore public ballotStore;

    /// @notice Mapping of election ID to Election data
    mapping(uint256 => Election) public elections;

    /// @notice Mapping of election ID to candidate ID to Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;

    /// @notice Authorized election creators
    mapping(address => bool) public electionCreators;

    // ============ Events ============

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime,
        uint256 groupId,
        address indexed creator
    );

    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name
    );

    event ElectionStarted(uint256 indexed electionId, uint256 timestamp);
    event ElectionEnded(uint256 indexed electionId, uint256 timestamp);
    event ElectionCancelled(uint256 indexed electionId, uint256 timestamp);
    event ElectionCreatorUpdated(address indexed creator, bool status);

    // ============ Errors ============

    error ElectionDoesNotExist();
    error ElectionNotPending();
    error ElectionNotActive();
    error ElectionAlreadyStarted();
    error ElectionAlreadyEnded();
    error InvalidTimeRange();
    error InvalidCandidate();
    error NotElectionCreator();
    error CandidateDoesNotExist();
    error TooFewCandidates();
    error StartTimeNotReached();
    error EndTimeNotReached();

    // ============ Modifiers ============

    modifier onlyElectionCreator() {
        if (!electionCreators[msg.sender] && msg.sender != owner()) {
            revert NotElectionCreator();
        }
        _;
    }

    modifier electionExists(uint256 electionId) {
        if (!elections[electionId].exists) {
            revert ElectionDoesNotExist();
        }
        _;
    }

    // ============ Constructor ============

    constructor(address _identityRegistry, address _ballotStore) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        ballotStore = IBallotStore(_ballotStore);
        electionCreators[msg.sender] = true;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new election
     * @param title The election title
     * @param description The election description
     * @param startTime Unix timestamp when voting starts
     * @param endTime Unix timestamp when voting ends
     * @param groupId The identity group ID for eligible voters
     * @return electionId The ID of the created election
     */
    function createElection(
        string calldata title,
        string calldata description,
        uint256 startTime,
        uint256 endTime,
        uint256 groupId
    ) external onlyElectionCreator returns (uint256 electionId) {
        if (startTime >= endTime) {
            revert InvalidTimeRange();
        }

        if (startTime < block.timestamp) {
            revert InvalidTimeRange();
        }

        electionId = ++electionCount;

        elections[electionId] = Election({
            id: electionId,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            groupId: groupId,
            candidateCount: 0,
            status: ElectionStatus.PENDING,
            creator: msg.sender,
            exists: true
        });

        emit ElectionCreated(electionId, title, startTime, endTime, groupId, msg.sender);
    }

    /**
     * @notice Add a candidate to an election
     * @param electionId The election ID
     * @param name The candidate's name
     * @param description The candidate's description
     * @return candidateId The ID of the added candidate
     */
    function addCandidate(
        uint256 electionId,
        string calldata name,
        string calldata description
    ) external electionExists(electionId) returns (uint256 candidateId) {
        Election storage election = elections[electionId];

        if (election.status != ElectionStatus.PENDING) {
            revert ElectionNotPending();
        }

        if (msg.sender != election.creator && msg.sender != owner()) {
            revert NotElectionCreator();
        }

        candidateId = ++election.candidateCount;

        candidates[electionId][candidateId] = Candidate({
            id: candidateId,
            name: name,
            description: description,
            exists: true
        });

        emit CandidateAdded(electionId, candidateId, name);
    }

    /**
     * @notice Start an election (make it active for voting)
     * @param electionId The election ID
     */
    function startElection(uint256 electionId) external electionExists(electionId) {
        Election storage election = elections[electionId];

        if (election.status != ElectionStatus.PENDING) {
            revert ElectionNotPending();
        }

        if (election.candidateCount < 2) {
            revert TooFewCandidates();
        }

        if (block.timestamp < election.startTime) {
            revert StartTimeNotReached();
        }

        election.status = ElectionStatus.ACTIVE;

        emit ElectionStarted(electionId, block.timestamp);
    }

    /**
     * @notice End an election
     * @param electionId The election ID
     */
    function endElection(uint256 electionId) external electionExists(electionId) {
        Election storage election = elections[electionId];

        if (election.status != ElectionStatus.ACTIVE) {
            revert ElectionNotActive();
        }

        if (block.timestamp < election.endTime) {
            // Allow owner to force end, but others must wait
            if (msg.sender != owner() && msg.sender != election.creator) {
                revert EndTimeNotReached();
            }
        }

        election.status = ElectionStatus.ENDED;

        emit ElectionEnded(electionId, block.timestamp);
    }

    /**
     * @notice Cancel an election
     * @param electionId The election ID
     */
    function cancelElection(uint256 electionId) external electionExists(electionId) {
        Election storage election = elections[electionId];

        if (msg.sender != election.creator && msg.sender != owner()) {
            revert NotElectionCreator();
        }

        if (election.status == ElectionStatus.ENDED) {
            revert ElectionAlreadyEnded();
        }

        election.status = ElectionStatus.CANCELLED;

        emit ElectionCancelled(electionId, block.timestamp);
    }

    /**
     * @notice Set election creator status
     * @param creator The address to update
     * @param status Whether the address can create elections
     */
    function setElectionCreator(address creator, bool status) external onlyOwner {
        electionCreators[creator] = status;
        emit ElectionCreatorUpdated(creator, status);
    }

    /**
     * @notice Update contract references
     * @param _identityRegistry New identity registry address
     * @param _ballotStore New ballot store address
     */
    function updateContracts(
        address _identityRegistry,
        address _ballotStore
    ) external onlyOwner {
        if (_identityRegistry != address(0)) {
            identityRegistry = IIdentityRegistry(_identityRegistry);
        }
        if (_ballotStore != address(0)) {
            ballotStore = IBallotStore(_ballotStore);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get election details
     * @param electionId The election ID
     * @return Election data
     */
    function getElection(
        uint256 electionId
    ) external view electionExists(electionId) returns (Election memory) {
        return elections[electionId];
    }

    /**
     * @notice Get candidate details
     * @param electionId The election ID
     * @param candidateId The candidate ID
     * @return Candidate data
     */
    function getCandidate(
        uint256 electionId,
        uint256 candidateId
    ) external view electionExists(electionId) returns (Candidate memory) {
        Candidate memory candidate = candidates[electionId][candidateId];
        if (!candidate.exists) {
            revert CandidateDoesNotExist();
        }
        return candidate;
    }

    /**
     * @notice Get all candidates for an election
     * @param electionId The election ID
     * @return Array of candidates
     */
    function getCandidates(
        uint256 electionId
    ) external view electionExists(electionId) returns (Candidate[] memory) {
        uint256 count = elections[electionId].candidateCount;
        Candidate[] memory result = new Candidate[](count);

        for (uint256 i = 1; i <= count; ) {
            result[i - 1] = candidates[electionId][i];
            unchecked {
                ++i;
            }
        }

        return result;
    }

    /**
     * @notice Check if an election is currently active
     * @param electionId The election ID
     * @return True if the election is active
     */
    function isElectionActive(
        uint256 electionId
    ) external view electionExists(electionId) returns (bool) {
        Election memory election = elections[electionId];
        return election.status == ElectionStatus.ACTIVE &&
               block.timestamp >= election.startTime &&
               block.timestamp <= election.endTime;
    }

    /**
     * @notice Get current election status based on time
     * @param electionId The election ID
     * @return The effective status
     */
    function getEffectiveStatus(
        uint256 electionId
    ) external view electionExists(electionId) returns (ElectionStatus) {
        Election memory election = elections[electionId];

        if (election.status == ElectionStatus.CANCELLED) {
            return ElectionStatus.CANCELLED;
        }

        if (election.status == ElectionStatus.ENDED) {
            return ElectionStatus.ENDED;
        }

        if (block.timestamp < election.startTime) {
            return ElectionStatus.PENDING;
        }

        if (block.timestamp > election.endTime) {
            return ElectionStatus.ENDED;
        }

        return ElectionStatus.ACTIVE;
    }
}

