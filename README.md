# BlockBallot

A free-to-use, privacy-preserving voting dApp built with Zero-Knowledge Proofs (ZKP) and Ethereum. Cast your vote anonymously while maintaining full transparency and verifiability on the blockchain.

## ✨ Features

- 🔒 **Complete Privacy** - Zero-Knowledge Proofs ensure your vote remains anonymous
- 🔗 **Blockchain Transparency** - All votes are verifiable on-chain
- 🌓 **Dual Theme** - Dark (default) and Light modes
- 💼 **Multi-Wallet Support** - Connect with MetaMask, Coinbase Wallet, or WalletConnect
- ⚡ **Modern Stack** - Next.js 15, React 19, Tailwind CSS v4
- 🛡️ **Semaphore Protocol** - Industry-standard ZK voting implementation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4.0 (Beta) + Shadcn/UI
- **State Management**: Zustand
- **Web3**: Wagmi v2 + Viem + TanStack Query
- **ZK Proofs**: SnarkJS (browser-side)

### Smart Contracts
- **Language**: Solidity 0.8.27
- **Framework**: Foundry (Forge)

### Zero-Knowledge Circuits
- **Framework**: Circom 2.1
- **Protocol**: Semaphore

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Foundry** (for smart contracts) ([Installation Guide](https://book.getfoundry.sh/getting-started/installation))
- **Circom** 2.1+ (for ZK circuits) ([Installation Guide](https://docs.circom.io/getting-started/installation/))

### Optional but Recommended
- **MetaMask** or another Web3 wallet browser extension
- **Alchemy Account** (for RPC endpoints) ([Sign up](https://www.alchemy.com/))
- **WalletConnect Project ID** (for WalletConnect support) ([Get free ID](https://cloud.walletconnect.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/chinplusmay/BlockBallot
cd BlockBallot
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your configuration:

```env
# Wallet Connect - Get free project ID at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Alchemy - Get free API key at https://www.alchemy.com
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Sepolia RPC URL (can use Alchemy or other provider)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key

# Deployer private key (DO NOT commit real keys!)
DEPLOYER_PRIVATE_KEY=0x_your_private_key_here

# Contract addresses (filled after deployment)
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=
NEXT_PUBLIC_ELECTION_MANAGER_ADDRESS=
NEXT_PUBLIC_BALLOT_STORE_ADDRESS=

# Admin wallet address
NEXT_PUBLIC_ADMIN_ADDRESS=
```

**Important Notes:**
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is optional but recommended for WalletConnect support
- If you don't provide WalletConnect Project ID, only MetaMask and injected wallets will be available
- Never commit your `.env.local` file to version control

### 4. Start Development Server

```bash
# From the root directory
pnpm dev

# Or navigate to the web app
cd apps/web
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
BlockBallot/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   └── lib/         # Utilities, stores, ZKP logic
│       ├── public/          # Static assets
│       └── .env.local       # Environment variables (create this)
├── packages/
│   ├── contracts/           # Solidity smart contracts (Foundry)
│   └── circuits/            # Circom ZK circuits
├── scripts/                 # Utility scripts
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

## 🎮 Available Scripts

### Root Level

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format

# Check code formatting
pnpm format:check

# Build smart contracts
pnpm contracts:build

# Test smart contracts
pnpm contracts:test

# Compile ZK circuits
pnpm circuits:compile

# Clean all build artifacts
pnpm clean
```

### Web App (`apps/web`)

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Clean build artifacts
pnpm clean
```

## 🔧 Configuration

### WalletConnect Setup (Optional)

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Add it to `apps/web/.env.local` as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

### Alchemy Setup (Recommended)

1. Visit [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app on Sepolia testnet
4. Copy your API key
5. Add it to `apps/web/.env.local` as `NEXT_PUBLIC_ALCHEMY_API_KEY`
6. Use the RPC URL in `SEPOLIA_RPC_URL`

### Network Configuration

The app is configured to work with **Sepolia Testnet** by default. Make sure:

1. Your wallet is connected to Sepolia Testnet
2. You have Sepolia ETH for gas fees (get free testnet ETH from [faucets](https://sepoliafaucet.com/))
3. The app will automatically prompt you to switch networks if needed

## 🎨 Theming

The app supports two themes:

- **Dark Mode** (Default) - Black background (#09090b) with Neon Blue accents
- **Light Mode** - Clean white background with Slate accents

Toggle between themes using the theme toggle button in the header.

## 🐛 Troubleshooting

### "Project ID Not Configured" Error

- This is expected if you haven't set up WalletConnect
- The app will still work with MetaMask and other injected wallets
- To enable WalletConnect, add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` to your `.env.local`

### "Chain not configured" Error

- Make sure your wallet is connected to Sepolia Testnet
- The app will prompt you to switch networks automatically
- If the switch fails, manually switch to Sepolia in your wallet

### Dialog/Modal Not Visible

- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check browser console for errors

### Build Errors

- Clear the `.next` directory: `rm -rf apps/web/.next`
- Reinstall dependencies: `pnpm install`
- Check Node.js version: `node --version` (should be >= 20.0.0)

### Wallet Connection Issues

- Make sure you have a Web3 wallet installed (MetaMask recommended)
- Check that the wallet is unlocked
- Try disconnecting and reconnecting
- Clear browser cache and reload

## 📝 Development Workflow

1. **Frontend Development**: Work in `apps/web/src/`
2. **Smart Contracts**: Work in `packages/contracts/`
3. **ZK Circuits**: Work in `packages/circuits/`

### Adding New Components

Components should be placed in `apps/web/src/components/`. UI components from Shadcn/UI are in `apps/web/src/components/ui/`.

### State Management

Global state is managed with Zustand. Store files are in `apps/web/src/lib/stores/`.

## 🔐 Security Notes

- **Never commit** `.env.local` or any file containing private keys
- Use testnet private keys only for development
- Never share your private keys
- The app uses testnet by default - do not use mainnet without proper security audits

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Semaphore Protocol](https://semaphore.appliedzkp.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Circom Documentation](https://docs.circom.io/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Semaphore Protocol](https://semaphore.appliedzkp.org/) for ZK proofs
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Web3 integration powered by [Wagmi](https://wagmi.sh/) and [Viem](https://viem.sh/)

---

**Note**: This is a development version. Smart contracts and ZK circuits are still being implemented. Use on testnet only.
