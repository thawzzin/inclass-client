import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DashboardLayout from './layout';

vi.mock('@/src/components/layout/auth-gate', () => ({
  AuthGate: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/src/components/layout/app-header', () => ({
  AppHeader: () => <header>Header</header>,
}));

vi.mock('@/src/components/layout/app-sidebar', () => ({
  AppSidebar: () => <aside>Sidebar</aside>,
}));

describe('DashboardLayout accessibility', () => {
  it('provides a keyboard shortcut to the main content', () => {
    render(
      <DashboardLayout>
        <h1>Dashboard</h1>
      </DashboardLayout>,
    );

    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
