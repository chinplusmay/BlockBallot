// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {ElectionManager} from "../src/ElectionManager.sol";
import {ZKVoteVerifier} from "../src/ZKVoteVerifier.sol";
import {BallotStore} from "../src/BallotStore.sol";

/**
 * @title Deploy
 * @notice Deployment script for Cursor Pro Voting contracts
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ZKVoteVerifier
        ZKVoteVerifier verifier = new ZKVoteVerifier();
        console.log("ZKVoteVerifier deployed at:", address(verifier));

        // 2. Deploy IdentityRegistry
        IdentityRegistry identityRegistry = new IdentityRegistry();
        console.log("IdentityRegistry deployed at:", address(identityRegistry));

        // 3. Deploy BallotStore with verifier
        BallotStore ballotStore = new BallotStore(address(verifier));
        console.log("BallotStore deployed at:", address(ballotStore));

        // 4. Deploy ElectionManager with registry and ballot store
        ElectionManager electionManager = new ElectionManager(
            address(identityRegistry),
            address(ballotStore)
        );
        console.log("ElectionManager deployed at:", address(electionManager));

        // 5. Set up permissions
        // Grant election manager as group admin
        identityRegistry.setGroupAdmin(address(electionManager), true);

        // Grant election manager as vote submitter
        ballotStore.setVoteSubmitter(address(electionManager), true);

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n========== Deployment Summary ==========");
        console.log("Network: Sepolia");
        console.log("ZKVoteVerifier:", address(verifier));
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("BallotStore:", address(ballotStore));
        console.log("ElectionManager:", address(electionManager));
        console.log("=========================================\n");
    }
}

