'use client';

import * as React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, ChevronDown, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { formatAddress } from '@/lib/utils';
import { sepolia } from '@/lib/wagmi-config';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const { setAddress, setConnected, setChainId, isAdmin } = useWalletStore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Sync wallet state with store
  React.useEffect(() => {
    setAddress(address ?? null);
    setConnected(isConnected);
    setChainId(chainId ?? null);
  }, [address, isConnected, chainId, setAddress, setConnected, setChainId]);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
      setShowDropdown(false);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  const isWrongNetwork = chainId !== sepolia.id;

  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowDropdown(!showDropdown)}
          className="gap-2 dark:neon-border"
        >
          <div className="flex items-center gap-2">
            {isWrongNetwork && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            )}
            {isAdmin && (
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                Admin
              </span>
            )}
            <span className="font-mono">{formatAddress(address)}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border bg-popover p-2 shadow-lg dark:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
              >
                {/* Address */}
                <div className="mb-2 rounded-md bg-muted p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Connected wallet</p>
                  <p className="font-mono text-sm">{formatAddress(address)}</p>
                </div>

                {/* Network warning */}
                {isWrongNetwork && (
                  <div className="mb-2 rounded-md bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                    <p className="mb-2 text-xs">Please switch to Sepolia testnet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwitchNetwork}
                      disabled={isSwitchingChain}
                      className="w-full text-xs"
                    >
                      {isSwitchingChain ? 'Switching...' : 'Switch to Sepolia'}
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-1">
                  <button
                    onClick={handleCopyAddress}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy address'}
                  </button>

                  <a
                    href={`https://sepolia.etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Etherscan
                  </a>

                  <button
                    onClick={handleDisconnect}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="neon" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#0a0a0c]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">Connect your wallet</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Choose your preferred wallet to connect to Cursor Pro Voting.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              onClick={() => {
                connect({ connector });
                setIsOpen(false);
              }}
              disabled={isPending}
              className="w-full justify-start gap-3 py-6 text-left border-2 hover:bg-slate-50 hover:border-slate-400 dark:hover:bg-slate-900 dark:hover:border-primary/60 dark:border-slate-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <ConnectorIcon name={connector.name} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{connector.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {getConnectorDescription(connector.name)}
                </p>
              </div>
            </Button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
          By connecting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ConnectorIcon({ name }) {
  // Simple icon based on connector name
  const lowerName = name.toLowerCase();

  if (lowerName.includes('metamask')) {
    return <span className="text-2xl">🦊</span>;
  }
  if (lowerName.includes('walletconnect')) {
    return <span className="text-2xl">🔗</span>;
  }
  if (lowerName.includes('coinbase')) {
    return <span className="text-2xl">💰</span>;
  }

  return <Wallet className="h-5 w-5" />;
}

function getConnectorDescription(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('metamask')) {
    return 'Connect with MetaMask extension';
  }
  if (lowerName.includes('walletconnect')) {
    return 'Scan QR code with mobile wallet';
  }
  if (lowerName.includes('coinbase')) {
    return 'Connect with Coinbase Wallet';
  }
  if (lowerName.includes('injected')) {
    return 'Connect with browser wallet';
  }

  return 'Connect wallet';
}

