import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  reload: () => Promise<void>;
}

const message = (e: unknown) => (e as Error)?.message ?? 'Something went wrong';

/**
 * Load once per `deps` key, expose reload for pull-to-refresh and focus.
 * `loading` is derived (the stored result's key differs from the current
 * key), so no state is set synchronously inside the effect.
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const key = JSON.stringify(deps);
  const [result, setResult] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Always call the latest loader without making it an effect dependency.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let active = true;
    loadRef.current().then(
      (data) => active && setResult({ key, data, error: null }),
      (e) => active && setResult((prev) => ({ key, data: prev.data, error: message(e) })),
    );
    return () => {
      active = false;
    };
  }, [key]);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await loadRef.current();
      setResult({ key, data, error: null });
    } catch (e) {
      setResult((prev) => ({ key, data: prev.data, error: message(e) }));
    } finally {
      setRefreshing(false);
    }
  }, [key]);

  return { data: result.data, error: result.error, loading: result.key !== key, refreshing, reload };
}
