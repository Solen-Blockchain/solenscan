"use client";

import Image from "next/image";
import Link from "next/link";
import { useNetwork } from "@/context/NetworkContext";
import { NetworkId, networks } from "@/lib/networks";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { networkId, setNetwork } = useNetwork();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="SolenScan"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-bold text-xl text-gray-900">
                SolenScan
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blocks"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blocks
              </Link>
              <Link
                href="/txs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/events"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Events
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <select
              value={networkId}
              onChange={(e) => setNetwork(e.target.value as NetworkId)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderLeftColor: networks[networkId].color, borderLeftWidth: 3 }}
            >
              {Object.values(networks).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
