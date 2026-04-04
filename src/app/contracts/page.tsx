"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useNetwork } from "@/context/NetworkContext";
import { createApi } from "@/lib/api";
import { truncateHash } from "@/lib/utils";
import { Loading } from "@/components/Loading";

interface ContractInfo {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  isSrc20: boolean;
}

export default function ContractsPage() {
  const { network } = useNetwork();
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const api = createApi(network);

    api.getContracts().then(async (ids) => {
      const infos = await Promise.all(
        ids.map(async (id) => {
          try {
            const [nameRes, symbolRes, supplyRes] = await Promise.all([
              api.callView(id, "name").catch(() => null),
              api.callView(id, "symbol").catch(() => null),
              api.callView(id, "total_supply").catch(() => null),
            ]);

            const name = nameRes?.success
              ? new TextDecoder().decode(hexToBytes(nameRes.return_data))
              : "";
            const symbol = symbolRes?.success
              ? new TextDecoder().decode(hexToBytes(symbolRes.return_data))
              : "";
            const isSrc20 = !!(supplyRes?.success && supplyRes.return_data.length === 32);
            const totalSupply = isSrc20
              ? bytesToU128(hexToBytes(supplyRes!.return_data)).toString()
              : "";

            return { id, name, symbol, totalSupply, isSrc20 };
          } catch {
            return { id, name: "", symbol: "", totalSupply: "", isSrc20: false };
          }
        })
      );

      if (mounted) {
        setContracts(infos);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [network]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Deployed Contracts</h1>

      {loading ? (
        <Loading />
      ) : contracts.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 py-12">No contracts deployed yet</p>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-slate-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contract</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Supply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4">
                    <Link
                      href={`/account/${c.id}`}
                      className="font-mono text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {truncateHash(c.id, 10)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.isSrc20
                        ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {c.isSrc20 ? "SRC-20" : "Contract"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {c.name || "—"}
                    {c.symbol && (
                      <span className="ml-1 text-gray-400 dark:text-gray-500">({c.symbol})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-gray-900 dark:text-gray-100">
                    {c.totalSupply ? Number(c.totalSupply).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToU128(bytes: Uint8Array): bigint {
  let value = BigInt(0);
  for (let i = Math.min(bytes.length, 16) - 1; i >= 0; i--) {
    value = (value << BigInt(8)) | BigInt(bytes[i]);
  }
  return value;
}
