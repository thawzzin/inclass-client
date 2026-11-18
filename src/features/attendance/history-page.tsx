'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { Button } from '@/src/components/ui/button';
import { Alert, AlertDescription } from '@/src/components/ui/alert';

import { useQuery } from '@tanstack/react-query';

import { academicsApi } from '@/src/features/academics/academics.api';
import { queryKeys } from '@/src/lib/api/query-keys';
import { AttendanceReportPanel } from './attendance-report-panel';

export function HistoryPage() {
  const sections = useQuery({
    queryKey: queryKeys.sections.all,
    queryFn: academicsApi.sections,
  });
  return (
    <div>
      <div className="ic-page-heading">
        <div>
          <div className="ic-eyebrow">ATTENDANCE</div>
          <h1>Attendance history</h1>
          <p>Review records across your sections and export them.</p>
        </div>
      </div>
      {sections.isLoading ? (
        <LoadingState label="Loading sections" compact />
      ) : sections.isError ? (
        <Alert variant="destructive" className="ic-panel">
          <AlertDescription>Unable to load sections.</AlertDescription>
          <Button type="button" onClick={() => void sections.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : (
        <AttendanceReportPanel sections={sections.data ?? []} />
      )}
    </div>
  );
}
