// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry public registry;
    address public owner = address(this);
    address public admin = address(0x1);
    address public user = address(0x2);

    uint256 constant TREE_DEPTH = 20;
    uint256 constant IDENTITY_COMMITMENT_1 = 123456789;
    uint256 constant IDENTITY_COMMITMENT_2 = 987654321;

    function setUp() public {
        registry = new IdentityRegistry();
    }

    function test_CreateGroup() public {
        uint256 groupId = registry.createGroup(TREE_DEPTH);
        assertEq(groupId, 1);

        IdentityRegistry.Group memory group = registry.getGroup(groupId);
        assertEq(group.id, 1);
        assertEq(group.depth, TREE_DEPTH);
        assertEq(group.memberCount, 0);
        assertTrue(group.exists);
    }

    function test_AddMember() public {
        uint256 groupId = registry.createGroup(TREE_DEPTH);
        registry.addMember(groupId, IDENTITY_COMMITMENT_1);

        assertTrue(registry.verifyMember(groupId, IDENTITY_COMMITMENT_1));
        assertEq(registry.getMemberCount(groupId), 1);
    }

    function test_AddMultipleMembers() public {
        uint256 groupId = registry.createGroup(TREE_DEPTH);

        uint256[] memory commitments = new uint256[](2);
        commitments[0] = IDENTITY_COMMITMENT_1;
        commitments[1] = IDENTITY_COMMITMENT_2;

        registry.addMembers(groupId, commitments);

        assertTrue(registry.verifyMember(groupId, IDENTITY_COMMITMENT_1));
        assertTrue(registry.verifyMember(groupId, IDENTITY_COMMITMENT_2));
        assertEq(registry.getMemberCount(groupId), 2);
    }

    function test_RemoveMember() public {
        uint256 groupId = registry.createGroup(TREE_DEPTH);
        registry.addMember(groupId, IDENTITY_COMMITMENT_1);
        registry.removeMember(groupId, IDENTITY_COMMITMENT_1);

        assertFalse(registry.verifyMember(groupId, IDENTITY_COMMITMENT_1));
    }

    function test_RevertWhen_NonAdminCreatesGroup() public {
        vm.prank(user);
        vm.expectRevert(IdentityRegistry.NotGroupAdmin.selector);
        registry.createGroup(TREE_DEPTH);
    }

    function test_RevertWhen_InvalidDepth() public {
        vm.expectRevert(IdentityRegistry.InvalidDepth.selector);
        registry.createGroup(10); // Too shallow
    }

    function test_RevertWhen_DuplicateMember() public {
        uint256 groupId = registry.createGroup(TREE_DEPTH);
        registry.addMember(groupId, IDENTITY_COMMITMENT_1);

        vm.expectRevert(IdentityRegistry.MemberAlreadyExists.selector);
        registry.addMember(groupId, IDENTITY_COMMITMENT_1);
    }

    function test_SetGroupAdmin() public {
        registry.setGroupAdmin(admin, true);

        vm.prank(admin);
        uint256 groupId = registry.createGroup(TREE_DEPTH);
        assertEq(groupId, 1);
    }

    function testFuzz_AddMember(uint256 commitment) public {
        vm.assume(commitment != 0);

        uint256 groupId = registry.createGroup(TREE_DEPTH);
        registry.addMember(groupId, commitment);

        assertTrue(registry.verifyMember(groupId, commitment));
    }
}

