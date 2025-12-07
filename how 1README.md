[1mdiff --cc README.md[m
[1mindex 4726609,dd9eb72..0000000[m
[1m--- a/README.md[m
[1m+++ b/README.md[m
[36m@@@ -1,299 -1,2 +1,0 @@@[m
[31m--# BlockBallot[m
[31m- [m
[31m- A free-to-use, privacy-preserving voting dApp built with Zero-Knowledge Proofs (ZKP) and Ethereum. Cast your vote anonymously while maintaining full transparency and verifiability on the blockchain.[m
[31m- [m
[31m- ## ✨ Features[m
[31m- [m
[31m- - 🔒 **Complete Privacy** - Zero-Knowledge Proofs ensure your vote remains anonymous[m
[31m- - 🔗 **Blockchain Transparency** - All votes are verifiable on-chain[m
[31m- - 🌓 **Dual Theme** - Dark (default) and Light modes[m
[31m- - 💼 **Multi-Wallet Support** - Connect with MetaMask, Coinbase Wallet, or WalletConnect[m
[31m- - ⚡ **Modern Stack** - Next.js 15, React 19, Tailwind CSS v4[m
[31m- - 🛡️ **Semaphore Protocol** - Industry-standard ZK voting implementation[m
[31m- [m
[31m- ## 🛠️ Tech Stack[m
[31m- [m
[31m- ### Frontend[m
[31m- - **Framework**: Next.js 15 (App Router)[m
[31m- - **UI Library**: React 19[m
[31m- - **Styling**: Tailwind CSS v4.0 (Beta) + Shadcn/UI[m
[31m- - **State Management**: Zustand[m
[31m- - **Web3**: Wagmi v2 + Viem + TanStack Query[m
[31m- - **ZK Proofs**: SnarkJS (browser-side)[m
[31m- [m
[31m- ### Smart Contracts[m
[31m- - **Language**: Solidity 0.8.27[m
[31m- - **Framework**: Foundry (Forge)[m
[31m- [m
[31m- ### Zero-Knowledge Circuits[m
[31m- - **Framework**: Circom 2.1[m
[31m- - **Protocol**: Semaphore[m
[31m- [m
[31m- ## 📋 Prerequisites[m
[31m- [m
[31m- Before you begin, ensure you have the following installed:[m
[31m- [m
[31m- - **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))[m
[31m- - **pnpm** >= 9.0.0 ([Installation Guide](https://pnpm.io/installation))[m
[31m- - **Foundry** (for smart contracts) ([Installation Guide](https://book.getfoundry.sh/getting-started/installation))[m
[31m- - **Circom** 2.1+ (for ZK circuits) ([Installation Guide](https://docs.circom.io/getting-started/installation/))[m
[31m- [m
[31m- ### Optional but Recommended[m
[31m- - **MetaMask** or another Web3 wallet browser extension[m
[31m- - **Alchemy Account** (for RPC endpoints) ([Sign up](https://www.alchemy.com/))[m
[31m- - **WalletConnect Project ID** (for WalletConnect support) ([Get free ID](https://cloud.walletconnect.com/))[m
[31m- [m
[31m- ## 🚀 Quick Start[m
[31m- [m
[31m- ### 1. Clone the Repository[m
[31m- [m
[31m- ```bash[m
[31m- git clone <your-repo-url>[m
[31m- cd BlockBallot[m
[31m- ```[m
[31m- [m
[31m- ### 2. Install Dependencies[m
[31m- [m
[31m- ```bash[m
[31m- # Install all workspace dependencies[m
[31m- pnpm install[m
[31m- ```[m
[31m- [m
[31m- ### 3. Set Up Environment Variables[m
[31m- [m
[31m- Copy the example environment file and fill in your values:[m
[31m- [m
[31m- ```bash[m
[31m- cp env.example apps/web/.env.local[m
[31m- ```[m
[31m- [m
[31m- Edit `apps/web/.env.local` with your configuration:[m
[31m- [m
[31m- ```env[m
[31m- # Wallet Connect - Get free project ID at https://cloud.walletconnect.com[m
[31m- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here[m
[31m- [m
[31m- # Alchemy - Get free API key at https://www.alchemy.com[m
[31m- NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here[m
[31m- [m
[31m- # Sepolia RPC URL (can use Alchemy or other provider)[m
[31m- SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key[m
[31m- [m
[31m- # Deployer private key (DO NOT commit real keys!)[m
[31m- DEPLOYER_PRIVATE_KEY=0x_your_private_key_here[m
[31m- [m
[31m- # Contract addresses (filled after deployment)[m
[31m- NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=[m
[31m- NEXT_PUBLIC_ELECTION_MANAGER_ADDRESS=[m
[31m- NEXT_PUBLIC_BALLOT_STORE_ADDRESS=[m
[31m- [m
[31m- # Admin wallet address[m
[31m- NEXT_PUBLIC_ADMIN_ADDRESS=[m
[31m- ```[m
[31m- [m
[31m- **Important Notes:**[m
[31m- - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is optional but recommended for WalletConnect support[m
[31m- - If you don't provide WalletConnect Project ID, only MetaMask and injected wallets will be available[m
[31m- - Never commit your `.env.local` file to version control[m
[31m- [m
[31m- ### 4. Start Development Server[m
[31m- [m
[31m- ```bash[m
[31m- # From the root directory[m
[31m- pnpm dev[m
[31m- [m
[31m- # Or navigate to the web app[m
[31m- cd apps/web[m
[31m- pnpm dev[m
[31m- ```[m
[31m- [m
[31m- The application will be available at [http://localhost:3000](http://localhost:3000)[m
[31m- [m
[31m- ## 📁 Project Structure[m
[31m- [m
[31m- ```[m
[31m- BlockBallot/[m
[31m- ├── apps/[m
[31m- │   └── web/                 # Next.js frontend application[m
[31m- │       ├── src/[m
[31m- │       │   ├── app/         # App Router pages[m
[31m- │       │   ├── components/  # React components[m
[31m- │       │   ├── hooks/       # Custom React hooks[m
[31m- │       │   └── lib/         # Utilities, stores, ZKP logic[m
[31m- │       ├── public/          # Static assets[m
[31m- │       └── .env.local       # Environment variables (create this)[m
[31m- ├── packages/[m
[31m- │   ├── contracts/           # Solidity smart contracts (Foundry)[m
[31m- │   └── circuits/            # Circom ZK circuits[m
[31m- ├── scripts/                 # Utility scripts[m
[31m- ├── package.json             # Root workspace config[m
[31m- └── pnpm-workspace.yaml      # pnpm workspace configuration[m
[31m- ```[m
[31m- [m
[31m- ## 🎮 Available Scripts[m
[31m- [m
[31m- ### Root Level[m
[31m- [m
[31m- ```bash[m
[31m- # Start development server[m
[31m- pnpm dev[m
[31m- [m
[31m- # Build for production[m
[31m- pnpm build[m
[31m- [m
[31m- # Run linter[m
[31m- pnpm lint[m
[31m- [m
[31m- # Format code[m
[31m- pnpm format[m
[31m- [m
[31m- # Check code formatting[m
[31m- pnpm format:check[m
[31m- [m
[31m- # Build smart contracts[m
[31m- pnpm contracts:build[m
[31m- [m
[31m- # Test smart contracts[m
[31m- pnpm contracts:test[m
[31m- [m
[31m- # Compile ZK circuits[m
[31m- pnpm circuits:compile[m
[31m- [m
[31m- # Clean all build artifacts[m
[31m- pnpm clean[m
[31m- ```[m
[31m- [m
[31m- ### Web App (`apps/web`)[m
[31m- [m
[31m- ```bash[m
[31m- # Development server[m
[31m- pnpm dev[m
[31m- [m
[31m- # Production build[m
[31m- pnpm build[m
[31m- [m
[31m- # Start production server[m
[31m- pnpm start[m
[31m- [m
[31m- # Run linter[m
[31m- pnpm lint[m
[31m- [m
[31m- # Clean build artifacts[m
[31m- pnpm clean[m
[31m- ```[m
[31m- [m
[31m- ## 🔧 Configuration[m
[31m- [m
[31m- ### WalletConnect Setup (Optional)[m
[31m- [m
[31m- 1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)[m
[31m- 2. Create a free account[m
[31m- 3. Create a new project[m
[31m- 4. Copy your Project ID[m
[31m- 5. Add it to `apps/web/.env.local` as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`[m
[31m- [m
[31m- ### Alchemy Setup (Recommended)[m
[31m- [m
[31m- 1. Visit [Alchemy](https://www.alchemy.com/)[m
[31m- 2. Create a free account[m
[31m- 3. Create a new app on Sepolia testnet[m
[31m- 4. Copy your API key[m
[31m- 5. Add it to `apps/web/.env.local` as `NEXT_PUBLIC_ALCHEMY_API_KEY`[m
[31m- 6. Use the RPC URL in `SEPOLIA_RPC_URL`[m
[31m- [m
[31m- ### Network Configuration[m
[31m- [m
[31m- The app is configured to work with **Sepolia Testnet** by default. Make sure:[m
[31m- [m
[31m- 1. Your wallet is connected to Sepolia Testnet[m
[31m- 2. You have Sepolia ETH for gas fees (get free testnet ETH from [faucets](https://sepoliafaucet.com/))[m
[31m- 3. The app will automatically prompt you to switch networks if needed[m
[31m- [m
[31m- ## 🎨 Theming[m
[31m- [m
[31m- The app supports two themes:[m
[31m- [m
[31m- - **Dark Mode** (Default) - Black background (#09090b) with Neon Blue accents[m
[31m- - **Light Mode** - Clean white background with Slate accents[m
[31m- [m
[31m- Toggle between themes using the theme toggle button in the header.[m
[31m- [m
[31m- ## 🐛 Troubleshooting[m
[31m- [m
[31m- ### "Project ID Not Configured" Error[m
[31m- [m
[31m- - This is expected if you haven't set up WalletConnect[m
[31m- - The app will still work with MetaMask and other injected wallets[m
[31m- - To enable WalletConnect, add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` to your `.env.local`[m
[31m- [m
[31m- ### "Chain not configured" Error[m
[31m- [m
[31m- - Make sure your wallet is connected to Sepolia Testnet[m
[31m- - The app will prompt you to switch networks automatically[m
[31m- - If the switch fails, manually switch to Sepolia in your wallet[m
[31m- [m
[31m- ### Dialog/Modal Not Visible[m
[31m- [m
[31m- - Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)[m
[31m- - Clear browser cache[m
[31m- - Check browser console for errors[m
[31m- [m
[31m- ### Build Errors[m
[31m- [m
[31m- - Clear the `.next` directory: `rm -rf apps/web/.next`[m
[31m- - Reinstall dependencies: `pnpm install`[m
[31m- - Check Node.js version: `node --version` (should be >= 20.0.0)[m
[31m- [m
[31m- ### Wallet Connection Issues[m
[31m- [m
[31m- - Make sure you have a Web3 wallet installed (MetaMask recommended)[m
[31m- - Check that the wallet is unlocked[m
[31m- - Try disconnecting and reconnecting[m
[31m- - Clear browser cache and reload[m
[31m- [m
[31m- ## 📝 Development Workflow[m
[31m- [m
[31m- 1. **Frontend Development**: Work in `apps/web/src/`[m
[31m- 2. **Smart Contracts**: Work in `packages/contracts/`[m
[31m- 3. **ZK Circuits**: Work in `packages/circuits/`[m
[31m- [m
[31m- ### Adding New Components[m
[31m- [m
[31m- Components should be placed in `apps/web/src/components/`. UI components from Shadcn/UI are in `apps/web/src/components/ui/`.[m
[31m- [m
[31m- ### State Management[m
[31m- [m
[31m- Global state is managed with Zustand. Store files are in `apps/web/src/lib/stores/`.[m
[31m- [m
[31m- ## 🔐 Security Notes[m
[31m- [m
[31m- - **Never commit** `.env.local` or any file containing private keys[m
[31m- - Use testnet private keys only for development[m
[31m- - Never share your private keys[m
[31m- - The app uses testnet by default - do not use mainnet without proper security audits[m
[31m- [m
[31m- ## 📚 Learn More[m
[31m- [m
[31m- - [Next.js Documentation](https://nextjs.org/docs)[m
[31m- - [Wagmi Documentation](https://wagmi.sh/)[m
[31m- - [Semaphore Protocol](https://semaphore.appliedzkp.org/)[m
[31m- - [Foundry Book](https://book.getfoundry.sh/)[m
[31m- - [Circom Documentation](https://docs.circom.io/)[m
[31m- [m
[31m- ## 🤝 Contributing[m
[31m- [m
[31m- Contributions are welcome! Please feel free to submit a Pull Request.[m
[31m- [m
[31m- ## 📄 License[m
[31m- [m
[31m- This project is open source and available under the MIT License.[m
[31m- [m
[31m- ## 🙏 Acknowledgments[m
[31m- [m
[31m- - Built with [Semaphore Protocol](https://semaphore.appliedzkp.org/) for ZK proofs[m
[31m- - UI components from [Shadcn/UI](https://ui.shadcn.com/)[m
[31m- - Web3 integration powered by [Wagmi](https://wagmi.sh/) and [Viem](https://viem.sh/)[m
[31m- [m
[31m- ---[m
[31m- [m
[31m- **Note**: This is a development version. Smart contracts and ZK circuits are still being implemented. Use on testnet only.[m
[31m -Blockchain voting dApp with Zero-Knowledge Proofs (ZKP)[m
