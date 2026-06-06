import { useEffect, useRef, useState, useCallback } from 'react';

export type WSMessageType = 'new_metrics' | 'new_alert' | 'alert_updated' | 'alerts';

export interface WSMessage {
  type: WSMessageType;
  data: any;
}

const WS_URL = 'ws://localhost:4000/ws';
const RECONNECT_INTERVAL = 3000;

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (reconnectTimerRef.current) {
        clearInterval(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (shouldReconnectRef.current && !reconnectTimerRef.current) {
        reconnectTimerRef.current = setInterval(() => {
          connect();
        }, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    };
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearInterval(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { lastMessage, connected, send };
}

export default useWebSocket;
