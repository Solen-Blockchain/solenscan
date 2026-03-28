"use client";

import Link from "next/link";
import { IndexedTx } from "@/lib/types";
import { truncateHash, formatNumber } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: IndexedTx[];
  compact?: boolean;
}

export function TransactionsTable({ transactions, compact }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">Block</th>
            <th className="pb-3 pr-4 font-medium">Index</th>
            <th className="pb-3 pr-4 font-medium">From</th>
            <th className="pb-3 pr-4 font-medium">Nonce</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Gas Used</th>
            {!compact && <th className="pb-3 font-medium">Events</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={`${tx.block_height}-${tx.index}`}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/block/${tx.block_height}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {formatNumber(tx.block_height)}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-600">{tx.index}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/account/${tx.sender}`}
                  className="text-indigo-600 hover:text-indigo-800 font-mono text-xs"
                >
                  {truncateHash(tx.sender)}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-600">{tx.nonce}</td>
              <td className="py-3 pr-4">
                {tx.success ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                    Success
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-600/20"
                    title={tx.error || undefined}
                  >
                    Failed
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {formatNumber(tx.gas_used)}
              </td>
              {!compact && (
                <td className="py-3 text-gray-600">{tx.events.length}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
