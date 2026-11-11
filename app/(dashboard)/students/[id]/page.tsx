'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { StudentAttendanceHistory } from '@/src/features/attendance/student-attendance-history';
import { studentsApi } from '@/src/features/students/students.api';
import { queryKeys } from '@/src/lib/api/query-keys';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const student = useQuery({ queryKey: queryKeys.students.detail(id), queryFn: () => studentsApi.detail(id) });
  if (student.isLoading) return <p className="text-sm text-zinc-500">Loading student…</p>;
  if (student.isError || !student.data) return <p className="text-sm text-zinc-500">Unable to load this student.</p>;
  return <section className="space-y-6"><Link href="/students" className="text-sm underline">Back to students</Link><div><h1 className="text-2xl font-semibold">{student.data.fullName}</h1><p className="mt-1 text-sm text-zinc-500">{student.data.studentId}{student.data.nickname ? ` · ${student.data.nickname}` : ''} · {student.data.status}</p></div><StudentAttendanceHistory studentId={id} /></section>;
}
