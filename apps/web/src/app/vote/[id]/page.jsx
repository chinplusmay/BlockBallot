'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Vote,
  CheckCircle,
  Loader2,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useAccount, useSignMessage, useSwitchChain, useChainId } from 'wagmi';
import { sepolia } from '@/lib/wagmi-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  ProofGenerationStep,
  stepDescriptions,
  useZKPStore,
} from '@/lib/stores/zkp-store';
import { cn } from '@/lib/utils';

// Mock election data
const getMockElection = (id) => ({
  id: BigInt(id),
  title: 'Community Governance 2024',
  description: 'Vote for the next community representatives',
  candidates: [
    { id: 1, name: 'Alice Chen', description: 'Platform lead with 5 years of experience' },
    { id: 2, name: 'Bob Smith', description: 'Technical advisor for smart contract security' },
    { id: 3, name: 'Carol Davis', description: 'Community manager with Web3 expertise' },
  ],
});

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id;

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [election] = React.useState(() => getMockElection(electionId));
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [isVoting, setIsVoting] = React.useState(false);
  const [voteComplete, setVoteComplete] = React.useState(false);

  const { currentStep, progress, error, reset: resetZKP } = useZKPStore();

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedCandidate || !isConnected || !address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and select a candidate',
        variant: 'destructive',
      });
      return;
    }

    // Check if on correct network
    if (chainId !== sepolia.id) {
      try {
        await switchChain({ chainId: sepolia.id });
        // Wait a moment for chain switch to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to switch network';
        toast({
          title: 'Network Error',
          description: errorMessage.includes('not configured') 
            ? 'Sepolia network not available. Please add Sepolia testnet manually in your wallet settings, then try again.'
            : 'Please switch to Sepolia testnet to vote. You can use the "Switch to Sepolia" button in your wallet dropdown.',
          variant: 'destructive',
        });
        setIsVoting(false);
        return;
      }
    }

    setIsVoting(true);
    resetZKP();

    try {
      const zkpStore = useZKPStore.getState();

      // Step 1: Loading circuit
      zkpStore.setStep(ProofGenerationStep.LOADING_CIRCUIT);
      zkpStore.setProgress(10);
      await simulateStep(1000);

      // Step 2: Generate identity
      zkpStore.setStep(ProofGenerationStep.GENERATING_IDENTITY);
      zkpStore.setProgress(30);

      // Sign message to create identity
      await signMessageAsync({
        message: `Sign this message to create your Cursor Pro Voting identity.\n\nAddress: ${address}\nElection: ${electionId}`,
      });
      await simulateStep(500);

      // Step 3: Compute Merkle proof
      zkpStore.setStep(ProofGenerationStep.COMPUTING_MERKLE);
      zkpStore.setProgress(50);
      await simulateStep(800);

      // Step 4: Generate ZK proof
      zkpStore.setStep(ProofGenerationStep.GENERATING_PROOF);
      zkpStore.setProgress(70);
      await simulateStep(2000);

      // Step 5: Submit to blockchain
      zkpStore.setStep(ProofGenerationStep.SUBMITTING);
      zkpStore.setProgress(90);
      await simulateStep(1500);

      // Complete
      zkpStore.setStep(ProofGenerationStep.COMPLETE);
      zkpStore.setProgress(100);
      setVoteComplete(true);

      toast({
        title: 'Vote Submitted!',
        description: 'Your anonymous vote has been recorded on the blockchain.',
        variant: 'success',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
      useZKPStore.getState().setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  // Simulate async step for demo
  const simulateStep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Wallet Required</h2>
            <p className="mb-6 text-muted-foreground">
              Please connect your wallet to cast your vote.
            </p>
            <Link href="/">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (voteComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md"
        >
          <Card className="text-center dark:neon-border">
            <CardContent className="py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary dark:neon-text" />
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold">Vote Submitted!</h2>
              <p className="mb-6 text-muted-foreground">
                Your anonymous vote has been recorded on the blockchain. Thank you for participating!
              </p>
              <div className="space-y-3">
                <Link href={`/election/${electionId}`}>
                  <Button variant="neon" className="w-full">
                    View Results
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Elections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href={`/election/${electionId}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Election
          </Button>
        </Link>
      </motion.div>

      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <Badge variant="neon" className="mb-4">
              Private Vote
            </Badge>
            <h1 className="mb-2 text-3xl font-bold">{election.title}</h1>
            <p className="text-muted-foreground">{election.description}</p>
          </div>

          {/* Candidate selection */}
          <AnimatePresence mode="wait">
            {!isVoting ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h2 className="mb-4 text-lg font-semibold">Select your candidate:</h2>

                {election.candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary/50',
                        selectedCandidate === candidate.id &&
                          'border-primary ring-2 ring-primary ring-offset-2 dark:neon-border'
                      )}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                            selectedCandidate === candidate.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          )}
                        >
                          {selectedCandidate === candidate.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-primary-foreground"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <div className="pt-6">
                  <Button
                    variant="neon"
                    size="xl"
                    className="w-full gap-2"
                    onClick={handleVote}
                    disabled={!selectedCandidate}
                  >
                    <Vote className="h-5 w-5" />
                    Submit Anonymous Vote
                  </Button>
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Your vote will be encrypted with zero-knowledge proofs
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="dark:neon-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Zero-Knowledge Proof
                    </CardTitle>
                    <CardDescription>
                      This process ensures your vote remains completely private
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress bar */}
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{stepDescriptions[currentStep]}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {/* Step indicators */}
                    <div className="space-y-3">
                      {[
                        ProofGenerationStep.LOADING_CIRCUIT,
                        ProofGenerationStep.GENERATING_IDENTITY,
                        ProofGenerationStep.COMPUTING_MERKLE,
                        ProofGenerationStep.GENERATING_PROOF,
                        ProofGenerationStep.SUBMITTING,
                      ].map((step, index) => {
                        const stepIndex = [
                          ProofGenerationStep.LOADING_CIRCUIT,
                          ProofGenerationStep.GENERATING_IDENTITY,
                          ProofGenerationStep.COMPUTING_MERKLE,
                          ProofGenerationStep.GENERATING_PROOF,
                          ProofGenerationStep.SUBMITTING,
                        ].indexOf(currentStep);

                        const isComplete = index < stepIndex;
                        const isCurrent = step === currentStep;

                        return (
                          <div
                            key={step}
                            className={cn(
                              'flex items-center gap-3 rounded-lg p-3 transition-colors',
                              isCurrent && 'bg-primary/10',
                              isComplete && 'text-muted-foreground'
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : isCurrent ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted" />
                            )}
                            <span className="text-sm">{stepDescriptions[step]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Error display */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

