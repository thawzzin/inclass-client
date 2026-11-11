'use client';

import { useParams } from 'next/navigation';

import { AttendanceTakingPage } from '@/src/features/attendance/attendance-taking-page';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <AttendanceTakingPage id={id} />;
}
