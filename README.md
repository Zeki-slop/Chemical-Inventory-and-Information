# ChemAware — Web3 Chemical Information Platform

ChemAware helps people identify the chemicals in the medicines, food, cosmetics, and cleaning
products they use every day — pulling live scientific data from public APIs (PubChem, OpenFDA,
Open Food Facts) and layering a blockchain-backed community verification system on top, so
anyone can submit and cross-check reports without trusting a single centralized source.

Built as a final-year engineering project demonstrating React, public API integration, Bootstrap
5 UI, and Web3 (MetaMask + Solidity + IPFS).

---

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Bootstrap 5 + Bootstrap Icons, Axios, Context API + Hooks
- **Web3:** ethers.js v6, MetaMask, Solidity ^0.8.24, Hardhat, Sepolia testnet
- **Storage:** IPFS via Pinata (report content), on-chain hash + CID only
- **Extras:** jsPDF (PDF report download), qrcode.react (share QR codes)

## Public APIs used

| API | Used for |
|---|---|
| [PubChem PUG REST/View](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest) | Chemical compounds: formula, weight, CAS number, toxicity, hazards |
| [OpenFDA](https://open.fda.gov/apis/) | Medicines: active ingredients, warnings, side effects, dosage |
| [Open Food Facts](https://world.openfoodfacts.org/data) | Food/cosmetic products: ingredients, additives, allergens, Nutri-Score |

All three are free and require no API key for basic usage (OpenFDA supports an optional key for
higher rate limits — see `.env.example`).

---

## Project Structure

```
chemaware/
├── contracts/
│   └── ChemAwareRegistry.sol       # Solidity smart contract
├── scripts/
│   └── deploy.js                   # Hardhat deploy script
├── hardhat.config.js
├── src/
│   ├── components/                 # Navbar, ProductCard, WalletButton, VerifiedBadge, ...
│   ├── pages/                      # Home, SearchResults, ChemicalDetails, VerifiedReports,
│   │                                 Dashboard, Compare, About, NotFound
│   ├── context/                    # WalletContext, ThemeContext, UserDataContext
│   ├── hooks/                      # useSearch, useVerifiedReports
│   ├── services/                   # pubchemApi, openFdaApi, openFoodFactsApi, api.js (aggregator),
│   │                                 web3Service (ethers/MetaMask), ipfsService (Pinata)
│   ├── contracts/
│   │   └── ChemAwareRegistry.json  # ABI consumed by the frontend
│   ├── utils/                      # safetyScore.js, pdfReport.js
│   ├── App.jsx / main.jsx
│   └── assets/theme.css
├── .env.example
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in what you need:
- `VITE_OPENFDA_API_KEY` — optional, raises OpenFDA rate limits
- `VITE_PINATA_JWT` / `VITE_PINATA_API_KEY` / `VITE_PINATA_SECRET_KEY` — for pinning reports to IPFS (the app falls back to a mock local CID if unset, so you can still demo the flow without a Pinata account)
- `SEPOLIA_RPC_URL` + `PRIVATE_KEY` — only needed for deploying the smart contract (use a **testnet-only burner wallet**, never a real funded key)
- `VITE_CONTRACT_ADDRESS` — filled in automatically by the deploy script

### 3. Run the frontend

```bash
npm run dev
```

Visit `http://localhost:5173`. The search, details, comparison, dashboard, and dark mode all work
immediately using the public APIs — no wallet or contract deployment required.

### 4. (Optional) Deploy the smart contract to try the Web3 features

**Local Hardhat network (fastest, free, no real ETH needed):**

```bash
# terminal 1 — keep this running
npm run node

# terminal 2
npm run deploy:local
```

This deploys `ChemAwareRegistry.sol`, writes its ABI + address into
`src/contracts/ChemAwareRegistry.json`, and prints a `VITE_CONTRACT_ADDRESS` line — copy that into
your `.env`. Then point MetaMask at `http://127.0.0.1:8545` (chain ID `31337`) and import one of
the private keys Hardhat prints when `npm run node` starts.

**Sepolia testnet (for a persistent, public deployment):**

1. Get a free Sepolia RPC URL (Alchemy or Infura) and some test ETH from a faucet.
2. Set `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in `.env`.
3. Run:
   ```bash
   npm run compile
   npm run deploy:sepolia
   ```
4. Copy the printed `VITE_CONTRACT_ADDRESS` into `.env` and restart `npm run dev`.

Once a contract address is configured, the **Verified Reports** page and the **Submit a Report**
flow on the Dashboard become fully functional: connect MetaMask, submit a report, and it's hashed,
pinned to IPFS, and written on-chain.

---

## How the Web3 flow works

1. A connected wallet submits a report (product + free-text claim) through the UI.
2. The full report JSON is pinned to IPFS (via Pinata), producing a content CID.
3. A `keccak256` hash of that same JSON is computed client-side.
4. `ChemAwareRegistry.submitReport(productId, productName, reportHash, ipfsCid)` is called —
   only the hash + CID (not the full text) go on-chain, keeping gas costs low.
5. The contract rejects exact duplicate submissions and permanently timestamps the entry;
   nothing already submitted can be edited.
6. Other wallets can upvote or flag a report once each (enforced on-chain), giving a transparent,
   tamper-evident reputation signal.

See `src/pages/About.jsx` for the same explanation written for end users.

---

## Extending with new data sources

Add a new file in `src/services/` (e.g. `cosmeticsApi.js`) that exports a `search*` function
returning objects normalized to `{ source, id, name, category, ... }`, then wire it into
`searchAll()` in `src/services/api.js`. `computeSafetyScore()` in `src/utils/safetyScore.js` can
be extended with a case for the new category.

## Notes on the "Extra Features"

- **Dark mode** — `ThemeContext`, toggled from the navbar, persisted to `localStorage`.
- **Favorites / Search history / Reputation** — `UserDataContext`, persisted to `localStorage`
  per browser (a production version would tie these to the connected wallet address server-side).
- **PDF report download** — `utils/pdfReport.js` (jsPDF) on the Chemical Details page.
- **QR code sharing** — `qrcode.react` on the Chemical Details page.
- **Compare products** — `/compare` page, up to 3 side-by-side.
- **Filter by safety level / category, pagination** — `SearchResults.jsx`.
- **AI-powered risk summary** — intentionally left as a clearly-marked placeholder
  (`getCompoundSafetySections` already returns structured toxicity/hazard text that a future LLM
  call could summarize) rather than faking a real AI integration.

## License

MIT — educational/academic use.
