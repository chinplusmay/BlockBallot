#!/bin/bash

# Cursor Pro Voting - Trusted Setup Script
# Performs the Powers of Tau ceremony and generates proving keys

set -e

CIRCUIT_NAME="vote"
BUILD_DIR="build"
PTAU_SIZE=15  # 2^15 = 32768 constraints (adjust if circuit is larger)

echo "================================================"
echo "Cursor Pro Voting - Trusted Setup"
echo "================================================"

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo "Error: snarkjs is not installed"
    echo "Install with: npm install -g snarkjs"
    exit 1
fi

# Check if R1CS exists
if [ ! -f "${BUILD_DIR}/${CIRCUIT_NAME}.r1cs" ]; then
    echo "Error: R1CS file not found. Run compile.sh first."
    exit 1
fi

echo ""
echo "Step 1: Powers of Tau ceremony..."
echo ""

# Check if we already have ptau file
PTAU_FILE="${BUILD_DIR}/pot${PTAU_SIZE}_final.ptau"

if [ ! -f "${PTAU_FILE}" ]; then
    echo "Downloading Powers of Tau file..."
    # Use Hermez's pre-computed Powers of Tau
    curl -L -o ${PTAU_FILE} \
        https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${PTAU_SIZE}.ptau

    echo "Downloaded ${PTAU_FILE}"
else
    echo "Using existing Powers of Tau file: ${PTAU_FILE}"
fi

echo ""
echo "Step 2: Generate initial zkey..."
echo ""

snarkjs groth16 setup \
    ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs \
    ${PTAU_FILE} \
    ${BUILD_DIR}/${CIRCUIT_NAME}_0000.zkey

echo ""
echo "Step 3: Contribute to the ceremony..."
echo ""

# Add a contribution (in production, this would be multi-party)
snarkjs zkey contribute \
    ${BUILD_DIR}/${CIRCUIT_NAME}_0000.zkey \
    ${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey \
    --name="Cursor Pro Voting Contribution" \
    -v -e="$(head -c 64 /dev/urandom | xxd -p -c 256)"

echo ""
echo "Step 4: Export verification key..."
echo ""

snarkjs zkey export verificationkey \
    ${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey \
    ${BUILD_DIR}/verification_key.json

echo ""
echo "Step 5: Verify the final zkey..."
echo ""

snarkjs zkey verify \
    ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs \
    ${PTAU_FILE} \
    ${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey

# Clean up intermediate files
rm -f ${BUILD_DIR}/${CIRCUIT_NAME}_0000.zkey

echo ""
echo "================================================"
echo "Trusted setup complete!"
echo ""
echo "Generated files:"
echo "  - ${BUILD_DIR}/${CIRCUIT_NAME}_final.zkey (proving key)"
echo "  - ${BUILD_DIR}/verification_key.json"
echo ""
echo "Next step: Run ./scripts/export-verifier.sh"
echo "================================================"

