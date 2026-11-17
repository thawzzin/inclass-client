import { AppHeader } from '@/src/components/layout/app-header';
import { AppSidebar } from '@/src/components/layout/app-sidebar';
import { AuthGate } from '@/src/components/layout/auth-gate';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0 dark:bg-zinc-50 dark:text-zinc-950"
      >
        Skip to main content
      </a>
      <div className="ic-app">
        <AppSidebar />
        <div className="ic-workspace">
          <AppHeader />
          <main id="main-content" tabIndex={-1} className="ic-content">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
