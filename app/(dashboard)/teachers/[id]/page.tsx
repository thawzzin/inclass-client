'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

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
      <Link
        href="/teachers"
        className="mb-5 inline-flex items-center gap-2 text-sm underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to teachers
      </Link>
      <div>
        <div className="ic-eyebrow">PEOPLE</div>
        <h1 className="text-2xl font-semibold">{teacher.data.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {teacher.data.email} · {teacher.data.status}
        </p>
      </div>
      <section className="ic-panel" aria-labelledby="assigned-sections-title">
        <div className="ic-panel-head">
          <div>
            <p className="ic-eyebrow">TEACHING</p>
            <h2 id="assigned-sections-title">Assigned sections</h2>
          </div>
          {sections.data && (
            <span className="text-sm text-muted-foreground">
              {sections.data.length} total
            </span>
          )}
        </div>
        {sections.isLoading ? (
          <LoadingState label="Loading sections" compact />
        ) : sections.isError ? (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Unable to load assigned sections.
            </p>
            <Button type="button" onClick={() => void sections.refetch()}>
              Retry
            </Button>
          </div>
        ) : sections.data?.length ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sections.data.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/sections/${section.id}`}
                  className="ic-section-card group flex h-full flex-col justify-between gap-5"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="ic-eyebrow block">
                        {section.course.code}
                      </span>
                      <strong className="mt-2 block text-base text-foreground">
                        Section {section.sectionCode}
                      </strong>
                    </span>
                    <Badge
                      className={`ic-status ${section.status === 'INACTIVE' ? 'ic-status-inactive' : ''}`}
                    >
                      {section.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </span>
                  <span className="flex items-end justify-between gap-3 border-t border-border pt-4">
                    <span className="min-w-0 text-sm text-muted-foreground">
                      {section.course.name}
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No sections are assigned to this teacher.
          </p>
        )}
      </section>
    </section>
  );
}
