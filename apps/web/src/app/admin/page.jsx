'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Settings,
  Users,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Play,
  StopCircle,
  Shield,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { ElectionStatus } from '@/lib/stores/election-store';

// Mock admin elections
const mockAdminElections = [
  {
    id: 1n,
    title: 'Community Governance 2024',
    status: ElectionStatus.ACTIVE,
    totalVotes: 1234n,
    candidateCount: 3,
    voterCount: 500,
  },
  {
    id: 2n,
    title: 'Protocol Upgrade Proposal',
    status: ElectionStatus.PENDING,
    totalVotes: 0n,
    candidateCount: 2,
    voterCount: 0,
  },
];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isAdmin } = useWalletStore();

  const [elections] = React.useState(mockAdminElections);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newElection, setNewElection] = React.useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: ['', ''],
  });

  // Not connected or not admin
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Wallet Required</h2>
            <p className="mb-6 text-muted-foreground">
              Please connect your wallet to access the admin panel.
            </p>
            <Link href="/">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <Shield className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
            <p className="mb-6 text-muted-foreground">
              Your wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) is not authorized to access
              the admin panel.
            </p>
            <Link href="/">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateElection = () => {
    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Election Created',
      description: 'Your new election has been created successfully.',
      variant: 'success',
    });

    setIsCreateDialogOpen(false);
    setNewElection({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      candidates: ['', ''],
    });
  };

  const addCandidate = () => {
    setNewElection((prev) => ({
      ...prev,
      candidates: [...prev.candidates, ''],
    }));
  };

  const updateCandidate = (index, value) => {
    setNewElection((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c, i) => (i === index ? value : c)),
    }));
  };

  const removeCandidate = (index) => {
    if (newElection.candidates.length > 2) {
      setNewElection((prev) => ({
        ...prev,
        candidates: prev.candidates.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage elections and voters</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="neon" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Election
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Set up a new election with candidates and voting period.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Election Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Community Governance 2024"
                    value={newElection.title}
                    onChange={(e) =>
                      setNewElection((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this election..."
                    value={newElection.description}
                    onChange={(e) =>
                      setNewElection((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newElection.startDate}
                      onChange={(e) =>
                        setNewElection((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newElection.endDate}
                      onChange={(e) =>
                        setNewElection((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Candidates (min. 2)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addCandidate}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {newElection.candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Candidate ${index + 1}`}
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                      />
                      {newElection.candidates.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCandidate(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="neon" onClick={handleCreateElection}>
                  Create Election
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Main content */}
      <Tabs defaultValue="elections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="elections" className="gap-2">
            <Calendar className="h-4 w-4" />
            Elections
          </TabsTrigger>
          <TabsTrigger value="voters" className="gap-2">
            <Users className="h-4 w-4" />
            Voters
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {elections.map((election, index) => (
              <motion.div
                key={election.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          election.status === ElectionStatus.ACTIVE
                            ? 'success'
                            : election.status === ElectionStatus.PENDING
                              ? 'info'
                              : 'secondary'
                        }
                      >
                        {election.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{election.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">
                          {election.totalVotes.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Votes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{election.candidateCount}</p>
                        <p className="text-xs text-muted-foreground">Candidates</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{election.voterCount}</p>
                        <p className="text-xs text-muted-foreground">Voters</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex gap-2">
                      {election.status === ElectionStatus.PENDING && (
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Play className="h-3 w-3" />
                          Start
                        </Button>
                      )}
                      {election.status === ElectionStatus.ACTIVE && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-destructive"
                        >
                          <StopCircle className="h-3 w-3" />
                          End
                        </Button>
                      )}
                      <Link href={`/election/${election.id}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voters">
          <Card>
            <CardHeader>
              <CardTitle>Voter Management</CardTitle>
              <CardDescription>
                Add or remove voters from the identity group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter wallet address to add as voter" />
                  <Button variant="outline">Add Voter</Button>
                </div>

                <Separator />

                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8" />
                  <p>No voters registered yet</p>
                  <p className="text-sm">Add voters to enable them to participate in elections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure your voting system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contract Addresses</Label>
                  <div className="space-y-2 rounded-lg bg-muted p-4 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IdentityRegistry:</span>
                      <span>Not deployed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ElectionManager:</span>
                      <span>Not deployed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BallotStore:</span>
                      <span>Not deployed</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Admin Address</Label>
                  <p className="font-mono text-sm text-muted-foreground">{address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

