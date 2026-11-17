'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { academicsApi } from '@/src/features/academics/academics.api';
import { queryKeys } from '@/src/lib/api/query-keys';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => academicsApi.course(id),
  });
  const sections = useQuery({
    queryKey: queryKeys.sections.all,
    queryFn: academicsApi.sections,
  });
  if (course.isLoading)
    return <p className="text-sm text-zinc-500">Loading course…</p>;
  if (course.isError || !course.data)
    return <p className="text-sm text-zinc-500">Unable to load this course.</p>;
  const related =
    sections.data?.filter((section) => section.courseId === id) ?? [];
  return (
    <section className="space-y-6">
      <Link href="/courses" className="text-sm underline">
        Back to courses
      </Link>
      <div>
        <div className="ic-eyebrow">ACADEMICS</div>
        <h1 className="text-2xl font-semibold">
          {course.data.code} — {course.data.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{course.data.status}</p>
      </div>
      <div>
        <h2 className="font-semibold">Sections</h2>
        {sections.isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Loading sections…</p>
        ) : related.length ? (
          <ul className="mt-2 divide-y rounded-lg border border-zinc-200 dark:border-zinc-800">
            {related.map((section) => (
              <li key={section.id} className="p-3 text-sm">
                <Link
                  href={`/sections/${section.id}`}
                  className="font-medium underline"
                >
                  Section {section.sectionCode}
                </Link>
                <span className="ml-2 text-zinc-500">
                  {section.teacher.name} · {section.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            No sections belong to this course.
          </p>
        )}
      </div>
    </section>
  );
}
