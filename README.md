# Jumpa: Unified Autonomous Finance Interface

> **Jumpa** is a premium, high-performance wallet built that combines the power of **Claude 4.5 Sonnet** with a **Multi-Chain Architecture (Solana, Base, Stellar)** to create a seamless, agent-native financial ecosystem.

---

## Tracks

Jumpa is engineered to push the boundaries of high-performance consumer coordination across three core frontiers:

- **AI & Robotics**: Features a deeply integrated **3rike AI** assistant powered by **Claude 4.5 Sonnet**. The interface parses complex natural language intent (e.g., *"Send 5 SOL to @Ola"*, *"Swap all my USDC for SOL"*) into precise on-chain execution payloads.
- **Crypto & Economic Systems**: Native, first-class support for **Solana, Base, and Stellar**. Includes a bespoke **Smart Trade** engine integrated with **Jupiter Aggregator** for real-time liquidity probing and high-efficiency Solana token swaps with minimal slippage.
- **Infrastructure & Digital Rights**: Implements a **Sovereign Security** model. Users maintain total control over their encrypted mnemonic phrases and private keys, secured by a local-first **AES-256-GCM** encryption layer locked with a 6-digit PIN.

---

## ⚡ Tech Stack: Next-Gen Performance

| Layer | Technology | Highlights |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Server-side rendering & optimized API route handlers |
| **Frontend** | **React 19** | Concurrent rendering & ultra-fast state synchronization |
| **Styling** | **Tailwind CSS v4** | Next-generation utility-first CSS engine |
| **Logic/AI** | **Claude 4.5 Sonnet** | Advanced multi-turn intent parsing and autonomous coordination |
| **Web3** | **Multi-Chain** | Reliable, high-speed on-chain settlement layers (Solana, Base, Stellar) |
| **Database** | **MongoDB** | High-performance document storage for sessions & histories |
| **Auth** | **Better-Auth** | Secure, modern authentication with social & passkey support |

---

## 📋 Project Structure

```text
jumpa-website/
├── app/                          # Next.js App Router (Next.js 16)
│   ├── api/                      # API Endpoints
│   │   ├── ai/                   # AI intent & multi-turn history
│   │   ├── auth/                 # Session & authentication management
│   │   ├── wallet/               # Multi-chain operations & live balances
│   │   └── pin/                  # PIN-secured cryptographic verification
│   ├── (auth)/                   # Authentication Pages (Login, Recovery)
│   ├── (home)/                   # Protected Dashboard & Feature Routes
│   │   ├── dashboard/            # Multi-chain wallet overview
│   │   ├── 3rike-ai/             # Dedicated AI assistant interface
│   │   ├── airtime/              # Airtime top-up flow
│   │   ├── savings/              # Target-based savings & goal tracking
│   │   └── ...                   # Loans, Investments, Group Splits, Verification
│   └── layout.tsx                # Root layout with global context providers
├── components/                   # High-fidelity React components
│   ├── common/                   # Global UI (TopBar, Nav, Themes)
│   ├── modal/                    # Seamless overlays, sheets, and drawers
│   └── ui/                       # Atomic primitives (shadcn/ui style)
├── lib/                          # Application logic layers
│   ├── api.ts                    # Type-safe frontend API client
│   ├── wallet.ts                 # Multi-chain derivation & transaction signing
│   ├── crypto.ts                 # AES-256-GCM sovereign encryption
│   └── withAuth.ts               # Authenticated route middleware
├── models/                       # Mongoose data schemas (Wallet, Transaction, Log)
└── public/                       # Static assets (Iconography, Locales, Brand)
```

---

## 🔒 Security & Digital Rights

Jumpa is built on the principle of **User Sovereignty**:
- **BIP39 Seed Phrases**: Users generate their own standard 12-word mnemonic phrases.
- **PIN-Secured Encryption**: Phrases are never stored in plain text. They are encrypted using **AES-256-GCM** on the client-side, using a secret derived from the user's 6-digit PIN.
- **Decryption on Demand**: Sensitive operations (e.g., signing a transaction, revealing private keys) happen in a temporary, PIN-verified context.

---

## ⚡ Key Capabilities

### 1. 3rike AI: Autonomous Agent
- **Natural Language Parsing**: Direct conversion of text or voice intent into structured JSON payloads for Multi-Chain operations.
- **Focus Blur Interaction**: Implements a premium UI pattern where the background blurs during AI interaction to focus user attention on the decision layer.
- **Persistent Context**: Uses MongoDB to maintain multi-turn chat memory, allowing for complex follow-up commands like *"now swaphalf of that for USDC"*.

### 2. Smart Execution: Multi-Chain
- **Real-time Settlement**: Low-latency transaction finality on Solana, Base, and Stellar networks.
- **Liquidity Probing**: Automated quotes from **Jupiter Aggregator**, ensuring the best rates across the Solana ecosystem.
- **Unified Assets**: One interface for manageable assets across SOL, BASE-ETH, XLM, and USDC ecosystems.

### 3. Integrated Financial Dashboards
- **Savings & Goals**: Full CRUD support for personal financial targets with real-time progress tracking.
- **Group Finance**: Smart coordination for splitting bills and shared expenses.
- **Loan & Investments**: Streamlined interfaces for non-custodial lending and asset growth.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_uri

# LLM Intelligence (Claude 4.5 Sonnet)
ANTHROPIC_API_KEY=your_key

# Unified Authentication (Better-Auth)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000

# Blockchain Connectors
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

### 3. Development

```bash
npm run dev
```

The application will launch on `http://localhost:3000`.
