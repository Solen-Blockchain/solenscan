export type NetworkId = "mainnet" | "testnet" | "devnet";

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  rpcUrl: string;
  explorerApiUrl: string;
  color: string;
}

export const networks: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: "mainnet",
    name: "Mainnet",
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "http://localhost:9944",
    explorerApiUrl: process.env.NEXT_PUBLIC_MAINNET_API_URL || "http://localhost:9955",
    color: "#22c55e",
  },
  testnet: {
    id: "testnet",
    name: "Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || "http://localhost:19944",
    explorerApiUrl: process.env.NEXT_PUBLIC_TESTNET_API_URL || "http://localhost:19955",
    color: "#eab308",
  },
  devnet: {
    id: "devnet",
    name: "Devnet",
    rpcUrl: process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "http://localhost:29944",
    explorerApiUrl: process.env.NEXT_PUBLIC_DEVNET_API_URL || "http://localhost:29955",
    color: "#3b82f6",
  },
};

export const DEFAULT_NETWORK: NetworkId = "devnet";
