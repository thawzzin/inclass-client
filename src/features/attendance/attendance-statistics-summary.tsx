import { attendancePercentageLabel } from './attendance-report';
import type { AttendanceStatistics } from '@/src/lib/api/types';

export function AttendanceStatisticsSummary({ statistics }: { statistics: AttendanceStatistics }) {
  const values = [
    ['Attendance', attendancePercentageLabel(statistics.attendancePercentage)],
    ['Present', statistics.present],
    ['Absent', statistics.absent],
    ['Late', statistics.late],
    ['Unmarked', statistics.unmarked],
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {values.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <dt className="text-sm text-zinc-500">{label}</dt>
          <dd className="mt-1 text-xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
