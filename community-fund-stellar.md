# Jumpa: Premium chat native multi chain Wallet & DeFi Gateway

*   **Project Name**: JUMPA
*   **Submission Track**: Build Award (Integration Track)
*   **Submission Category**: End User Application
*   **Requested Budget**: $79,700
*   **Website**: [https://jumpa.xyz](https://jumpa.xyz)

***

## Architecture and Integration Document

## What Jumpa Is

Jumpa is a multichain stablecoin wallet built for everyday users globally. It is already live and in use at **jumpa.xyz**. Users can open the application and type their commands in plain language, such as *send 10 USD to Ola*, *swap my XLM for USDC*, or *save 30 USD toward my school fees*. The application handles the remaining steps. This removes the need to manage seed phrases during transactions, eliminates the requirement to purchase gas tokens beforehand, and prevents the friction of switching between multiple applications.

The product runs as a Next.js 15 application supporting Solana, Base, and Ethereum today. This document describes how we plan to integrate Stellar as a core network inside Jumpa, the technical details of that integration, and the foundation we have already established.

## The Four Core Features

### Home: Your Balances Across Every Chain

The home screen displays a single unified balance in USD, which is fetched in real time from all connected wallets. Below this balance is a row of action buttons: Send, Receive, Swap, and Save. Below the buttons is a scrollable history of recent transactions, each showing the network it settled on. We chose a chat first interface to remove the complexity associated with traditional Web3 wallets, making it accessible to any user globally who knows how to send a text message.

### The AI Chat: Where Transactions Actually Happen

The chat interface is already built. Powered by Claude Sonnet , it accepts natural language inputs, parses the user intent, and displays a transaction confirmation card directly inside the chat bubble. This card details the assets, the exact amounts, estimated fees, and destination before any transaction is executed.

When the user confirms the details, they enter their PIN to sign and broadcast the transaction. This signing happens locally on the device, meaning private keys never leave the browser and are never exposed to our servers. Once confirmed, the chat updates with a success message and the transaction link.

This is a live feature. We have verified transaction hashes from real users to prove its readiness, which are listed in the traction section.

### Savings Goals: Financial Targets with Live Yield

The savings page helps users establish financial targets, such as emergency funds, education fees, or travel savings. Each target displays a progress ring showing the current percentage completed. When we integrate DeFindex, deposits will route to yield bearing Stellar pools instead of sitting idle. The savings dashboard will display a live APY percentage next to each goal.

### Onramp and Offramp: Depositing and Withdrawing

We currently support fiat deposits and withdrawals via Switch. For the Stellar integration, we will implement MoneyGram and Mercuryo using the SEP 24 standard. When a user requests a withdrawal, a drawer displays the anchor interactive portal where they can complete verification steps and select their local cash agent or card payment details. The anchor triggers a webhook upon completion, which updates the database record automatically.

## Technical Architecture

Jumpa separates operations across five layers:

**Layer 1: User Interface.** React components styled with Tailwind v4. The chat interface, wallet dashboard, savings goals, and transaction overlays are complete.

**Layer 2: AI Intent Engine.** A Next.js API route that takes a chat message, analyzes the conversation history using Claude Sonnet, and returns a structured JSON payload detailing the target action, asset, amount, and recipient. This engine is complete and live.

**Layer 3: Gateway.** Next.js route handlers that convert intent payloads into network requests. These currently manage Switch integrations, wallet balance lookups, and transaction broadcasts. We will build a new Stellar module with routes for Soroswap quotes, SEP 24 sessions, DeFindex deposits, and Allbridge bridging.

**Layer 4: Sovereign Key Layer.** A client side security system where the seed phrase is decrypted locally in the browser to sign transactions, meaning private keys never touch our servers. This is already functional and includes the Stellar key derivation path.

**Layer 5: Chain Adapters.** The connectors to the blockchain networks. Currently, this includes Solana RPC clients, EVM providers, and the Stellar SDK. We will expand this layer to include Soroswap, SEP 24 anchor clients, DeFindex smart contracts, and the Allbridge SDK.

### The Swap Flow

When a user asks to swap assets, the AI returns a quote from the aggregator. Once confirmed, the transaction is signed locally by the user and broadcast via Horizon. Jumpa handles fee sponsorship on the backend, ensuring the user experiences a gasless transaction.

### Stellar Foundations in the Codebase

While the Soroswap and SEP 24 modules are planned integrations for this grant, the foundation for Stellar is already live in our codebase:

In our wallet derivation code, every new account derives a Stellar public key using the standard BIP39 path via the Stellar SDK. This happens automatically when a user signs up. Every user on our platform today already has a Stellar address assigned to their profile.

In our transaction schema, the chain attributes already support Stellar and Stellar testnet.

The Stellar SDK is already installed and imported in our key derivation library.

### Planned File Structure

This is the target file structure once the Stellar modules are completed. Items labeled with *[NEW]* are planned integrations, while the others are already live in the repository.

```
jumpa/
├── app/api/
│   ├── ai/intent/                  # Claude intent parser (live)
│   ├── wallet/                     # Multichain balance and operations (live)
│   ├── onramp/ and offramp/        # Fiat gateway handlers (live)
│   └── stellar/                    # [NEW] Stellar integration gateway
│       ├── swap/quote/             # Soroswap quote adapter
│       ├── swap/build/             # Soroswap XDR builder
│       ├── wallet/broadcast/       # Horizon broadcaster and Fee Bump wrapper
│       ├── sep24/initiate/         # SEP 10 auth and interactive session URL
│       ├── sep24/callback/         # Anchor webhook handler
│       ├── yield/pools/            # DeFindex pool listing
│       ├── yield/deposit/          # DeFindex deposit XDR builder
│       ├── yield/stats/            # Real time APY per savings goal
│       ├── bridge/quote/           # Allbridge fee quote
│       └── bridge/execute/         # Allbridge lock and mint initiator
│
├── lib/
│   ├── wallet.ts                   # Key derivation including Stellar (live)
│   ├── crypto.ts                   # AES 256 GCM encryption (live)
│   └── stellar/                    # [NEW] Stellar service clients
│       ├── client.ts               # Horizon and network configuration
│       ├── soroswap.ts             # Soroswap REST wrapper
│       ├── sep24.ts                # SEP 10 and SEP 24 anchor client
│       ├── defindex.ts             # DeFindex contract interface
│       └── allbridge.ts            # Allbridge SDK connector
│
├── components/stellar/             # [NEW] Stellar UI views
│   ├── OnrampSheet.tsx             # SEP 24 iframe drawer
│   ├── OfframpSheet.tsx            # Physical cash withdrawal overlay
│   └── YieldDashboard.tsx          # DeFindex APY display cards
│
└── models/
    ├── Wallet.ts                   # Stores Stellar fields (live)
    ├── Transaction.ts              # Stores Stellar chain attributes (live)
    ├── RampTransaction.ts          # Deposit and withdrawal ledger (live)
    └── SavingsGoal.ts              # [NEW] DeFindex yield tracking
```

### What We Will Build

The integration work consists of four key developments:

**Soroswap.** We will create an adapter to fetch quotes and build transactions. The quote will populate confirmation cards, and the unsigned payload from the build API will be signed locally and broadcast.

**SEP 24 Anchors.** We will implement the SEP 10 challenge response authentication and fetch interactive URLs for deposits and withdrawals. These portals will render inside our existing drawer layouts. A callback route will update transaction states based on anchor webhooks.

**DeFindex.** We will connect to the smart contracts to allow users to deposit savings goal funds directly into liquidity pools. We will extend the savings database model to track the pool address and yield, and add a stats API to fetch live earnings.

**Allbridge.** We will integrate the Allbridge SDK to support cross chain stablecoin bridging. Users will be able to initiate transfers from Solana or Base directly to Stellar.

## Traction and Proof of Work

### Live Pilot Performance

We validated our chat transaction flow through a closed pilot with 87 active testers. Users executed over 450 mainnet transactions for offramps and onramps, and settled more than $3,000 in volume using the chat interface.

To avoid cluttering the documentation, the table below lists a selection of 20 representative transactions:

| Chain | Amount & Asset | Value (USD) | Transaction Hash | Explorer Link |
|---|---|---|---|---|
| **Base** | 98.30 USDC | $98.30 | `0x4e99a9...b8d9` | [Basescan ↗](https://basescan.org/tx/0x4e99a96bb31b23a875b131398141e26fb83d3c1dd20b10248ab94a9e2922b8d9) |
| **Solana** | 0.4816 SOL | $66.75 | `z4wZXF...VMhK` | [Solscan ↗](https://solscan.io/tx/z4wZXFp4NAjn1mQdpPyqqH4YY82bqH2DJ9dpcCevb4nXTLjruofs9FVWsRPJmVS8rzZiSQw8LE9ywEJ9UwtVMhK) |
| **Solana** | 0.2550 SOL | $35.35 | `2GTVwT...udf9` | [Solscan ↗](https://solscan.io/tx/2GTVwTPxV7rjuz6uJFbsUUWLK35okmjDCCH6Ug7esk7LdDYuWmSV9rJQjLazWRzRo3p2Bg6yv25dptiKUbzucdf9) |
| **Solana** | 0.2681 SOL | $33.73 | `3TeM12...Sxn7` | [Solscan ↗](https://solscan.io/tx/3TeM12LRLP8URjqotPjxR4ECviHsmsNFC5Waq6UzNnbpnjqCzCDzvawnYAnTDrBnsZjy8u5mycGYTcyFNWgSxn7L) |
| **Base** | 30.00 USDC | $30.00 | `0x12f61e...cf0f` | [Basescan ↗](https://basescan.org/tx/0x12f61e03a6480f40d352aee89165a1e098e69765366be61e3eef5d0a7eccf0f2) |
| **Base** | 30.00 USDC | $30.00 | `0x627ffc...1f7` | [Basescan ↗](https://basescan.org/tx/0x627ffc75b6f610be0763a88c9e995af19c342e5acdcf92242847be7d4b10c1f7) |
| **Base** | 29.50 USDC | $29.50 | `0xdd60dc...058f` | [Basescan ↗](https://basescan.org/tx/0xdd60dcbeaf78adbdc620b1718f90ee3e6f2b798b7ac9d9617420fe767f76058f) |
| **Base** | 25.60 USDC | $25.60 | `0xf61657...ab88` | [Basescan ↗](https://basescan.org/tx/0xf61657a6dcc8dfb9308ea31f2d8cd7e9b852074b16db35c29692b0ab705bab88) |
| **Base** | 23.00 USDC | $23.00 | `0xee416d...ee89` | [Basescan ↗](https://basescan.org/tx/0xee416d47080770a75242d6a14b6da673fec288996593fcac2871c235a352ee89) |
| **Base** | 22.00 USDC | $22.00 | `0xfe30ea...3275` | [Basescan ↗](https://basescan.org/tx/0xfe30eae35709610897af2f4fb8ef90abf472d80c5bcf069212950df20acd3275) |
| **Base** | 22.00 USDC | $22.00 | `0x0a13dc...9570` | [Basescan ↗](https://basescan.org/tx/0x0a13dc6dea362657e6cf32ee9cf74032ece5befd144e6bb426d12c4259559570) |
| **Base** | 21.88 USDC | $21.88 | `0xac85e9...6a11` | [Basescan ↗](https://basescan.org/tx/0xac85e9b3a36268b865404a4506013b753455b1b1b72721d134ebca71b91766a1) |
| **Solana** | 0.1600 SOL | $21.84 | `3NyL4B...FPne` | [Solscan ↗](https://solscan.io/tx/3NyL4BMwWV61nHeKCdZNr96mtTd7TekxNMGS7nb2hDXMz5NuAeLjvpYtoDshCiyKSuUcTwd57wjZ4p81EcFPne7A) |
| **Base** | 21.00 USDC | $21.00 | `0x1d1956...3c58` | [Basescan ↗](https://basescan.org/tx/0x1d195631f49e684b246108d40dc5553093ea492f3592dfc9585fc986b9d23c58) |
| **Base** | 21.00 USDC | $21.00 | `0x848b1d...194b` | [Basescan ↗](https://basescan.org/tx/0x848b1daded76782f1ef7b66d132ce9e77a3625b217ba6cf996e532e6e692194b) |
| **Base** | 21.00 USDC | $21.00 | `0xd12780...de0f` | [Basescan ↗](https://basescan.org/tx/0xd1278051313cc3c1428fa07044c7e6b9cb20d9bf49a2791b7a80db2e7e62de0f) |
| **Base** | 21.00 USDC | $21.00 | `0x21d9a8...73e0` | [Basescan ↗](https://basescan.org/tx/0x21d9a826fd7b47322de9078294fd06181be61a20588bb5e175201af0e9f673e0) |
| **Solana** | 0.2566 SOL | $20.92 | `4Rxrun...j63j` | [Solscan ↗](https://solscan.io/tx/4RxrunrmvKPyqYvuCM6yBUmA6Nj7FKPU9QYCG29yGzSsDEFBX9QskXr5wF2yKNC2hKKvNrhpzAuQAYc4uNxj63jo) |
| **Base** | 20.00 USDC | $20.00 | `0xa67aab...a8b2` | [Basescan ↗](https://basescan.org/tx/0xa67aabd4361020d055385a444c96c51169c76c1146bd56b98a4d68393475a8b2) |
| **Base** | 20.00 USDC | $20.00 | `0xfec771...42c` | [Basescan ↗](https://basescan.org/tx/0xfec7718a63f2742ce4bb2a878926c265caa80c1bc0dd63d9bdd0c6936c8f342c) |

### Technical Readiness for Stellar

We have already completed the foundation work to support Stellar in production:

Every user on our platform automatically has a Stellar public key derived at account creation.

Our database models store Stellar fields as standard attributes.

Our transaction schemas support Stellar networks.

The Stellar SDK is installed and integrated into our key derivation libraries.

### External Validation

Our team was selected for the SEVCP startup acceleration program out of 1,200 global applicants. We also received recognition from Solana SuperteamNG as a high potential Web3 payment solution.

Our CEO previously directed product at Susu, which won both Privy and Circle global hackathons by delivering operational stablecoin savings modules.

## Why Stellar Improves Jumpa

Stellar addresses key limitations of Solana and Base for a global user base: true gas abstraction and compliant physical cash routing.

On Solana and Base, users must hold native gas tokens to complete transactions. This adds friction because users have to monitor their gas balances. With Stellar Fee Bump Transactions, Jumpa can sponsor network fees. The user signs their transaction, our backend wraps it, and we cover the network fees. The user experiences fee free stablecoin transfers.

Our current fiat integrations support bank transfers in specific regions but do not offer cash withdrawals. MoneyGram via SEP 24 resolves this globally without requiring custom local banking integrations. We load the anchor interactive portal inside our overlays, and the user can withdraw funds at physical cash locations in over 200 countries.

DeFindex yield integrations will improve our savings module. Currently, USDC savings sit idle. Routing deposits into DeFindex yield pools allows users to protect their balances from inflation.

Allbridge acts as the bridging connector. Users with balances on Solana or Base will be able to move stablecoins to Stellar directly from the chat interface.

## Integration Roadmap

**Tranche 1: Stellar Core Infrastructure.** We will establish connection to the Stellar Horizon client, construct the Soroswap quote and build APIs, and integrate the SEP 24 interactive windows within our overlays. We will verify completion with a testnet swap demonstration.

**Tranche 2: Complete Transaction Loops.** We will implement end to end swaps on testnet, activate DeFindex smart contract routing, and embed the Allbridge bridging flow.

**Tranche 3: Production Release.** We will deploy all four integrations to our mainnet environment. We target a baseline of 50 mainnet transactions, $5,000 in volume, and 20 active savings goals.

## 6. Team Profiles

Jumpa is led by a team of highly technical, Web3 native operators with a proven history of launching compliant payment solutions:

*   **Ndukwe Anita, CEO & Product Lead**
    *   Previously served as COO at Susu, a stablecoin savings and rewards platform that won both Privy and Circle global hackathons. Extensive experience in product architecture across Axelar, Circle, and PoolTogether.
    *   [LinkedIn Profile](https://www.linkedin.com/in/ndukwe-anita-2a3979243)
*   **Damian Olebuezie, CTO & Lead Blockchain Engineer**
    *   Damian is a technical mentor at Web3Bridge, where he trains and mentors smart contract developers. Former lead full stack developer on multiple emerging market Web3 payment and DeFi infrastructure projects.
    *   [GitHub Profile](https://github.com/czdamian)
*   **Ismail Mohammed, COO & Operations Lead**
    *   Previously Africa Lead at Exsty, where he drove regional operations and regional business development. Deep expertise in regional business development, cash in and cash out agent coordination, and compliance.
    *   [LinkedIn Profile](https://www.linkedin.com/in/ismail-muhammad-351229279)
