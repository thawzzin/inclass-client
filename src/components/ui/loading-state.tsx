import { Skeleton } from '@/src/components/ui/skeleton';
import { cn } from '@/src/lib/utils';

export function LoadingState({
  label,
  compact = false,
  className,
}: {
  label: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        compact ? 'w-full max-w-sm space-y-2' : 'space-y-4',
        className,
      )}
    >
      <Skeleton
        className={cn(
          'motion-reduce:animate-none',
          compact ? 'h-4 w-28' : 'h-7 w-48',
        )}
      />
      <Skeleton
        className={cn(
          'motion-reduce:animate-none',
          compact ? 'h-4 w-full' : 'h-28 w-full rounded-xl',
        )}
      />
    </div>
  );
}
