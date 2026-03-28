"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePolling } from "@/hooks/useApi";
import type { createApi } from "@/lib/api";
import { IndexedEvent } from "@/lib/types";
import { truncateHash } from "@/lib/utils";
import { Loading, ErrorMessage } from "@/components/Loading";

export default function EventsPage() {
  const fetcher = useCallback(
    (api: ReturnType<typeof createApi>) => api.getEvents(50),
    []
  );
  const { data: events, loading, error } = usePolling<IndexedEvent[]>(fetcher);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Events</h1>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading && !events ? (
          <Loading />
        ) : events && events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Block</th>
                  <th className="pb-3 pr-4 font-medium">Tx Index</th>
                  <th className="pb-3 pr-4 font-medium">Emitter</th>
                  <th className="pb-3 font-medium">Topic</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <tr
                    key={`${event.block_height}-${event.tx_index}-${i}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/block/${event.block_height}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {event.block_height}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{event.tx_index}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/account/${event.emitter}`}
                        className="text-indigo-600 hover:text-indigo-800 font-mono text-xs"
                      >
                        {truncateHash(event.emitter)}
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-xs text-gray-600">
                      {event.topic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-gray-400">No events found</p>
        )}
      </div>
    </div>
  );
}
