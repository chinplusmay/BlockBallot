/**
 * Semaphore Setup Script
 * Initializes a Semaphore identity group for voting
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const IDENTITY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS;

// ABI for IdentityRegistry
const IDENTITY_REGISTRY_ABI = [
  {
    name: 'createGroup',
    type: 'function',
    inputs: [{ name: 'depth', type: 'uint256' }],
    outputs: [{ name: 'groupId', type: 'uint256' }],
  },
  {
    name: 'addMember',
    type: 'function',
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'identityCommitment', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'groupCount',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

async function main() {
  console.log('================================================');
  console.log('Semaphore Group Setup');
  console.log('================================================\n');

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error('Error: DEPLOYER_PRIVATE_KEY not set');
    process.exit(1);
  }

  if (!IDENTITY_REGISTRY_ADDRESS) {
    console.error('Error: NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS not set');
    console.log('Deploy contracts first, then set the address in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY as `0x${string}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL),
  });

  console.log(`Using account: ${account.address}`);
  console.log(`Identity Registry: ${IDENTITY_REGISTRY_ADDRESS}\n`);

  // Get current group count
  const groupCount = await publicClient.readContract({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'groupCount',
  });

  console.log(`Current group count: ${groupCount}`);

  // Create a new group
  console.log('\nCreating new Semaphore group with depth 20...');

  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'createGroup',
    args: [20n], // Tree depth of 20
  });

  console.log(`Transaction hash: ${hash}`);

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

  // Get new group count
  const newGroupCount = await publicClient.readContract({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'groupCount',
  });

  console.log(`\nNew group created with ID: ${newGroupCount}`);
  console.log('================================================');
}

main().catch(console.error);


