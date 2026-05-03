import { useState, useEffect, useRef } from 'react';
import { ArcNetworkData } from '../types';
import { getNetworkStatus } from '../services/arcService';

export function useArcData(pollIntervalMs = 3000) {
  const [data, setData] = useState<ArcNetworkData>({
    blockNumber: null,
    gasPrice: null,
    isConnected: false,
    latency: null,
    tps: null,
    lastUpdated: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    try {
      const status = await getNetworkStatus();
      setData({
        blockNumber: status.blockNumber,
        gasPrice: status.gasPrice,
        isConnected: status.isConnected,
        latency: status.latency,
        tps: status.tps,
        lastUpdated: Date.now(),
      });
    } catch {
      setData(prev => ({ ...prev, isConnected: false }));
    }
  };

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, pollIntervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pollIntervalMs]);

  return data;
}
