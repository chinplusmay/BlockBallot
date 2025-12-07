/**
 * Contract Deployment Script
 * Deploys all voting contracts to Sepolia testnet
 */

import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

if (!DEPLOYER_PRIVATE_KEY) {
  console.error('Error: DEPLOYER_PRIVATE_KEY not set');
  process.exit(1);
}

async function main() {
  console.log('================================================');
  console.log('Cursor Pro Voting - Contract Deployment');
  console.log('================================================\n');

  // Create clients
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

  console.log(`Deployer address: ${account.address}`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${Number(balance) / 1e18} ETH\n`);

  if (balance < parseEther('0.01')) {
    console.error('Error: Insufficient balance for deployment');
    console.log('Get testnet ETH from: https://sepoliafaucet.com/');
    process.exit(1);
  }

  console.log('Note: For actual deployment, use Foundry script:');
  console.log('  cd contracts');
  console.log('  forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify\n');

  console.log('This script is for verification and pre-deployment checks.');
  console.log('================================================');
}

main().catch(console.error);


