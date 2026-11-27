'use client';

import { LoadingState } from '@/src/components/ui/loading-state';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { StudentAttendanceHistory } from '@/src/features/attendance/student-attendance-history';
import { useAuth } from '@/src/features/auth/auth-context';
import { studentsApi } from '@/src/features/students/students.api';
import { queryKeys } from '@/src/lib/api/query-keys';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const student = useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsApi.detail(id),
    enabled: isAdmin,
  });

  if (!isAdmin)
    return (
      <p className="text-sm text-zinc-500">
        You are not authorized to view student details.
      </p>
    );
  if (student.isLoading) return <LoadingState label="Loading student" />;
  if (student.isError || !student.data)
    return (
      <p className="text-sm text-zinc-500">Unable to load this student.</p>
    );
  return (
    <section className="space-y-6">
      <Link
        href="/students"
        className="inline-flex items-center gap-2 text-sm underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to students
      </Link>
      <div>
        <div className="ic-eyebrow">PEOPLE</div>
        <h1 className="text-2xl font-semibold">{student.data.fullName}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {student.data.studentId}
          {student.data.nickname ? ` · ${student.data.nickname}` : ''} ·{' '}
          {student.data.status}
        </p>
      </div>
      <StudentAttendanceHistory studentId={id} />
    </section>
  );
}
