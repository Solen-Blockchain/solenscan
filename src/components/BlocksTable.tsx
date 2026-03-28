"use client";

import Link from "next/link";
import { IndexedBlock } from "@/lib/types";
import { truncateHash, timeAgo, formatNumber } from "@/lib/utils";

interface BlocksTableProps {
  blocks: IndexedBlock[];
  compact?: boolean;
}

export function BlocksTable({ blocks, compact }: BlocksTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">Block</th>
            {!compact && <th className="pb-3 pr-4 font-medium">Epoch</th>}
            <th className="pb-3 pr-4 font-medium">Age</th>
            <th className="pb-3 pr-4 font-medium">Txns</th>
            <th className="pb-3 pr-4 font-medium">Gas Used</th>
            <th className="pb-3 font-medium">Proposer</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr
              key={block.height}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/block/${block.height}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {formatNumber(block.height)}
                </Link>
              </td>
              {!compact && (
                <td className="py-3 pr-4 text-gray-600">{block.epoch}</td>
              )}
              <td className="py-3 pr-4 text-gray-600">
                {timeAgo(block.timestamp_ms)}
              </td>
              <td className="py-3 pr-4 text-gray-600">{block.tx_count}</td>
              <td className="py-3 pr-4 text-gray-600">
                {formatNumber(block.gas_used)}
              </td>
              <td className="py-3">
                <Link
                  href={`/account/${block.proposer}`}
                  className="text-indigo-600 hover:text-indigo-800 font-mono text-xs"
                >
                  {truncateHash(block.proposer)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
