"use client";

import { useNetwork } from "@/context/NetworkContext";

export function NetworkBanner() {
  const { networkId, network } = useNetwork();

  if (networkId === "mainnet") return null;

  return (
    <div
      className="text-center text-xs font-medium py-1 text-white"
      style={{ backgroundColor: network.color }}
    >
      You are viewing the {network.name}
    </div>
  );
}
