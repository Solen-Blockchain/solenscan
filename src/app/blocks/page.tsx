"use client";

import { useCallback } from "react";
import { usePolling } from "@/hooks/useApi";
import { createApi } from "@/lib/api";
import { IndexedBlock } from "@/lib/types";
import { BlocksTable } from "@/components/BlocksTable";
import { Loading, ErrorMessage } from "@/components/Loading";

export default function BlocksPage() {
  const fetcher = useCallback(
    (api: ReturnType<typeof createApi>) => api.getBlocks(50),
    []
  );
  const { data: blocks, loading, error } = usePolling<IndexedBlock[]>(fetcher);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Blocks</h1>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading && !blocks ? (
          <Loading />
        ) : blocks && blocks.length > 0 ? (
          <BlocksTable blocks={blocks} />
        ) : (
          <p className="py-8 text-center text-gray-400">No blocks found</p>
        )}
      </div>
    </div>
  );
}
