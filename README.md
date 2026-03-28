# SolenScan

Block explorer for the [Solen](../solen/) blockchain. Inspired by Etherscan's familiar interface.

## Features

- **Dashboard** — chain stats (block height, total blocks/txs/events) with live-updating latest blocks
- **Block explorer** — browse blocks with epoch, age, tx count, gas used, proposer
- **Block detail** — full block info with prev/next navigation
- **Transactions** — browse recent transactions with status badges (success/failed)
- **Events** — view contract events with emitter and topic
- **Account pages** — balance, nonce, code hash, transaction history, smart account detection
- **Network switcher** — toggle between devnet, testnet, and mainnet
- **Search** — look up blocks by height or accounts by ID
- **Auto-refresh** — data polls every 3-5 seconds

## Getting Started

### Prerequisites

- Node.js 18+
- A running Solen node (`cargo run --bin solen-node` from the `~/solen/` directory)

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Configuration

Network endpoints are configurable via environment variables. Defaults point to `localhost`.

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_DEVNET_RPC_URL` | `http://localhost:9944` | Devnet JSON-RPC endpoint |
| `NEXT_PUBLIC_DEVNET_API_URL` | `http://localhost:9955` | Devnet Explorer REST API |
| `NEXT_PUBLIC_TESTNET_RPC_URL` | `http://localhost:9944` | Testnet JSON-RPC endpoint |
| `NEXT_PUBLIC_TESTNET_API_URL` | `http://localhost:9955` | Testnet Explorer REST API |
| `NEXT_PUBLIC_MAINNET_RPC_URL` | `http://localhost:9944` | Mainnet JSON-RPC endpoint |
| `NEXT_PUBLIC_MAINNET_API_URL` | `http://localhost:9955` | Mainnet Explorer REST API |

Example `.env.local`:

```env
NEXT_PUBLIC_DEVNET_RPC_URL=http://localhost:9944
NEXT_PUBLIC_DEVNET_API_URL=http://localhost:9955
NEXT_PUBLIC_TESTNET_RPC_URL=https://testnet-rpc.solen.io
NEXT_PUBLIC_TESTNET_API_URL=https://testnet-api.solen.io
NEXT_PUBLIC_MAINNET_RPC_URL=https://rpc.solen.io
NEXT_PUBLIC_MAINNET_API_URL=https://api.solen.io
```

## API Endpoints Used

### Explorer REST API (default port 9955)

| Endpoint | Description |
|---|---|
| `GET /api/status` | Chain status (height, totals) |
| `GET /api/blocks?limit=N` | Recent blocks |
| `GET /api/blocks/{height}` | Single block by height |
| `GET /api/accounts/{id}/txs?limit=N` | Account transaction history |
| `GET /api/events?limit=N` | Recent events |

### JSON-RPC API (default port 9944)

| Method | Description |
|---|---|
| `solen_getAccount` | Account info (balance, nonce, code hash) |
| `solen_getBalance` | Account balance |
| `solen_getLatestBlock` | Latest block |

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
