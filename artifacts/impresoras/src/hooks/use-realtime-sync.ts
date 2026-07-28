import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { getListPrintersQueryKey, getGetPrinterStatsQueryKey } from '@workspace/api-client-react';

export function useRealtimeSync(queryClient: QueryClient) {
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}/ws`;

      ws = new WebSocket(url);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && ['created', 'deleted', 'cleared'].includes(data.type)) {
            queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
          }
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [queryClient]);
}
