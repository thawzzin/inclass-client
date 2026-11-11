import { SectionDetail } from '@/src/features/academics/section-detail';

export default async function SectionDetailPage({
  params,
  searchParams,
}: PageProps<'/sections/[id]'>) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <SectionDetail
      id={id}
      initialTab={query.tab === 'attendance' ? 'attendance' : 'overview'}
    />
  );
}
