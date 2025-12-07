import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get WalletConnect project ID from environment
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Get Alchemy API key for RPC
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';

// Configure chains with custom RPC
const sepoliaRpc = alchemyApiKey
  ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
  : 'https://rpc.sepolia.org';

// Build connectors array conditionally
// Start with injected (MetaMask, browser wallets) - always available
const connectors = [injected()];

// Only add Coinbase Wallet and WalletConnect if project ID is configured
// Both require WalletConnect infrastructure
if (walletConnectProjectId && walletConnectProjectId.trim() !== '') {
  connectors.push(
    coinbaseWallet({
      appName: 'Cursor Pro Voting',
      appLogoUrl: 'https://cursorprovoting.app/icon.png',
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'Cursor Pro Voting',
        description: 'Blockchain Voting with Zero-Knowledge Proofs',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://cursorprovoting.app',
        icons: ['https://cursorprovoting.app/icon.png'],
      },
      showQrModal: true,
      // Additional options to prevent session issues
      enableEIP6963: true,
      enableCoinbase: false, // We're adding Coinbase separately
    })
  );
}

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(sepoliaRpc),
  },
  ssr: true,
});

// Export chain for convenience
export { sepolia };

// Contract addresses (filled after deployment)
export const contractAddresses = {
  identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS,
  electionManager: process.env.NEXT_PUBLIC_ELECTION_MANAGER_ADDRESS,
  ballotStore: process.env.NEXT_PUBLIC_BALLOT_STORE_ADDRESS,
};

// Admin address
export const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
