"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNetwork } from "@/context/NetworkContext";
import { createApi } from "@/lib/api";

export function useApi() {
  const { network } = useNetwork();
  return createApi(network);
}

export function usePolling<T>(
  fetcher: (api: ReturnType<typeof createApi>) => Promise<T>,
  intervalMs = 3000
) {
  const { network } = useNetwork();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const api = createApi(network);
      const result = await fetcher(api);
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [network, fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, error, loading };
}
