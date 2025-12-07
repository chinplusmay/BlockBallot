#!/bin/bash

# Cursor Pro Voting - Circuit Compilation Script
# Compiles the voting circuit using Circom 2.1+

set -e

CIRCUIT_NAME="vote"
CIRCUIT_PATH="src/${CIRCUIT_NAME}.circom"
BUILD_DIR="build"

echo "================================================"
echo "Cursor Pro Voting - Circuit Compilation"
echo "================================================"

# Create build directory
mkdir -p ${BUILD_DIR}

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "Error: circom is not installed"
    echo "Please install from: https://docs.circom.io/getting-started/installation/"
    exit 1
fi

echo ""
echo "Step 1: Compiling circuit..."
echo "Circuit: ${CIRCUIT_PATH}"
echo ""

# Compile the circuit
# --wasm: Generate WASM for browser proving
# --r1cs: Generate R1CS constraint system
# --sym: Generate symbol file for debugging
# --O1: Optimization level (balance between speed and size)
circom ${CIRCUIT_PATH} \
    --wasm \
    --r1cs \
    --sym \
    --O1 \
    -o ${BUILD_DIR}

echo ""
echo "Compilation complete!"
echo ""
echo "Generated files:"
echo "  - ${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo "  - ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs"
echo "  - ${BUILD_DIR}/${CIRCUIT_NAME}.sym"

# Move WASM to build root for easier access
if [ -f "${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" ]; then
    cp ${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ${BUILD_DIR}/${CIRCUIT_NAME}.wasm
    echo ""
    echo "Copied WASM to ${BUILD_DIR}/${CIRCUIT_NAME}.wasm"
fi

# Display circuit info
echo ""
echo "Circuit Information:"
snarkjs r1cs info ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs 2>/dev/null || echo "(Install snarkjs for detailed info)"

echo ""
echo "================================================"
echo "Compilation successful!"
echo "Next step: Run ./scripts/setup.sh for trusted setup"
echo "================================================"

