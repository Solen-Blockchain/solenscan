import { NextRequest, NextResponse } from "next/server";
import { networks, NetworkId } from "@/lib/networks";

export async function POST(request: NextRequest) {
  const networkId = (request.headers.get("x-network") || "devnet") as NetworkId;
  const network = networks[networkId] || networks.devnet;
  const body = await request.json();

  try {
    const res = await fetch(network.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: body.id, error: { code: -32000, message: "Failed to reach Solen node" } },
      { status: 502 }
    );
  }
}
