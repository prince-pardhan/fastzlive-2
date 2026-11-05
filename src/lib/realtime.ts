/**
 * Fastzlive Real-Time Newsroom Client
 * Provides WebSocket and SSE real-time event synchronization across editors and readers
 */

export type RealtimeEventType =
  | 'init'
  | 'news:created'
  | 'news:updated'
  | 'news:deleted'
  | 'news:breaking_toggled'
  | 'news:featured_toggled'
  | 'news:auto_published'
  | 'categories:updated'
  | 'settings:updated'
  | 'presence:update'
  | 'notification';

export interface RealtimeEvent {
  type: RealtimeEventType;
  data?: any;
  message?: string;
  timestamp?: string;
}

export type RealtimeListener = (event: RealtimeEvent) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private isConnecting = false;
  private fallbackToSse = false;

  public isConnected = false;
  public transport: 'websocket' | 'sse' | 'disconnected' = 'disconnected';
  public activeEditors = 1;
  public activeReaders = 182;

  constructor() {
    // Autostart in browser
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public connect() {
    if (this.isConnecting || this.isConnected) return;
    this.isConnecting = true;

    if (!this.fallbackToSse && typeof WebSocket !== 'undefined') {
      this.connectWebSocket();
    } else {
      this.connectSSE();
    }
  }

  private connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Fastzlive Realtime] WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.transport = 'websocket';
        this.startHeartbeat();
        this.notifyStatus();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload: RealtimeEvent = JSON.parse(event.data);
          this.handleIncomingEvent(payload);
        } catch (e) {
          console.error('[Fastzlive Realtime] Parse error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Fastzlive Realtime] WebSocket notice, evaluating fallback');
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.transport = 'disconnected';
        this.stopHeartbeat();
        this.notifyStatus();

        // Switch to SSE fallback or retry
        if (!this.fallbackToSse) {
          this.fallbackToSse = true;
          this.connectSSE();
        } else {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.isConnecting = false;
      this.fallbackToSse = true;
      this.connectSSE();
    }
  }

  private connectSSE() {
    try {
      if (typeof EventSource === 'undefined') return;
      if (this.sse) this.sse.close();

      this.sse = new EventSource('/api/realtime/events');

      this.sse.onopen = () => {
        console.log('[Fastzlive Realtime] SSE Stream connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.transport = 'sse';
        this.notifyStatus();
      };

      this.sse.onmessage = (event) => {
        try {
          const payload: RealtimeEvent = JSON.parse(event.data);
          this.handleIncomingEvent(payload);
        } catch (e) {
          console.error('[Fastzlive Realtime] SSE parse error:', e);
        }
      };

      this.sse.onerror = () => {
        this.isConnected = false;
        this.transport = 'disconnected';
        this.notifyStatus();
        if (this.sse) {
          this.sse.close();
          this.sse = null;
        }
        this.scheduleReconnect();
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private handleIncomingEvent(event: RealtimeEvent) {
    if (event.type === 'presence:update') {
      if (event.data?.activeEditors) this.activeEditors = event.data.activeEditors;
      if (event.data?.activeReaders) this.activeReaders = event.data.activeReaders;
    }

    // Dispatch to all registered React listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[Fastzlive Realtime] Listener error:', err);
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyStatus() {
    this.handleIncomingEvent({
      type: 'presence:update',
      data: {
        activeEditors: this.activeEditors,
        activeReaders: this.activeReaders,
      },
    });
  }
}

export const realtime = new RealtimeClient();
