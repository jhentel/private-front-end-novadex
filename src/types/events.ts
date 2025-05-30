// Define event names as a const object with clear naming
export const EventNames = {
  DisconnectWallet: "disconnectWallet",
} as const;

// Extract event name type from the const object
export type EventName = (typeof EventNames)[keyof typeof EventNames];

// Define event payloads with clear interface structure
export interface EventPayloads {
  [EventNames.DisconnectWallet]: null;
  // sample if we need parameter

  // [EventNames.DisconnectWallet]: {
  //   reason: string;
  // };
}

// Type for event listeners with generic constraint
type EventListener<T extends EventName> = (payload: EventPayloads[T]) => void;

// Type for event map using Record utility
type EventListenerMap = Record<string, EventListener<any>[]>;

// Centralized event map with clear naming
export const eventListeners: EventListenerMap = {};

export type Listener<T extends EventName> = (payload: EventPayloads[T]) => void;
export type EventMap = Record<string, Listener<any>[]>;
