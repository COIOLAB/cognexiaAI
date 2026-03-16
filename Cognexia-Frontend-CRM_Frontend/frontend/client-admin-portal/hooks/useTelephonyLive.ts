'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * useTelephonyLive
 * - Connects to a WebSocket at NEXT_PUBLIC_WS_URL (e.g., wss://api.example.com/telephony)
 * - Expects JSON messages like { event: 'call.updated' | 'call.created' | 'call.ended' | 'queue.updated', data: any }
 * - On relevant events, invalidates React Query caches to refresh UI in near real-time
 */
export function useTelephonyLive() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_WS_URL; // e.g. wss://api.mycorp.com/telephony
    if (!base || typeof window === 'undefined') return;

    // try to append token from localStorage if present
    let url = base;
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        const sep = base.includes('?') ? '&' : '?';
        url = `${base}${sep}token=${encodeURIComponent(token)}`;
      }
    } catch {}

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      // Optionally announce subscriptions
      ws.send(JSON.stringify({ type: 'subscribe', channels: ['calls', 'queues'] }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const ev: string = msg.event || msg.type;
        if (!ev) return;
        if (ev.startsWith('call.')) {
          // Update call-related queries
          queryClient.invalidateQueries({ queryKey: ['calls'] });
          queryClient.invalidateQueries({ queryKey: ['calls', 'active'] });
        }
        if (ev.startsWith('queue.')) {
          queryClient.invalidateQueries({ queryKey: ['queues'] });
        }
      } catch (e) {
        // ignore
      }
    };

    ws.onerror = () => setError('WebSocket error');
    ws.onclose = () => setConnected(false);

    return () => {
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
  }, [queryClient]);

  return { connected, error };
}
