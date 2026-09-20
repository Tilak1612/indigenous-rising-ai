import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { useMountedRef } from '@/hooks/useMountedRef';

describe('useMountedRef', () => {
  test('true while mounted, false after unmount', () => {
    const { result, unmount } = renderHook(() => useMountedRef());
    expect(result.current.current).toBe(true);
    unmount();
    expect(result.current.current).toBe(false);
  });

  test('ReadinessWorkspace guards its state updates with it', () => {
    // CI failed on this file: every test passed, but a load resolving after
    // teardown updated state and threw "window is not defined".
    const src = readFileSync('src/pages/dashboard/ReadinessWorkspace.tsx', 'utf8');
    expect(src).toMatch(/const mounted = useMountedRef\(\);/);
    expect(src).toMatch(/if \(mounted\.current\) setLoading\(false\);/);
    expect(src).toMatch(/if \(!mounted\.current\) return;/);
  });
});
