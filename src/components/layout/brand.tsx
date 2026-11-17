import Link from 'next/link';

export function Brand({ linked = true }: { linked?: boolean }) {
  const content = (
    <>
      <span className="ic-logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M6 8.5 16 4l10 4.5v15L16 28 6 23.5v-15Z"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path
            d="m6.5 9 9.5 4.5L25.5 9M16 13.5V28"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path
            d="m10.5 18 3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="ic-brand-copy">
        InClass<small>ATTENDANCE SYSTEM</small>
      </span>
    </>
  );
  return linked ? (
    <Link className="ic-brand" href="/dashboard">
      {content}
    </Link>
  ) : (
    <div className="ic-brand">{content}</div>
  );
}
