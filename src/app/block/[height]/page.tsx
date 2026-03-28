"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePolling } from "@/hooks/useApi";
import { createApi } from "@/lib/api";
import { IndexedBlock } from "@/lib/types";
import { truncateHash, formatTimestamp, formatNumber } from "@/lib/utils";
import { Loading, ErrorMessage } from "@/components/Loading";

export default function BlockDetailPage() {
  const params = useParams();
  const height = Number(params.height);

  const fetcher = useCallback(
    (api: ReturnType<typeof createApi>) => api.getBlock(height),
    [height]
  );
  const { data: block, loading, error } = usePolling<IndexedBlock>(fetcher, 5000);

  if (loading && !block) return <Loading />;
  if (error) {
    const notFound = error.includes("404") || error.includes("Upstream");
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <ErrorMessage
          message={
            notFound
              ? `Block #${formatNumber(height)} not found. The indexer may only keep recent blocks in memory.`
              : error
          }
        />
      </div>
    );
  }
  if (!block) return null;

  const rows = [
    { label: "Block Height", value: formatNumber(block.height) },
    { label: "Epoch", value: block.epoch.toString() },
    { label: "Timestamp", value: formatTimestamp(block.timestamp_ms) },
    { label: "Transactions", value: block.tx_count.toString() },
    { label: "Gas Used", value: formatNumber(block.gas_used) },
    {
      label: "Proposer",
      value: (
        <Link
          href={`/account/${block.proposer}`}
          className="text-indigo-600 hover:text-indigo-800 font-mono text-sm"
        >
          {block.proposer}
        </Link>
      ),
    },
    { label: "Parent Hash", value: <span className="font-mono text-sm break-all">{block.parent_hash}</span> },
    { label: "State Root", value: <span className="font-mono text-sm break-all">{block.state_root}</span> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Block #{formatNumber(block.height)}
        </h1>
        <div className="flex gap-1">
          {block.height > 0 && (
            <Link
              href={`/block/${block.height - 1}`}
              className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              Prev
            </Link>
          )}
          <Link
            href={`/block/${block.height + 1}`}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            Next
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row border-b border-gray-100 last:border-0"
          >
            <div className="px-6 py-4 text-sm font-medium text-gray-500 sm:w-48 bg-gray-50">
              {row.label}
            </div>
            <div className="px-6 py-4 text-sm text-gray-900 flex-1">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
