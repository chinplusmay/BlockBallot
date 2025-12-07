/**
 * Test Data Generator
 * Creates mock elections and test data for development
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

interface Candidate {
  id: number;
  name: string;
  description: string;
}

interface Election {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  candidates: Candidate[];
  status: 'pending' | 'active' | 'ended';
}

function generateTestElections(): Election[] {
  const now = Math.floor(Date.now() / 1000);
  const DAY = 86400;

  return [
    {
      id: 1,
      title: 'Community Governance 2024',
      description: 'Vote for the next community representatives who will guide our protocol development and community initiatives.',
      startTime: now - DAY,
      endTime: now + DAY * 7,
      status: 'active',
      candidates: [
        {
          id: 1,
          name: 'Alice Chen',
          description: 'Platform lead with 5 years of experience in DeFi governance',
        },
        {
          id: 2,
          name: 'Bob Smith',
          description: 'Technical advisor specializing in smart contract security',
        },
        {
          id: 3,
          name: 'Carol Davis',
          description: 'Community manager with proven track record in Web3 projects',
        },
      ],
    },
    {
      id: 2,
      title: 'Protocol Upgrade Proposal v2.0',
      description: 'Vote on the next major protocol upgrade features including improved gas efficiency and new staking mechanisms.',
      startTime: now + DAY * 3,
      endTime: now + DAY * 10,
      status: 'pending',
      candidates: [
        {
          id: 1,
          name: 'Option A: Full Upgrade',
          description: 'Complete protocol overhaul with all proposed features',
        },
        {
          id: 2,
          name: 'Option B: Incremental',
          description: 'Phased rollout starting with gas optimizations',
        },
      ],
    },
    {
      id: 3,
      title: 'Treasury Allocation Q4 2024',
      description: 'Decide on the allocation of Q4 treasury funds across development, marketing, and grants.',
      startTime: now - DAY * 14,
      endTime: now - DAY * 7,
      status: 'ended',
      candidates: [
        {
          id: 1,
          name: 'Development Focus',
          description: '60% development, 25% marketing, 15% grants',
        },
        {
          id: 2,
          name: 'Balanced Approach',
          description: '40% development, 35% marketing, 25% grants',
        },
        {
          id: 3,
          name: 'Community Growth',
          description: '35% development, 30% marketing, 35% grants',
        },
      ],
    },
  ];
}

function generateMockVoters(count: number): string[] {
  const voters: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate mock identity commitments
    const commitment = BigInt(
      '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
    );
    voters.push(commitment.toString());
  }
  return voters;
}

async function main() {
  console.log('================================================');
  console.log('Test Data Generator');
  console.log('================================================\n');

  const elections = generateTestElections();

  console.log('Generated Elections:');
  console.log('-------------------');

  for (const election of elections) {
    console.log(`\n[${election.id}] ${election.title}`);
    console.log(`    Status: ${election.status}`);
    console.log(`    Candidates: ${election.candidates.length}`);
    console.log(`    Start: ${new Date(election.startTime * 1000).toISOString()}`);
    console.log(`    End: ${new Date(election.endTime * 1000).toISOString()}`);
  }

  const mockVoters = generateMockVoters(10);

  console.log('\n\nGenerated Mock Voters (Identity Commitments):');
  console.log('----------------------------------------------');
  mockVoters.forEach((voter, i) => {
    console.log(`  ${i + 1}. ${voter.slice(0, 20)}...`);
  });

  // Output as JSON for easy copy-paste
  console.log('\n\nJSON Output:');
  console.log('------------');

  const output = {
    elections,
    mockVoters,
    generatedAt: new Date().toISOString(),
  };

  console.log(JSON.stringify(output, null, 2));

  console.log('\n================================================');
  console.log('Test data generated successfully!');
  console.log('================================================');
}

main().catch(console.error);


