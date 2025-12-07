#!/bin/bash

# Cursor Pro Voting - Export Solidity Verifier
# Generates a Solidity contract from the proving key

set -e

CIRCUIT_NAME="vote"
BUILD_DIR="build"
CONTRACTS_DIR="../contracts/src/generated"

echo "================================================"
echo "Cursor Pro Voting - Export Verifier"
echo "================================================"

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo "Error: snarkjs is not installed"
    echo "Install with: npm install -g snarkjs"
    exit 1
fi

# Check if final zkey exists
if [ ! -f "${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey" ]; then
    echo "Error: Final zkey not found. Run setup.sh first."
    exit 1
fi

echo ""
echo "Exporting Solidity verifier..."
echo ""

# Create output directory
mkdir -p ${CONTRACTS_DIR}

# Export the verifier contract
snarkjs zkey export solidityverifier \
    ${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey \
    ${CONTRACTS_DIR}/Groth16Verifier.sol

# Update Solidity version in generated contract
sed -i 's/pragma solidity \^0.6.11;/pragma solidity ^0.8.27;/g' \
    ${CONTRACTS_DIR}/Groth16Verifier.sol 2>/dev/null || \
sed -i '' 's/pragma solidity \^0.6.11;/pragma solidity ^0.8.27;/g' \
    ${CONTRACTS_DIR}/Groth16Verifier.sol

echo "Generated: ${CONTRACTS_DIR}/Groth16Verifier.sol"

# Also export call data generator script
echo ""
echo "Creating proof generation helper..."
echo ""

cat > ${BUILD_DIR}/generate_proof.js << 'EOF'
/**
 * Generate a proof for the voting circuit
 * Usage: node generate_proof.js <input.json>
 */

const snarkjs = require("snarkjs");
const fs = require("fs");

async function main() {
    const inputPath = process.argv[2] || "input.json";

    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
    }

    const input = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

    console.log("Generating proof...");

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "vote.wasm",
        "vote_final.zkey"
    );

    console.log("\nProof:", JSON.stringify(proof, null, 2));
    console.log("\nPublic Signals:", publicSignals);

    // Generate Solidity calldata
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    console.log("\nSolidity Calldata:", calldata);

    // Save outputs
    fs.writeFileSync("proof.json", JSON.stringify(proof, null, 2));
    fs.writeFileSync("public.json", JSON.stringify(publicSignals, null, 2));

    console.log("\nSaved: proof.json, public.json");
}

main().catch(console.error);
EOF

echo "Created: ${BUILD_DIR}/generate_proof.js"

echo ""
echo "================================================"
echo "Export complete!"
echo ""
echo "Files generated:"
echo "  - ${CONTRACTS_DIR}/Groth16Verifier.sol"
echo "  - ${BUILD_DIR}/generate_proof.js"
echo ""
echo "Next steps:"
echo "  1. Deploy Groth16Verifier.sol"
echo "  2. Copy vote.wasm and vote_final.zkey to frontend/public/zkp/"
echo "================================================"

