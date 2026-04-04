// --- Base58 (Bitcoin alphabet) ---
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    zeros++;
  }
  let num = BigInt(0);
  for (const b of bytes) {
    num = num * BigInt(256) + BigInt(b);
  }
  const chars: string[] = [];
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    chars.unshift(BASE58_ALPHABET[remainder]);
  }
  for (let i = 0; i < zeros; i++) {
    chars.unshift("1");
  }
  return chars.join("");
}

export function base58Decode(str: string): Uint8Array {
  let zeros = 0;
  for (const c of str) {
    if (c !== "1") break;
    zeros++;
  }
  let num = BigInt(0);
  for (const c of str) {
    const idx = BASE58_ALPHABET.indexOf(c);
    if (idx === -1) throw new Error(`Invalid Base58 character: ${c}`);
    num = num * BigInt(58) + BigInt(idx);
  }
  const hex = num === BigInt(0) ? "" : num.toString(16).padStart(2, "0");
  const paddedHex = hex.length % 2 ? "0" + hex : hex;
  const byteLen = paddedHex.length / 2;
  const result = new Uint8Array(zeros + byteLen);
  for (let i = 0; i < byteLen; i++) {
    result[zeros + i] = parseInt(paddedHex.slice(i * 2, i * 2 + 2), 16);
  }
  return result;
}

/** Convert a 64-char hex address (from raw event data) to Base58. */
export function hexToBase58(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return base58Encode(bytes);
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString();
}

export function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatGas(gas: number): string {
  if (gas >= 1_000_000) return `${(gas / 1_000_000).toFixed(2)}M`;
  if (gas >= 1_000) return `${(gas / 1_000).toFixed(1)}K`;
  return gas.toString();
}

const DECIMALS = 8;
const DIVISOR = BigInt(10 ** DECIMALS);

export function formatBalance(raw: string | number): string {
  const n = typeof raw === "string" ? BigInt(raw) : BigInt(raw);
  const whole = n / DIVISOR;
  const frac = n % DIVISOR;
  if (frac === BigInt(0)) return whole.toLocaleString();
  const fracStr = frac.toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function formatTokenBalance(raw: string, decimals: number): string {
  const n = BigInt(raw);
  if (decimals === 0) return n.toLocaleString();
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = n / divisor;
  const frac = n % divisor;
  if (frac === BigInt(0)) return whole.toLocaleString();
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toLocaleString()}.${fracStr}`;
}

export interface TransferInfo {
  to: string;
  amount: string;
  /** If set, this is a token transfer from this contract, not a native SOLEN transfer. */
  tokenContract?: string;
}

export function parseTransferEvent(data: string): TransferInfo | null {
  // Transfer event data: [recipient_id (32 bytes = 64 hex chars)][amount (16 bytes = 32 hex chars)]
  if (data.length < 96) return null;
  const toHex = data.slice(0, 64);
  const amountHex = data.slice(64, 96);
  // Amount is little-endian u128
  const bytes = [];
  for (let i = 0; i < amountHex.length; i += 2) {
    bytes.push(parseInt(amountHex.slice(i, i + 2), 16));
  }
  // Convert LE bytes to bigint
  let amount = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) {
    amount = (amount << BigInt(8)) | BigInt(bytes[i]);
  }
  return { to: hexToBase58(toHex), amount: amount.toString() };
}

export function getTransferInfo(events: { topic: string; data: string; emitter?: string }[], sender?: string): TransferInfo | null {
  // Prefer native SOLEN transfers (emitter == sender) over token transfers.
  const nativeTransfer = events.find((e) => e.topic === "transfer" && e.emitter === sender);
  if (nativeTransfer) {
    return parseTransferEvent(nativeTransfer.data);
  }
  // Fall back to token transfer (emitter is a contract, not the sender).
  const tokenTransfer = events.find((e) => e.topic === "transfer" && e.emitter !== sender);
  if (tokenTransfer) {
    const info = parseTransferEvent(tokenTransfer.data);
    if (info) {
      info.tokenContract = tokenTransfer.emitter;
    }
    return info;
  }
  return null;
}

export interface RewardInfo {
  validator: string;
  amount: string;
}

export function parseRewardEvent(data: string): RewardInfo | null {
  // Epoch reward data: [validator_id (32 bytes = 64 hex chars)][amount (16 bytes = 32 hex chars)]
  if (data.length < 96) return null;
  const validatorHex = data.slice(0, 64);
  const amountHex = data.slice(64, 96);
  const bytes = [];
  for (let i = 0; i < amountHex.length; i += 2) {
    bytes.push(parseInt(amountHex.slice(i, i + 2), 16));
  }
  let amount = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) {
    amount = (amount << BigInt(8)) | BigInt(bytes[i]);
  }
  return { validator: hexToBase58(validatorHex), amount: amount.toString() };
}

export interface StakeInfo {
  validator: string;
  amount: string;
}

export function parseStakeEvent(data: string): StakeInfo | null {
  // Stake/unstake data: [validator (32 bytes = 64 hex)][amount (16 bytes = 32 hex LE u128)]
  if (data.length < 96) {
    // Old format: just amount (32 hex chars)
    if (data.length >= 32) {
      const amountHex = data.slice(0, 32);
      const bytes = [];
      for (let i = 0; i < amountHex.length; i += 2) {
        bytes.push(parseInt(amountHex.slice(i, i + 2), 16));
      }
      let amount = BigInt(0);
      for (let i = bytes.length - 1; i >= 0; i--) {
        amount = (amount << BigInt(8)) | BigInt(bytes[i]);
      }
      return { validator: "", amount: amount.toString() };
    }
    return null;
  }
  const validatorHex = data.slice(0, 64);
  const amountHex = data.slice(64, 96);
  const bytes = [];
  for (let i = 0; i < amountHex.length; i += 2) {
    bytes.push(parseInt(amountHex.slice(i, i + 2), 16));
  }
  let amount = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) {
    amount = (amount << BigInt(8)) | BigInt(bytes[i]);
  }
  return { validator: hexToBase58(validatorHex), amount: amount.toString() };
}

export interface SlashInfo {
  validator: string;
  amount: string;
}

export function parseSlashEvent(data: string): SlashInfo | null {
  // Slash event data: [offender (32 bytes = 64 hex chars)][penalty (16 bytes = 32 hex chars)]
  if (data.length < 96) return null;
  const validatorHex = data.slice(0, 64);
  const amountHex = data.slice(64, 96);
  const bytes = [];
  for (let i = 0; i < amountHex.length; i += 2) {
    bytes.push(parseInt(amountHex.slice(i, i + 2), 16));
  }
  let amount = BigInt(0);
  for (let i = bytes.length - 1; i >= 0; i--) {
    amount = (amount << BigInt(8)) | BigInt(bytes[i]);
  }
  return { validator: hexToBase58(validatorHex), amount: amount.toString() };
}

export function isContractAccount(codeHash: string): boolean {
  return codeHash !== "0".repeat(64) && codeHash !== "";
}

export function classNames(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
