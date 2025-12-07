/**
 * Contract Verification Script
 * Verifies deployed contracts on Etherscan
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const IDENTITY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS;
const ELECTION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_ELECTION_MANAGER_ADDRESS;
const BALLOT_STORE_ADDRESS = process.env.NEXT_PUBLIC_BALLOT_STORE_ADDRESS;

interface ContractInfo {
  name: string;
  address: string | undefined;
  constructorArgs?: string[];
}

const contracts: ContractInfo[] = [
  {
    name: 'IdentityRegistry',
    address: IDENTITY_REGISTRY_ADDRESS,
    constructorArgs: [],
  },
  {
    name: 'ElectionManager',
    address: ELECTION_MANAGER_ADDRESS,
    constructorArgs: [IDENTITY_REGISTRY_ADDRESS, BALLOT_STORE_ADDRESS],
  },
  {
    name: 'BallotStore',
    address: BALLOT_STORE_ADDRESS,
    constructorArgs: [],
  },
];

async function main() {
  console.log('================================================');
  console.log('Contract Verification');
  console.log('================================================\n');

  if (!ETHERSCAN_API_KEY) {
    console.warn('Warning: ETHERSCAN_API_KEY not set');
    console.log('Verification will not work without API key\n');
  }

  console.log('Contracts to verify:');
  console.log('--------------------\n');

  for (const contract of contracts) {
    console.log(`${contract.name}:`);

    if (!contract.address) {
      console.log('  Address: NOT DEPLOYED');
    } else {
      console.log(`  Address: ${contract.address}`);
      console.log(`  Etherscan: https://sepolia.etherscan.io/address/${contract.address}`);

      if (contract.constructorArgs && contract.constructorArgs.length > 0) {
        console.log(`  Constructor Args: ${contract.constructorArgs.join(', ')}`);
      }
    }
    console.log('');
  }

  console.log('Verification Commands:');
  console.log('----------------------\n');

  console.log('Using Foundry (recommended):');
  console.log('  cd contracts');
  console.log('  forge verify-contract <ADDRESS> src/<Contract>.sol:<Contract> --chain sepolia\n');

  console.log('Using Hardhat:');
  console.log('  npx hardhat verify --network sepolia <ADDRESS> <CONSTRUCTOR_ARGS>\n');

  console.log('================================================');
}

main().catch(console.error);



