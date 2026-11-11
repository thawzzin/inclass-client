'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';

import { academicsApi } from '@/src/features/academics/academics.api';
import { queryKeys } from '@/src/lib/api/query-keys';

export function AttendancePage() {
  const sections = useQuery({
    queryKey: queryKeys.sections.all,
    queryFn: academicsApi.sections,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Select a section to create or open its daily attendance session.
        </p>
      </div>
      {sections.isLoading ? (
        <p className="text-sm text-zinc-500">Loading sections…</p>
      ) : sections.isError || !sections.data ? (
        <button type="button" onClick={() => void sections.refetch()} className="text-sm underline">
          Unable to load sections. Retry
        </button>
      ) : sections.data.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {sections.data.map((section) => (
            <li key={section.id}>
              <Link
                href={`/sections/${section.id}?tab=attendance`}
                className="flex min-h-24 items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div>
                  <p className="font-medium">
                    {section.course.code} · Section {section.sectionCode}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{section.course.name}</p>
                </div>
                <CalendarCheck className="size-5 text-zinc-500" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
          No sections are available.
        </p>
      )}
    </section>
  );
}
