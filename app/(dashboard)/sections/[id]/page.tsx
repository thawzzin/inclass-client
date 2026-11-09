'use client';

import { useParams } from 'next/navigation';

import { SectionDetail } from '@/src/features/academics/section-detail';

export default function SectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <SectionDetail id={id} />;
}
