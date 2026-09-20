import { useEffect, useRef } from 'react';

/**
 * True while the component is mounted.
 *
 * Dashboard pages load over the network and the user can navigate away, sign
 * out, or (in tests) have the environment torn down before the request
 * settles. React 18 ignores a state update on an unmounted component
 * silently in a browser, but in a torn-down test environment it throws
 * "window is not defined" as an unhandled rejection — which failed CI twice
 * while every test passed.
 *
 *   const mounted = useMountedRef();
 *   ...
 *   if (!mounted.current) return;
 *   setThing(value);
 */
export function useMountedRef() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return mounted;
}
