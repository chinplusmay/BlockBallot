// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IdentityRegistry
 * @notice Manages Semaphore identity groups for the voting system
 * @dev Simplified implementation - in production, integrate with Semaphore contracts directly
 */
contract IdentityRegistry is Ownable, ReentrancyGuard {
    // ============ Structs ============

    struct Group {
        uint256 id;
        uint256 depth;
        uint256 root;
        uint256 memberCount;
        bool exists;
    }

    // ============ State Variables ============

    /// @notice Counter for group IDs
    uint256 public groupCount;

    /// @notice Mapping of group ID to Group data
    mapping(uint256 => Group) public groups;

    /// @notice Mapping of group ID to member commitments
    mapping(uint256 => mapping(uint256 => bool)) public isMember;

    /// @notice Mapping of group ID to list of member commitments
    mapping(uint256 => uint256[]) public groupMembers;

    /// @notice Authorized addresses that can manage groups
    mapping(address => bool) public groupAdmins;

    // ============ Events ============

    event GroupCreated(uint256 indexed groupId, uint256 depth, address indexed creator);
    event MemberAdded(uint256 indexed groupId, uint256 indexed identityCommitment, uint256 root);
    event MemberRemoved(uint256 indexed groupId, uint256 indexed identityCommitment, uint256 root);
    event GroupAdminUpdated(address indexed admin, bool status);

    // ============ Errors ============

    error GroupDoesNotExist();
    error GroupAlreadyExists();
    error MemberAlreadyExists();
    error MemberDoesNotExist();
    error NotGroupAdmin();
    error InvalidDepth();
    error InvalidCommitment();

    // ============ Modifiers ============

    modifier onlyGroupAdmin() {
        if (!groupAdmins[msg.sender] && msg.sender != owner()) {
            revert NotGroupAdmin();
        }
        _;
    }

    modifier groupExists(uint256 groupId) {
        if (!groups[groupId].exists) {
            revert GroupDoesNotExist();
        }
        _;
    }

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        groupAdmins[msg.sender] = true;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new identity group
     * @param depth The Merkle tree depth (recommended: 20)
     * @return groupId The ID of the created group
     */
    function createGroup(uint256 depth) external onlyGroupAdmin returns (uint256 groupId) {
        if (depth < 16 || depth > 32) {
            revert InvalidDepth();
        }

        groupId = ++groupCount;

        groups[groupId] = Group({
            id: groupId,
            depth: depth,
            root: 0,
            memberCount: 0,
            exists: true
        });

        emit GroupCreated(groupId, depth, msg.sender);
    }

    /**
     * @notice Add a member to a group
     * @param groupId The group ID
     * @param identityCommitment The member's identity commitment
     */
    function addMember(
        uint256 groupId,
        uint256 identityCommitment
    ) external onlyGroupAdmin groupExists(groupId) nonReentrant {
        if (identityCommitment == 0) {
            revert InvalidCommitment();
        }

        if (isMember[groupId][identityCommitment]) {
            revert MemberAlreadyExists();
        }

        isMember[groupId][identityCommitment] = true;
        groupMembers[groupId].push(identityCommitment);
        groups[groupId].memberCount++;

        // Update root (simplified - in production use actual Merkle tree)
        uint256 newRoot = _computeRoot(groupId);
        groups[groupId].root = newRoot;

        emit MemberAdded(groupId, identityCommitment, newRoot);
    }

    /**
     * @notice Add multiple members to a group
     * @param groupId The group ID
     * @param identityCommitments Array of identity commitments
     */
    function addMembers(
        uint256 groupId,
        uint256[] calldata identityCommitments
    ) external onlyGroupAdmin groupExists(groupId) nonReentrant {
        uint256 length = identityCommitments.length;

        for (uint256 i = 0; i < length; ) {
            uint256 commitment = identityCommitments[i];

            if (commitment == 0) {
                revert InvalidCommitment();
            }

            if (!isMember[groupId][commitment]) {
                isMember[groupId][commitment] = true;
                groupMembers[groupId].push(commitment);
                groups[groupId].memberCount++;

                emit MemberAdded(groupId, commitment, 0); // Root updated at end
            }

            unchecked {
                ++i;
            }
        }

        // Update root once after all additions
        uint256 newRoot = _computeRoot(groupId);
        groups[groupId].root = newRoot;
    }

    /**
     * @notice Remove a member from a group
     * @param groupId The group ID
     * @param identityCommitment The member's identity commitment
     */
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment
    ) external onlyGroupAdmin groupExists(groupId) nonReentrant {
        if (!isMember[groupId][identityCommitment]) {
            revert MemberDoesNotExist();
        }

        isMember[groupId][identityCommitment] = false;
        groups[groupId].memberCount--;

        // Update root
        uint256 newRoot = _computeRoot(groupId);
        groups[groupId].root = newRoot;

        emit MemberRemoved(groupId, identityCommitment, newRoot);
    }

    /**
     * @notice Set group admin status
     * @param admin The address to update
     * @param status Whether the address should be an admin
     */
    function setGroupAdmin(address admin, bool status) external onlyOwner {
        groupAdmins[admin] = status;
        emit GroupAdminUpdated(admin, status);
    }

    // ============ View Functions ============

    /**
     * @notice Check if an identity commitment is a member of a group
     * @param groupId The group ID
     * @param identityCommitment The identity commitment to check
     * @return True if the commitment is a member
     */
    function verifyMember(
        uint256 groupId,
        uint256 identityCommitment
    ) external view groupExists(groupId) returns (bool) {
        return isMember[groupId][identityCommitment];
    }

    /**
     * @notice Get the Merkle root of a group
     * @param groupId The group ID
     * @return The current Merkle root
     */
    function getRoot(uint256 groupId) external view groupExists(groupId) returns (uint256) {
        return groups[groupId].root;
    }

    /**
     * @notice Get the member count of a group
     * @param groupId The group ID
     * @return The number of members
     */
    function getMemberCount(uint256 groupId) external view groupExists(groupId) returns (uint256) {
        return groups[groupId].memberCount;
    }

    /**
     * @notice Get all members of a group
     * @param groupId The group ID
     * @return Array of identity commitments
     */
    function getGroupMembers(
        uint256 groupId
    ) external view groupExists(groupId) returns (uint256[] memory) {
        return groupMembers[groupId];
    }

    /**
     * @notice Get group details
     * @param groupId The group ID
     * @return Group data
     */
    function getGroup(uint256 groupId) external view groupExists(groupId) returns (Group memory) {
        return groups[groupId];
    }

    // ============ Internal Functions ============

    /**
     * @dev Compute a simplified Merkle root
     * @notice In production, use proper Poseidon hashing and Merkle tree
     */
    function _computeRoot(uint256 groupId) internal view returns (uint256) {
        uint256[] memory members = groupMembers[groupId];
        uint256 length = members.length;

        if (length == 0) return 0;

        // Simplified root computation - in production use Poseidon Merkle tree
        uint256 root = members[0];
        for (uint256 i = 1; i < length; ) {
            root = uint256(keccak256(abi.encodePacked(root, members[i])));
            unchecked {
                ++i;
            }
        }

        return root;
    }
}

