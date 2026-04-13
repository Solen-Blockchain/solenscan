"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useNetwork } from "@/context/NetworkContext";
import { createApi } from "@/lib/api";
import { IndexedBlock, BlockInfo, IndexedTx } from "@/lib/types";
import { formatTimestamp, formatNumber, formatBalance, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading, ErrorMessage } from "@/components/Loading";

export default function BlockDetailPage() {
  const params = useParams();
  const height = Number(params.height);
  const { network } = useNetwork();

  const [block, setBlock] = useState<IndexedBlock | null>(null);
  const [rpcBlock, setRpcBlock] = useState<BlockInfo | null>(null);
  const [txs, setTxs] = useState<IndexedTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mounted = { current: true };

    async function fetchBlock() {
      try {
        const api = createApi(network);
        const [indexedResult, rpcResult, txsResult] = await Promise.allSettled([
          api.getBlock(height),
          api.getBlockRpc(height),
          api.getBlockTxs(height),
        ]);

        if (mounted.current) {
          if (indexedResult.status === "fulfilled") setBlock(indexedResult.value);
          if (rpcResult.status === "fulfilled") setRpcBlock(rpcResult.value);
          if (txsResult.status === "fulfilled") setTxs(txsResult.value);
          if (indexedResult.status === "rejected" && rpcResult.status === "rejected") {
            setError("Block not found. The indexer may only keep recent blocks in memory.");
          } else {
            setError(null);
          }
        }
      } catch (e) {
        if (mounted.current) setError(e instanceof Error ? e.message : "Failed to fetch block");
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    setLoading(true);
    fetchBlock();
    return () => { mounted.current = false; };
  }, [network, height]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8"><Loading /></div>;
  if (error && !block && !rpcBlock) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const b = block || rpcBlock;
  if (!b) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Block #{formatNumber(b.height)}
        </h1>
        <div className="flex gap-1">
          {b.height > 0 && (
            <Link
              href={`/block/${b.height - 1}`}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              &larr; Prev
            </Link>
          )}
          <Link
            href={`/block/${b.height + 1}`}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Next &rarr;
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-6">
        <Row label="Block Height" value={formatNumber(b.height)} />
        <Row label="Epoch" value={b.epoch.toString()} />
        <Row label="Timestamp">
          <span>{formatTimestamp(b.timestamp_ms)}</span>
          <span className="ml-2 text-gray-400 dark:text-gray-500 text-xs">({timeAgo(b.timestamp_ms)})</span>
        </Row>
        <Row label="Transactions">
          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700">
            {b.tx_count} transaction{b.tx_count !== 1 ? "s" : ""}
          </span>
        </Row>
        <Row label="Gas Used">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(b.gas_used.toString())} SOLEN</span>
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(raw: {formatNumber(b.gas_used)})</span>
        </Row>
        <Row label="Proposer">
          <Link
            href={`/account/${b.proposer}`}
            className="text-indigo-600 hover:text-indigo-800 font-mono text-sm"
          >
            {b.proposer}
          </Link>
          <CopyButton text={b.proposer} />
        </Row>
        <Row label="Parent Hash">
          <span className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{b.parent_hash}</span>
          <CopyButton text={b.parent_hash} />
        </Row>
        <Row label="State Root">
          <span className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{b.state_root}</span>
          <CopyButton text={b.state_root} />
        </Row>
        {rpcBlock && (
          <>
            <Row label="Transactions Root">
              <span className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{rpcBlock.transactions_root}</span>
              <CopyButton text={rpcBlock.transactions_root} />
            </Row>
            <Row label="Receipts Root">
              <span className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{rpcBlock.receipts_root}</span>
              <CopyButton text={rpcBlock.receipts_root} />
            </Row>
          </>
        )}
      </div>

      {/* Block Transactions */}
      {txs.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Transactions ({txs.length})
            </h2>
          </div>
          <div className="p-6">
            <TransactionsTable transactions={txs} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="px-6 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-48 bg-gray-50/50 dark:bg-slate-800/50">
        {label}
      </div>
      <div className="px-6 py-3.5 text-sm text-gray-900 dark:text-gray-100 flex-1 flex items-center gap-1">
        {value || children}
      </div>
    </div>
  );
}
