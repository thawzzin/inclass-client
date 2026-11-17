import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { academicsApi } from '@/src/features/academics/academics.api';
import { HistoryPage } from './history-page';

vi.mock('@/src/features/academics/academics.api', () => ({
  academicsApi: { sections: vi.fn() },
}));
vi.mock('./attendance-report-panel', () => ({
  AttendanceReportPanel: () => <div>Record filters and export</div>,
}));

describe('HistoryPage', () => {
  it('shows the history report after loading sections', async () => {
    vi.mocked(academicsApi.sections).mockResolvedValue([]);
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <HistoryPage />
      </QueryClientProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Attendance history' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Record filters and export'),
    ).toBeInTheDocument();
  });
});
