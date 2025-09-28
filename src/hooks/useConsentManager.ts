import { useEffect, useRef, useCallback } from "react";
import { useConsent } from "@/contexts/ConsentContext";

type ConsentEventType =
  | "consent:accepted"
  | "consent:rejected"
  | "consent:updated"
  | "banner:shown"
  | "banner:hidden"
  | "settings:opened"
  | "settings:closed";

type ConsentEventListener = (data?: unknown) => void;

interface ConsentEventManager {
  on: (event: ConsentEventType, listener: ConsentEventListener) => () => void;
  off: (event: ConsentEventType, listener: ConsentEventListener) => void;
  emit: (event: ConsentEventType, data?: unknown) => void;
}

/**
 * Advanced hook that provides event-driven consent management
 */
export function useConsentManager(): ConsentEventManager &
  ReturnType<typeof useConsent> {
  const consent = useConsent();
  const listenersRef = useRef<Map<ConsentEventType, Set<ConsentEventListener>>>(
    new Map(),
  );
  const previousStateRef = useRef({
    hasUserConsented: consent.hasUserConsented,
    showBanner: consent.showBanner,
    showSettings: consent.showSettings,
    consentState: consent.consentState,
  });

  // Event emitter implementation
  const emit = useCallback((event: ConsentEventType, data?: unknown) => {
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }, []);

  const on = useCallback(
    (event: ConsentEventType, listener: ConsentEventListener) => {
      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }
      listenersRef.current.get(event)!.add(listener);

      // Return unsubscribe function
      return () => {
        const listeners = listenersRef.current.get(event);
        if (listeners) {
          listeners.delete(listener);
        }
      };
    },
    [],
  );

  const off = useCallback(
    (event: ConsentEventType, listener: ConsentEventListener) => {
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    },
    [],
  );

  // Track state changes and emit events
  useEffect(() => {
    const prev = previousStateRef.current;

    // Check for consent acceptance
    if (!prev.hasUserConsented && consent.hasUserConsented) {
      const allAccepted = Object.entries(consent.consentState)
        .filter(([key]) => key !== "necessary")
        .every(([, value]) => value);

      if (allAccepted) {
        emit("consent:accepted", consent.consentState);
      } else {
        emit("consent:rejected", consent.consentState);
      }
    }

    // Check for consent updates
    if (
      prev.hasUserConsented &&
      consent.hasUserConsented &&
      JSON.stringify(prev.consentState) !== JSON.stringify(consent.consentState)
    ) {
      emit("consent:updated", consent.consentState);
    }

    // Check for banner visibility changes
    if (!prev.showBanner && consent.showBanner) {
      emit("banner:shown");
    } else if (prev.showBanner && !consent.showBanner) {
      emit("banner:hidden");
    }

    // Check for settings visibility changes
    if (!prev.showSettings && consent.showSettings) {
      emit("settings:opened");
    } else if (prev.showSettings && !consent.showSettings) {
      emit("settings:closed");
    }

    // Update previous state
    previousStateRef.current = {
      hasUserConsented: consent.hasUserConsented,
      showBanner: consent.showBanner,
      showSettings: consent.showSettings,
      consentState: { ...consent.consentState },
    };
  }, [consent, emit]);

  return {
    ...consent,
    on,
    off,
    emit,
  };
}
