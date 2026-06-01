# Jumpa: Premium chat native multi chain Wallet & DeFi Gateway

*   **Project Name**: JUMPA
*   **Submission Track**: Build Award (Integration Track)
*   **Submission Category**: End User Application
*   **Requested Budget**: $79,700
*   **Website**: [https://jumpa.xyz](https://jumpa.xyz)

***

## 1. Project Overview & Problem Statement

Emerging markets, particularly across Sub Saharan Africa and Southeast Asia, are experiencing rapid adoption of USD backed stablecoins to combat hyperinflation and local currency devaluation. However, standard cryptocurrency wallets and decentralized finance (DeFi) protocols remain inaccessible to average users due to significant technical friction:
1.  **Seed Phrase Anxiety**: Managing twelve word recovery phrases represents a major single point of failure for non technical users.
2.  **Gas Fee Complexity**: Requiring users to hold native tokens (like XLM, SOL, or ETH) simply to pay network fees for a stablecoin transaction creates immediate drop offs.
3.  **Fragmented Financial Flows**: Users are forced to switch between multiple apps, off ramps, neobanks, and DeFi protocols just to receive, swap, save, or spend stablecoins.

**Jumpa** resolves this friction by introducing a **premium, chat native multi chain wallet interface** that lets users spend stablecoins like physical cash. Powered by **AI**, Jumpa translates natural language requests (e.g., *"Swap 50 XLM for USDC,"* *"Deposit $20 into my savings goal,"* or *"I want to cash in 50 USDC"*) into instant, on chain execution payloads.

By utilizing a **sovereign security model** (client side AES 256 GCM encryption secured by a 6 digit PIN) and **gas abstraction**, Jumpa delivers a truly frictionless chat experience that hides blockchain complexity under a conversational interface.

***

## 2. How Stellar is Used (Ecosystem Integrations)

Jumpa operates as a multi chain wallet gateway. Under the **SCF Integration Track**, Jumpa will directly integrate **four key building blocks from the official SCF Integration List** into its core Next.js/React architecture:

### A. Soroswap Aggregator API (Stellar Swaps)
Instead of building custom swap smart contracts, Jumpa will integrate the **Soroswap API** directly into our conversational loop:
*   **Intent Parsing**: When a user inputs a swap request via chat (*"Swap 100 XLM for USDC"*), the AI assistant parses the token symbols and amount into a structured payload.
*   **Quote & Build**: The Jumpa backend calls the Soroswap Quote API to retrieve the best aggregated route across Soroswap, Phoenix, and the classic Stellar DEX, then calls the Build API to retrieve the unsigned Transaction XDR.
*   **On device Signing**: The transaction is decrypted and signed locally on device using the user's derived Stellar Keypair, then securely broadcast to Horizon.

### B. MoneyGram Access & Mercuryo (SEP 24 Hosted Ramps)
Instead of attempting to construct banking rails from scratch, Jumpa will integrate **MoneyGram** (for physical cash in and cash out) and **Mercuryo** (for card payments) using the Stellar standard **SEP 24** (Hosted Deposit & Withdrawal) and **SEP 10** (Authentication):
*   **Interactive Sessions**: When a user requests an on ramp or off ramp via chat, Jumpa initiates a secure transaction with the respective anchor server and retrieves the interactive URL.
*   **Seamless Overlay UI**: The interactive portal is opened in a sleek, overlay sheet (`OnrampSheet`/`OfframpSheet`) using an iframe, allowing the user to complete payment natively without leaving the chat interface.

### C. DeFindex Yield Infrastructure (Savings Goals)
Jumpa features a native **Target Savings** module. Rather than keeping savings static, Jumpa will integrate **DeFindex** (Yield Infrastructure for Stellar):
*   **Yield bearing Savings**: When a user deposits stablecoins into a savings goal via chat, the backend routes the deposit into decentralized DeFindex yield bearing pools on Stellar.
*   **Auto harvesting**: Yield is tracked and displayed to the user in real time, allowing them to preserve purchasing power against high inflation local currencies.

### D. Allbridge (Cross Chain Bridging)
Since Jumpa is a unified multi chain interface supporting Solana, Base, and Stellar, cross chain interoperability is crucial. Jumpa will integrate the **Allbridge SDK/Widget** to allow users to seamlessly bridge stablecoins between Solana/Base and Stellar directly within the transaction confirmation drawer.

***

## 3. How This Integration Improves Jumpa

*   **Low Cost & Speed**: Integrating Stellar as a core payment corridor provides Jumpa users with near instant (3 to 5 seconds) transaction settlement and sub penny fees.
*   **Gas Abstraction**: By leveraging Stellar's low fees, Jumpa can fully abstract gas. Users pay transaction fees in the asset being transferred (like USDC), while Jumpa handles the XLM network fees on the backend.
*   **Absolute Compliance**: Integrating official Stellar anchor standards (SEP 10, SEP 24) ensures built in compliance, tiered KYC, and trusted transaction monitoring.
*   **Highly Credible UX**: Replacing an overly ambitious roadmap with proven ecosystem integrations allows a lean team to deliver a production ready Web3 application within a competitive timeframe.

***

## 4. Deliverable Roadmap & Tranches

### Tranche 1: Core Integration & SDK Foundations
*   **Brief Description**: Establish the core integration layer for the Stellar Horizon connector, the Soroswap REST API, and hosted SEP 24 sandbox environments on Next.js/React.
*   **Milestones & Deliverables**:
    1.  **Stellar Key Derivation**: Standardize sovereign client side key derivation (BIP39 path `m/44'/148'/0'`) with `@stellar/stellar-sdk` and active Horizon testnet/mainnet account state sync.
    2.  **Soroswap Backend Integrator**: Implement backend service handlers in Next.js to fetch quotes from `/quote` and construct transaction XDR envelopes from `/build` for testnet XLM/USDC pools.
    3.  **SEP 24 Hosted Ramps Staging**: Embed the Mercuryo and MoneyGram testnet SEP 24 sandbox interactive environment within responsive frontend Sheets (`OnrampSheet`/`OfframpSheet`) via iframes.
    4.  **AI Intent Upgrades**: Update the AI based natural language intent engine to parse, map, and output structured Stellar swap, deposit, and withdraw payloads.
*   **How to Measure Completion**:
    *   *Deliverable 1*: A screen captured video showing a user typing a Stellar swap request into the chat, the AI fetching an active quote from Soroswap on testnet, and displaying the transaction parameters.
    *   *Deliverable 2*: Successful initialization of a sandboxed SEP 24 on ramp interactive window inside Jumpa's UI Sheet, loaded using testnet parameters.
*   **Budget**: $20,000

### Tranche 2: Conversational Loop & DeFi Yield Staging
*   **Brief Description**: Complete the end to end conversational transaction loops on Stellar testnet and integrate the DeFindex yield savings module.
*   **Milestones & Deliverables**:
    1.  **End to end chat swaps**: Enable full Soroswap token swaps directly in the chat interface on testnet (AI quote to backend XDR build to client side signature decryption via PIN to Horizon broadcast).
    2.  **Savings Yield Integration**: Wire Jumpa's Target Savings frontend module to DeFindex testnet pools, demonstrating automated USDC deposits and mock yield tracking.
    3.  **Cross Chain Bridging**: Integrate Allbridge testnet support into the unified transaction confirmation drawer, allowing simulated Base to Stellar stablecoin transfers.
*   **How to Measure Completion**:
    *   *Deliverable 1*: A screen captured video showing a complete testnet swap cycle: the user initiates a swap in chat, inputs their 6 digit PIN to sign the transaction, and the backend successfully submits the transaction to Horizon (with transaction hash logs).
    *   *Deliverable 2*: Working mockups and logs demonstrating testnet deposits and withdrawals into DeFindex yield pools from the savings dashboard.
*   **Budget**: $26,700

### Tranche 3: Production Mainnet Launch
*   **Brief Description**: Deploy all four integrations to the Jumpa production environment on Stellar mainnet and verify the audit trail.
*   **Milestones & Deliverables**:
    1.  **Mainnet Deployments**: Push Soroswap, DeFindex yield, Allbridge, and MoneyGram/Mercuryo live on the Jumpa production web application.
    2.  **Public Documentation**: Publish comprehensive user and developer guides detailing Jumpa's integration architecture, key derivation path, and data privacy safeguards on the official Jumpa website.
    3.  **On chain verification**: Ensure 100% of all mainnet transaction histories are publicly audit verifiable via the Stellar Expert explorer.
*   **How to Measure Completion (Mainnet Metrics)**:
    *   *Metric 1*: At least **50 real cross border or swap transactions** successfully settled on Stellar mainnet.
    *   *Metric 2*: A minimum of **$5000 in total value** successfully swapped or bridged on mainnet.
    *   *Metric 3*: **20+ active savings goals** established by users routing live stablecoin assets into DeFindex mainnet yield pools.
    *   *Metric 4*: Production dashboard is fully live and accessible on mainnet, verified by public URL links and transaction history.
*   **Budget**: $33,000

***

## 5. Traction Evidence & Pilot Data

*   **Early Program Selection**: Selected as one of the 129 early stage startups (out of 1,200+ global applicants) for the SEVCP startup acceleration cohort.
*   **Ecosystem Recognition**: Formally recognized by Solana SuperteamNG as one of the top high potential Web3 projects building payment solutions in the region.
*   **Pilot User Traction**: Completed a closed pilot with **87 active testers**, facilitating **450+ mainnet transactions** and driving over **$3,000 in volume**.
*   **Merchant Integration Pipeline**: Secured early expressions of interest (MoU) with **12 local merchants** across Nigeria, Kenya, and Thailand to integrate Jumpa's automated stablecoin payouts.

***

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
