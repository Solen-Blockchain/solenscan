import { NextRequest, NextResponse } from "next/server";
import { networks, NetworkId } from "@/lib/networks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const networkId = (request.headers.get("x-network") || "devnet") as NetworkId;
  const network = networks[networkId] || networks.devnet;
  const url = new URL(request.url);
  const target = `${network.explorerApiUrl}/${path.join("/")}${url.search}`;

  try {
    const res = await fetch(target, { cache: "no-store" });
    const text = await res.text();
    if (!res.ok || !text) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: res.status || 502 }
      );
    }
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to reach Solen node" }, { status: 502 });
  }
}
