# Cursor Pro Voting - ZK Circuits

Zero-knowledge circuits for private voting using Circom and Semaphore.

## Prerequisites

- [Circom 2.1+](https://docs.circom.io/getting-started/installation/)
- [snarkjs](https://github.com/iden3/snarkjs)
- Node.js 20+

## Installation

```bash
# Install Circom (if not already installed)
# See: https://docs.circom.io/getting-started/installation/

# Install dependencies
pnpm install
```

## Circuit Structure

```
circuits/
├── src/
│   └── vote.circom        # Main voting circuit
├── build/
│   ├── vote.wasm          # WASM for browser proving
│   ├── vote.r1cs          # R1CS constraint system
│   └── vote_final.zkey    # Proving key
├── scripts/
│   ├── compile.sh         # Compile circuit
│   ├── setup.sh           # Trusted setup
│   └── export-verifier.sh # Export Solidity verifier
└── package.json
```

## Build Process

### 1. Compile the Circuit

```bash
./scripts/compile.sh
```

This generates:
- `build/vote.r1cs` - Constraint system
- `build/vote.wasm` - WASM for in-browser proving
- `build/vote.sym` - Symbol file for debugging

### 2. Trusted Setup

```bash
./scripts/setup.sh
```

This uses the Powers of Tau ceremony to generate:
- `build/vote_0000.zkey` - Initial proving key
- `build/vote_final.zkey` - Final proving key (after contribution)
- `build/verification_key.json` - Verification key

**Note**: For production, use Semaphore's pre-generated trusted setup files.

### 3. Export Verifier

```bash
./scripts/export-verifier.sh
```

This generates a Solidity verifier contract that can be used on-chain.

## Circuit Details

The voting circuit extends Semaphore's identity verification with ballot selection:

### Inputs (Private)
- `identityNullifier` - Part of the identity secret
- `identityTrapdoor` - Part of the identity secret
- `treeSiblings[20]` - Merkle tree proof siblings
- `treePathIndices[20]` - Merkle tree path indices

### Inputs (Public)
- `merkleRoot` - The Merkle root of the identity group
- `externalNullifier` - Election ID (prevents cross-election replay)
- `signalHash` - Hash of the vote (candidate ID)

### Outputs
- `nullifierHash` - Unique per election, prevents double voting

## Using Pre-built Semaphore Circuits

For production, we recommend using Semaphore's pre-built circuits:

```bash
# Download Semaphore circuits
npx @semaphore-protocol/cli download --output ./build
```

This provides:
- Pre-compiled WASM files
- Trusted setup from multi-party ceremony
- Audited and battle-tested circuits

## Integration

Copy the following files to your frontend's `public/zkp/` directory:
- `build/vote.wasm`
- `build/vote_final.zkey`

The frontend ZKP utilities will lazy-load these files for in-browser proof generation.

