import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Providers } from './providers';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const previewImage = `${protocol}://${host}/preview.png`;

  return {
    title: 'InClass',
    description: 'University attendance management',
    openGraph: {
      url: `${protocol}://${host}/dashboard`,
      title: 'InClass',
      description: 'University attendance management',
      type: 'website',
      images: [
        {
          url: previewImage,
          width: 2940,
          height: 1666,
          alt: 'InClass preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'InClass',
      description: 'University attendance management',
      images: [previewImage],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
