import { NetworkConfig } from "./networks";
import {
  ChainStatus,
  IndexedBlock,
  IndexedTx,
  IndexedEvent,
  AccountInfo,
  RpcResponse,
} from "./types";

async function fetchApi<T>(baseUrl: string, path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function rpcCall<T>(
  rpcUrl: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  const data: RpcResponse<T> = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result as T;
}

export function createApi(network: NetworkConfig) {
  const { explorerApiUrl, rpcUrl } = network;

  return {
    getStatus: () => fetchApi<ChainStatus>(explorerApiUrl, "/api/status"),

    getBlocks: (limit = 20) =>
      fetchApi<IndexedBlock[]>(explorerApiUrl, `/api/blocks?limit=${limit}`),

    getBlock: (height: number) =>
      fetchApi<IndexedBlock>(explorerApiUrl, `/api/blocks/${height}`),

    getAccountTxs: (account: string, limit = 20) =>
      fetchApi<IndexedTx[]>(
        explorerApiUrl,
        `/api/accounts/${account}/txs?limit=${limit}`
      ),

    getEvents: (limit = 20) =>
      fetchApi<IndexedEvent[]>(explorerApiUrl, `/api/events?limit=${limit}`),

    getAccount: (accountId: string) =>
      rpcCall<AccountInfo>(rpcUrl, "solen_getAccount", {
        account_id: accountId,
      }),

    getBalance: (accountId: string) =>
      rpcCall<string>(rpcUrl, "solen_getBalance", { account_id: accountId }),

    getLatestBlock: () => rpcCall<IndexedBlock>(rpcUrl, "solen_getLatestBlock"),
  };
}
