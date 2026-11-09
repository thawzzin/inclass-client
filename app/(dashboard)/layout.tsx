import { AppHeader } from '@/src/components/layout/app-header';
import { AppSidebar } from '@/src/components/layout/app-sidebar';
import { AuthGate } from '@/src/components/layout/auth-gate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate><div className="flex min-h-screen"><AppSidebar /><div className="min-w-0 flex-1"><AppHeader /><main className="p-4 sm:p-6">{children}</main></div></div></AuthGate>;
}
