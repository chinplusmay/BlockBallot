# Cursor Pro Voting - Smart Contracts

Solidity smart contracts for the ZK-powered voting system.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 20+

## Installation

```bash
# Install Foundry dependencies
forge install

# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0

# Install Semaphore contracts
forge install semaphore-protocol/semaphore
```

## Build

```bash
forge build
```

## Test

```bash
forge test
```

## Test with verbosity

```bash
forge test -vvv
```

## Gas Report

```bash
forge test --gas-report
```

## Deploy to Sepolia

```bash
# Set environment variables
export SEPOLIA_RPC_URL="your_rpc_url"
export DEPLOYER_PRIVATE_KEY="your_private_key"

# Deploy
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## Contract Addresses (Sepolia)

After deployment, update these addresses:

- IdentityRegistry: `0x...`
- ElectionManager: `0x...`
- ZKVoteVerifier: `0x...`
- BallotStore: `0x...`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ElectionManager                          │
│  - Creates/manages elections                                 │
│  - Coordinates between contracts                             │
└─────────────────┬─────────────────────┬────────────────────┘
                  │                     │
                  ▼                     ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   IdentityRegistry      │  │      BallotStore        │
│  - Semaphore groups     │  │  - Vote commitments     │
│  - Member management    │  │  - Result tallying      │
└─────────────────────────┘  └───────────┬─────────────┘
                                         │
                                         ▼
                             ┌─────────────────────────┐
                             │    ZKVoteVerifier       │
                             │  - Proof verification   │
                             │  - Nullifier tracking   │
                             └─────────────────────────┘
```

