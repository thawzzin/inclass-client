'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useAuth } from '@/src/features/auth/auth-context';
import { teachersApi } from '@/src/features/teachers/teachers.api';
import { queryKeys } from '@/src/lib/api/query-keys';

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const teacher = useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => teachersApi.detail(id),
    enabled: user?.role === 'ADMIN',
  });
  const sections = useQuery({
    queryKey: [...queryKeys.teachers.detail(id), 'sections'],
    queryFn: () => teachersApi.assignedSections(id),
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN')
    return (
      <p className="text-sm text-zinc-500">
        You are not authorized to view teacher accounts.
      </p>
    );
  if (teacher.isLoading) return <LoadingState label="Loading teacher" />;
  if (teacher.isError || !teacher.data)
    return (
      <p className="text-sm text-zinc-500">Unable to load this teacher.</p>
    );

  return (
    <section className="space-y-6">
      <Link href="/teachers" className="text-sm underline">
        Back to teachers
      </Link>
      <div>
        <div className="ic-eyebrow">PEOPLE</div>
        <h1 className="text-2xl font-semibold">{teacher.data.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {teacher.data.email} · {teacher.data.status}
        </p>
      </div>
      <div>
        <h2 className="font-semibold">Assigned sections</h2>
        {sections.isLoading ? (
          <LoadingState label="Loading sections" compact />
        ) : sections.data?.length ? (
          <ul className="mt-2 divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
            {sections.data.map((section) => (
              <li key={section.id} className="p-3 text-sm">
                <Link
                  href={`/sections/${section.id}`}
                  className="font-medium underline"
                >
                  {section.course.code} · Section {section.sectionCode}
                </Link>
                <span className="ml-2 text-zinc-500">{section.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No assigned sections.</p>
        )}
      </div>
    </section>
  );
}
