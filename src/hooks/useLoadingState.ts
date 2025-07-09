"use client";

import { useState, useCallback } from "react";

interface LoadingState<T = unknown> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseLoadingStateReturn<T = unknown> extends LoadingState<T> {
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setData: (data: T | null) => void;
  reset: () => void;
  execute: <R = T>(asyncFunction: () => Promise<R>) => Promise<R | null>;
}

export function useLoadingState<T = unknown>(
  initialData: T | null = null,
): UseLoadingStateReturn<T> {
  const [state, setState] = useState<LoadingState<T>>({
    loading: false,
    error: null,
    data: initialData,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, loading: false, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: initialData,
    });
  }, [initialData]);

  const execute = useCallback(
    async <R = T>(asyncFunction: () => Promise<R>): Promise<R | null> => {
      try {
        setLoading(true);
        const result = await asyncFunction();
        setData(result as unknown as T);
        return result;
      } catch (error) {
        setError(error as Error);
        return null;
      }
    },
    [setLoading, setData, setError],
  );

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset,
    execute,
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates<T extends Record<string, unknown>>(
  keys: (keyof T)[],
): Record<keyof T, UseLoadingStateReturn> {
  const states: Partial<Record<keyof T, UseLoadingStateReturn>> = {};

  keys.forEach((key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    states[key] = useLoadingState();
  });

  return states as Record<keyof T, UseLoadingStateReturn>;
}
