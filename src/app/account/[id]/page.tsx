"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNetwork } from "@/context/NetworkContext";
import { createApi } from "@/lib/api";
import { AccountInfo, IndexedTx } from "@/lib/types";
import { formatBalance, formatNumber, truncateHash } from "@/lib/utils";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Loading, ErrorMessage } from "@/components/Loading";

export default function AccountPage() {
  const params = useParams();
  const accountId = params.id as string;
  const { network } = useNetwork();

  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [txs, setTxs] = useState<IndexedTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"txs" | "info">("txs");

  useEffect(() => {
    let mounted = true;

    async function fetchAccount() {
      try {
        const api = createApi(network);
        const [accountInfo, accountTxs] = await Promise.allSettled([
          api.getAccount(accountId),
          api.getAccountTxs(accountId, 50),
        ]);

        if (mounted) {
          if (accountInfo.status === "fulfilled") {
            setAccount(accountInfo.value);
          }
          if (accountTxs.status === "fulfilled") {
            setTxs(accountTxs.value);
          }
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to fetch account");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAccount();
    const id = setInterval(fetchAccount, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [network, accountId]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="mt-1 font-mono text-sm text-gray-500 break-all">
          {accountId}
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {account && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatBalance(account.balance)} SOL
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Nonce</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatNumber(account.nonce)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Code Hash</p>
            <p className="mt-1 font-mono text-sm text-gray-900 break-all">
              {account.code_hash === "0".repeat(64) ? (
                <span className="text-gray-400">None (EOA)</span>
              ) : (
                truncateHash(account.code_hash, 16)
              )}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("txs")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "txs"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Transactions ({txs.length})
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Info
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "txs" ? (
            txs.length > 0 ? (
              <TransactionsTable transactions={txs} />
            ) : (
              <p className="py-8 text-center text-gray-400">
                No transactions found for this account
              </p>
            )
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Account ID
                </span>
                <p className="mt-1 font-mono text-sm break-all">{accountId}</p>
              </div>
              {account && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Balance (raw)
                    </span>
                    <p className="mt-1 font-mono text-sm">{account.balance}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Code Hash
                    </span>
                    <p className="mt-1 font-mono text-sm break-all">
                      {account.code_hash}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Account Type
                    </span>
                    <p className="mt-1 text-sm">
                      {account.code_hash === "0".repeat(64)
                        ? "Standard Account"
                        : "Smart Account (Contract)"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
