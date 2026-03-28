"use client";

import { NetworkProvider } from "@/context/NetworkContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <NetworkProvider>{children}</NetworkProvider>;
}
