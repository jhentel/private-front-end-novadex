import { getServerTime } from "@/apis/rest/settings/server-time";
import sentryLogger from "@/utils/sentry/SentryLogger";

type OpenHandler = () => void;
type MessageHandler = (data: any) => void;
type CloseHandler = (event: CloseEvent) => void;
type ErrorHandler = (event: Event) => void;
type ConnectionStateHandler = (isConnected: boolean) => void;
type WebSocketStatus = "connected" | "connecting" | "closing" | "disconnected" | "unknown";

const getSocketStatus = (socket: WebSocket | null): WebSocketStatus => {
  if (!socket) return "disconnected";
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "connected";
    case WebSocket.CLOSING:
      return "closing";
    case WebSocket.CLOSED:
      return "disconnected";
    default:
      return "unknown";
  }
};

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private openHandlers = new Set<OpenHandler>();
  private messageHandlers = new Set<MessageHandler>();
  private closeHandlers = new Set<CloseHandler>();
  private errorHandlers = new Set<ErrorHandler>();
  private connectionStateHandlers = new Set<ConnectionStateHandler>();
  private reconnectAttempts = 0;
  private reconnectDelay = 1000;
  private url: string = "";
  private shouldReconnect = true;
  private isConnected: boolean = false;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: number = 4000;
  private messageQueue: Map<string, any> = new Map();
  private isConnecting: boolean = false;
  private lastMessageTimestamp: number = Date.now();
  private staleConnectionTimeout: number = 16000;
  private token?: string;

  private constructor() { }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private cleanUp(): void {
    // clearing heartbeat timeouts
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    // remove websocket
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      this.socket = null;
    }
  }

  private startHeartbeat(): void {
    /* console.log("WS MANAGER - start heartbeat...") */
    if (this.heartbeatTimeout) clearInterval(this.heartbeatTimeout);

    this.heartbeatTimeout = setInterval(async () => {
      const now = Date.now();
      const diff = now - this.lastMessageTimestamp;

      const shouldReconnect = diff > this.staleConnectionTimeout;

      if (shouldReconnect) {
        const healthy = await this.isServerHealthy();
        if (healthy) {
          console.warn("💓 Heartbeat detected stale connection — reconnecting...");
          this.internalConnect();
        } else {
          console.warn("💓 Heartbeat detected stale connection but server is unhealthy — skipping reconnect.");
        }
      }
    }, this.heartbeatInterval);
  }

  private updateConnectionState(connected: boolean): void {
    /* console.log("WS MANAGER - update connection state ", connected) */
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.connectionStateHandlers.forEach((handler) => handler(connected));
    }
  }

  private async isServerHealthy(): Promise<boolean> {
    try {
      const response = await getServerTime();
      return !!response;
    } catch {
      return false;
    }
  }

  private flushMessageQueue(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      for (const [_, msg] of this.messageQueue) {
        const msgWithToken = {
          ...msg,
          token: this.token,
        };
        /* console.log("WS MANAGER - queuing messages", msgWithToken) */;
        this.socket.send(JSON.stringify(msgWithToken));
      }
      this.messageQueue.clear();
    }
  }

  private getMessageKey(message: any): string {
    if (!message) return Math.random().toString(36).substring(2, 10);

    const channel = message.channel ?? '';
    const action = message.action ?? '';

    const key = channel + action;

    return key || JSON.stringify(message);
  }

  private internalConnect(): void {
    if (this.url === "" || this.isConnecting || this.isConnected || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.isConnecting = true;
    this.cleanUp();
    this.updateConnectionState(false);

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      /* console.log("WS MANAGER - connected") */
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.isConnected = true;
      this.updateConnectionState(true);
      this.startHeartbeat();
      this.openHandlers.forEach((handler) => handler());
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // flush message queue
      this.flushMessageQueue()
    };

    this.socket.onmessage = (event) => {
      try {
        this.lastMessageTimestamp = Date.now();
        const data = JSON.parse(event.data);
        if (data.event === "server_shutdown" && data.code === 1012) {
          console.warn("⚠️ Server shutdown detected, closing socket to trigger reconnect.");
          this.shouldReconnect = true;
          this.socket?.close();
          return;
        }
        this.messageHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    this.socket.onclose = async (event) => {
      /* console.log("WS MANAGER - closing...") */
      this.isConnecting = false;
      this.updateConnectionState(false);

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.shouldReconnect) {
        const tryReconnect = async () => {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;

          const healthy = await this.isServerHealthy();
          console.warn("💓 HEALTHY ✅", healthy, this.reconnectAttempts, delay);

          if (healthy) {
            this.internalConnect();
          } else {
            this.reconnectTimeout = setTimeout(tryReconnect, delay);
          }
        };

        tryReconnect();
      }

      /* console.log("WS MANAGER - closed") */
      sentryLogger({
        title: "WebSocket closed",
        context: {
          details: {
            ...event,
          },
          time: new Date().toLocaleTimeString(),
        },
        level: "error",
      })
      this.closeHandlers.forEach((handler) => handler(event));
    };

    this.socket.onerror = (error) => {
      sentryLogger({
        title: "WebSocket error",
        context: {
          details: {
            ...error,
          },
          time: new Date().toLocaleTimeString(),
        },
        level: "error",
      })

      /* console.log("WS MANAGER - onerror...") */
      this.isConnecting = false;
      this.errorHandlers.forEach((handler) => handler(error));
      console.error("WebSocket error:", error);
    };
  }

  public onOpen(handler: OpenHandler): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onClose(handler: CloseHandler): () => void {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  public onConnectionStateChange(handler: ConnectionStateHandler): () => void {
    this.connectionStateHandlers.add(handler);
    handler(this.isConnected); // Initial state
    return () => this.connectionStateHandlers.delete(handler);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanUp();
    this.updateConnectionState(false);
  }

  public send(message: any): void {
    const messageWithToken = {
      ...message,
      token: this.token,
    };

    const messageKey = this.getMessageKey(messageWithToken);

    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(messageWithToken));
    } else {
      this.messageQueue.set(messageKey, messageWithToken);
      this.internalConnect();
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getConnectionStatus(): WebSocketStatus {
    const { socket } = this
    return getSocketStatus(socket);
  }

  public connect({ url, token }: { url: string, token?: string }): void {
    /* console.log("WS MANAGER - connecting...") */
    this.url = url;
    this.token = token;
    this.shouldReconnect = true;
    this.internalConnect();
  }
}

export const webSocketManager = WebSocketManager.getInstance();
