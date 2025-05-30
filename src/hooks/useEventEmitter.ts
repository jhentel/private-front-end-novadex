import {
  eventListeners,
  EventMap,
  EventName,
  EventPayloads,
  Listener,
} from "@/types/events";
import { useCallback, useEffect, useRef } from "react";

export const useEventEmitter = <T extends EventName>(
  eventName: T,
  listener: Listener<T>,
) => {
  const eventMapRef = useRef<EventMap>(eventListeners);
  const listenerRef = useRef<Listener<T>>(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const listeners = eventMapRef.current[eventName] || [];
    const wrappedListener = (payload: EventPayloads[T]) =>
      listenerRef.current(payload);
    listeners.push(wrappedListener as Listener<any>);

    if (!eventMapRef.current[eventName]) {
      eventMapRef.current[eventName] = listeners;
    }

    return () => {
      eventMapRef.current[eventName] = listeners.filter(
        (l) => l !== (wrappedListener as Listener<any>),
      );
      if (eventMapRef.current[eventName].length === 0) {
        delete eventMapRef.current[eventName];
      }
    };
  }, [eventName]);
};

export const useDispatchEvent = () => {
  const eventMapRef = useRef<EventMap>(eventListeners);

  const dispatchEvent = useCallback(
    <T extends EventName>(eventName: T, payload?: EventPayloads[T]) => {
      const listeners = eventMapRef.current[eventName] || [];
      listeners.forEach((listener) => listener(payload));
    },
    [],
  );

  return dispatchEvent;
};
