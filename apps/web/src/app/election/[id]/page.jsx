'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Vote,
  Trophy,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ElectionStatus } from '@/lib/stores/election-store';
import { formatTimeRemaining, formatDate } from '@/lib/utils';

// Mock election data
const getMockElection = (id) => ({
  id: BigInt(id),
  title: 'Community Governance 2024',
  description:
    'Vote for the next community representatives who will guide our protocol development and community initiatives for the upcoming year.',
  startTime: Math.floor(Date.now() / 1000) - 3600,
  endTime: Math.floor(Date.now() / 1000) + 86400,
  totalVotes: 1234n,
  status: ElectionStatus.ACTIVE,
  groupId: 1n,
  isActive: true,
  candidates: [
    {
      id: 1,
      name: 'Alice Chen',
      description: 'Platform lead with 5 years of experience in DeFi governance',
      voteCount: 523n,
    },
    {
      id: 2,
      name: 'Bob Smith',
      description: 'Technical advisor specializing in smart contract security',
      voteCount: 411n,
    },
    {
      id: 3,
      name: 'Carol Davis',
      description: 'Community manager with proven track record in Web3 projects',
      voteCount: 300n,
    },
  ],
});

export default function ElectionPage() {
  const params = useParams();
  const electionId = params.id;

  const [election] = React.useState(() => getMockElection(electionId));
  const [timeRemaining, setTimeRemaining] = React.useState('');

  // Update countdown timer
  React.useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(election.endTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [election.endTime]);

  const totalVotes = election.candidates.reduce(
    (sum, c) => sum + c.voteCount,
    0n
  );

  const statusConfig = {
    [ElectionStatus.PENDING]: { label: 'Upcoming', variant: 'info' },
    [ElectionStatus.ACTIVE]: { label: 'Active', variant: 'success' },
    [ElectionStatus.ENDED]: { label: 'Ended', variant: 'secondary' },
  };

  const config = statusConfig[election.status];

  // Sort candidates by vote count
  const sortedCandidates = [...election.candidates].sort(
    (a, b) => Number(b.voteCount - a.voteCount)
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: election.title,
        text: election.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Elections
          </Button>
        </Link>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant={config.variant} className="text-sm">
                  {config.label}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {totalVotes.toString()} votes
                </div>
              </div>

              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                {election.title}
              </h1>

              <p className="text-lg text-muted-foreground">
                {election.description}
              </p>
            </div>

            <Separator className="my-8" />

            {/* Candidates */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Candidates</h2>

              {sortedCandidates.map((candidate, index) => {
                const percentage =
                  totalVotes > 0n
                    ? Number((candidate.voteCount * 100n) / totalVotes)
                    : 0;

                const isLeading = index === 0 && totalVotes > 0n;

                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={
                        isLeading
                          ? 'border-primary/50 dark:neon-border'
                          : ''
                      }
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {isLeading && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Trophy className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {candidate.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {candidate.voteCount.toString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <Progress value={percentage} className="h-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Timer card */}
            <Card className="dark:neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary dark:neon-text">
                  {timeRemaining}
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Started</span>
                    <span>{formatDate(election.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ends</span>
                    <span>{formatDate(election.endTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Actions card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {election.status === ElectionStatus.ACTIVE && (
                    <Link href={`/vote/${election.id}`} className="block">
                      <Button variant="neon" className="w-full gap-2">
                        <Vote className="h-4 w-4" />
                        Cast Your Vote
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Election
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full gap-2"
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_ELECTION_MANAGER_ADDRESS}`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Info card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About ZK Voting</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Your vote is protected by zero-knowledge proofs. This means
                  your choice remains completely private while still being
                  verifiable on the blockchain.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

