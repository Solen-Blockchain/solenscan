"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePolling } from "@/hooks/useApi";
import { useNetwork } from "@/context/NetworkContext";
import { createApi } from "@/lib/api";
import { ChainStatus, IndexedBlock } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { BlocksTable } from "@/components/BlocksTable";
import { Loading, ErrorMessage } from "@/components/Loading";

function BlockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function TxIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function HeightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function HomePage() {
  const { network } = useNetwork();

  const statusFetcher = useCallback(
    (api: ReturnType<typeof createApi>) => api.getStatus(),
    []
  );
  const blocksFetcher = useCallback(
    (api: ReturnType<typeof createApi>) => api.getBlocks(10),
    []
  );

  const {
    data: status,
    loading: statusLoading,
    error: statusError,
  } = usePolling<ChainStatus>(statusFetcher);

  const {
    data: blocks,
    loading: blocksLoading,
    error: blocksError,
  } = usePolling<IndexedBlock[]>(blocksFetcher);

  const error = statusError || blocksError;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Solen Blockchain Explorer
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Connected to{" "}
          <span
            className="font-medium"
            style={{ color: network.color }}
          >
            {network.name}
          </span>
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {statusLoading && !status ? (
        <Loading />
      ) : status ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Block Height"
            value={formatNumber(status.latest_height)}
            icon={<HeightIcon />}
          />
          <StatCard
            label="Total Blocks"
            value={formatNumber(status.total_blocks)}
            icon={<BlockIcon />}
          />
          <StatCard
            label="Total Transactions"
            value={formatNumber(status.total_txs)}
            icon={<TxIcon />}
          />
          <StatCard
            label="Total Events"
            value={formatNumber(status.total_events)}
            icon={<EventIcon />}
          />
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Blocks
          </h2>
          <Link
            href="/blocks"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View all
          </Link>
        </div>

        {blocksLoading && !blocks ? (
          <Loading />
        ) : blocks && blocks.length > 0 ? (
          <BlocksTable blocks={blocks} compact />
        ) : (
          <p className="py-8 text-center text-gray-400">No blocks yet</p>
        )}
      </div>
    </div>
  );
}
