// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IIdentityRegistry
 * @notice Interface for the identity registry contract
 */
interface IIdentityRegistry {
    struct Group {
        uint256 id;
        uint256 depth;
        uint256 root;
        uint256 memberCount;
        bool exists;
    }

    function createGroup(uint256 depth) external returns (uint256 groupId);
    function addMember(uint256 groupId, uint256 identityCommitment) external;
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external;
    function removeMember(uint256 groupId, uint256 identityCommitment) external;
    function verifyMember(uint256 groupId, uint256 identityCommitment) external view returns (bool);
    function getRoot(uint256 groupId) external view returns (uint256);
    function getMemberCount(uint256 groupId) external view returns (uint256);
    function getGroupMembers(uint256 groupId) external view returns (uint256[] memory);
    function getGroup(uint256 groupId) external view returns (Group memory);
}

