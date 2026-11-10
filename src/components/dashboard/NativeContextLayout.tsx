import type { ReactNode } from 'react';
import { BrandMark } from '@/components/BrandMark';

/**
 * Chrome for dashboard pages opened from the mobile app (lib/native-context.ts):
 * no sidebar, header menu or links, so the page the app opened is the whole
 * page. The content (form, save, auth) is the page's own and is unchanged.
 */
export default function NativeContextLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background" data-testid="native-context-layout">
      <header className="border-b px-4 py-3 flex items-center gap-2.5">
        <BrandMark size={28} />
        <span className="font-display font-semibold">Indigenous Rising</span>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-4">
        <p className="text-sm text-muted-foreground">When you are done, close this window to return to the app.</p>
        {children}
      </main>
    </div>
  );
}
