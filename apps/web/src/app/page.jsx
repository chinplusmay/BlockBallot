'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Vote, Shield, Eye, Zap, ArrowRight, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { ElectionStatus, useElectionStore } from '@/lib/stores/election-store';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Mock elections for demo
const mockElections = [
  {
    id: 1n,
    title: 'Community Governance 2024',
    description: 'Vote for the next community representatives',
    startTime: Math.floor(Date.now() / 1000) - 3600,
    endTime: Math.floor(Date.now() / 1000) + 86400,
    totalVotes: 1234n,
    status: ElectionStatus.ACTIVE,
    candidates: [
      { id: 1, name: 'Alice Chen', description: 'Platform lead', voteCount: 523n },
      { id: 2, name: 'Bob Smith', description: 'Tech advisor', voteCount: 411n },
      { id: 3, name: 'Carol Davis', description: 'Community manager', voteCount: 300n },
    ],
  },
  {
    id: 2n,
    title: 'Protocol Upgrade Proposal',
    description: 'Vote on the next protocol version features',
    startTime: Math.floor(Date.now() / 1000) + 86400,
    endTime: Math.floor(Date.now() / 1000) + 172800,
    totalVotes: 0n,
    status: ElectionStatus.PENDING,
    candidates: [],
  },
  {
    id: 3n,
    title: 'Treasury Allocation Q4',
    description: 'Decide on Q4 treasury fund allocation',
    startTime: Math.floor(Date.now() / 1000) - 172800,
    endTime: Math.floor(Date.now() / 1000) - 86400,
    totalVotes: 2847n,
    status: ElectionStatus.ENDED,
    candidates: [],
  },
];

const features = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Privacy',
    description: 'Your vote is completely private. ZKP ensures nobody can link your identity to your choice.',
  },
  {
    icon: Eye,
    title: 'Transparent Results',
    description: 'All votes are verified on-chain. Anyone can audit the results while maintaining voter privacy.',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Votes are verified in seconds using Semaphore circuits. No waiting, no uncertainty.',
  },
];

export default function HomePage() {
  const { isConnected, isAdmin } = useWalletStore();
  const { setElections } = useElectionStore();

  // Load mock elections on mount
  React.useEffect(() => {
    setElections(mockElections);
  }, [setElections]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 gradient-mesh" />
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-50" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="neon" className="px-4 py-1.5 text-sm">
              Powered by Semaphore ZKP
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            <span className="text-foreground">Vote with </span>
            <span className="bg-gradient-to-r from-primary via-[#00d4ff] to-[#bf00ff] bg-clip-text text-transparent dark:text-[#00d4ff] dark:drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
              Complete Privacy
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            The next generation of blockchain voting. Cast your vote anonymously with
            zero-knowledge proofs while maintaining full transparency and verifiability.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="#elections">
              <Button size="xl" variant="neon" className="gap-2">
                Browse Elections
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button size="xl" variant="outline" className="gap-2">
                  Create Election
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-8"
          >
            {[
              { value: '100%', label: 'Private Votes' },
              { value: '0', label: 'Trust Required' },
              { value: '∞', label: 'Verifiable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary dark:neon-text md:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Why Zero-Knowledge Voting?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Traditional voting systems compromise either privacy or transparency.
            Our ZKP-powered system delivers both.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full transition-transform hover:scale-[1.02]">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:neon-glow">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Elections Section */}
      <section id="elections" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">Active Elections</h2>
            <p className="text-muted-foreground">
              Browse and participate in ongoing elections
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline">Create New</Button>
            </Link>
          )}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockElections.map((election, index) => (
            <motion.div
              key={election.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ElectionCard election={election} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center dark:neon-border md:p-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Vote Privately?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Connect your wallet to start participating in secure, private, and
            verifiable elections.
          </p>
          {!isConnected ? (
            <p className="text-sm text-muted-foreground">
              Click "Connect Wallet" in the header to get started
            </p>
          ) : (
            <Link href="#elections">
              <Button size="xl" variant="neon">
                View Elections
              </Button>
            </Link>
          )}
        </motion.div>
      </section>
    </div>
  );
}

function ElectionCard({ election }) {
  const statusConfig = {
    [ElectionStatus.PENDING]: {
      label: 'Upcoming',
      variant: 'info',
      icon: Clock,
    },
    [ElectionStatus.ACTIVE]: {
      label: 'Active',
      variant: 'success',
      icon: Vote,
    },
    [ElectionStatus.ENDED]: {
      label: 'Ended',
      variant: 'secondary',
      icon: CheckCircle,
    },
  };

  const config = statusConfig[election.status];

  return (
    <Card className="group h-full overflow-hidden">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant={config.variant} className="gap-1">
            <config.icon className="h-3 w-3" />
            {config.label}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {election.totalVotes.toString()}
          </div>
        </div>
        <CardTitle className="line-clamp-1">{election.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {election.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={
            election.status === ElectionStatus.ACTIVE
              ? `/vote/${election.id}`
              : `/election/${election.id}`
          }
        >
          <Button
            variant={election.status === ElectionStatus.ACTIVE ? 'neon' : 'outline'}
            className="w-full gap-2"
          >
            {election.status === ElectionStatus.ACTIVE ? (
              <>
                Vote Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              'View Details'
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

