'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { queryKeys } from '@/src/lib/api/query-keys';
import { SectionAttendance } from '@/src/features/attendance/section-attendance';
import { EnrollmentManager } from '@/src/features/enrollments/enrollment-manager';

import { academicsApi } from './academics.api';

type Tab = 'overview' | 'students' | 'attendance';

export function SectionDetail({
  id,
  initialTab = 'overview',
}: {
  id: string;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const section = useQuery({
    queryKey: queryKeys.sections.detail(id),
    queryFn: () => academicsApi.section(id),
  });
  if (section.isLoading)
    return <p className="text-sm text-zinc-500">Loading section…</p>;
  if (section.isError || !section.data)
    return (
      <p className="text-sm text-zinc-500">Unable to load this section.</p>
    );
  const value = section.data;
  return (
    <section className="space-y-6">
      <Link href="/sections" className="text-sm underline">
        Back to sections
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">
          {value.course.code} · Section {value.sectionCode}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{value.course.name}</p>
      </div>
      <div
        role="tablist"
        aria-label="Section details"
        className="flex border-b border-zinc-200 dark:border-zinc-800"
      >
        {(['overview', 'students', 'attendance'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`px-4 py-2 text-sm capitalize ${tab === item ? 'border-b-2 border-zinc-950 font-medium dark:border-zinc-50' : 'text-zinc-500'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === 'overview' && (
        <dl className="grid gap-4 rounded-lg border border-zinc-200 p-5 text-sm sm:grid-cols-2 dark:border-zinc-800">
          <div>
            <dt className="text-zinc-500">Course</dt>
            <dd className="font-medium">
              {value.course.code} — {value.course.name}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Section code</dt>
            <dd className="font-medium">{value.sectionCode}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Assigned teacher</dt>
            <dd className="font-medium">{value.teacher.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="font-medium">{value.status}</dd>
          </div>
        </dl>
      )}
      {tab === 'students' && <EnrollmentManager sectionId={id} />}
      {tab === 'attendance' && <SectionAttendance sectionId={id} />}
    </section>
  );
}
