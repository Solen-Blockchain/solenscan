export interface ChainStatus {
  latest_height: number;
  total_blocks: number;
  total_txs: number;
  total_events: number;
}

export interface IndexedBlock {
  height: number;
  epoch: number;
  parent_hash: string;
  state_root: string;
  proposer: string;
  timestamp_ms: number;
  tx_count: number;
  gas_used: number;
}

export interface IndexedTx {
  block_height: number;
  index: number;
  sender: string;
  nonce: number;
  success: boolean;
  gas_used: number;
  error: string | null;
  events: IndexedEvent[];
}

export interface IndexedEvent {
  block_height: number;
  tx_index: number;
  emitter: string;
  topic: string;
}

export interface AccountInfo {
  balance: string;
  nonce: number;
  code_hash: string;
}

export interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}
