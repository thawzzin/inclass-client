import { getCloudflareContext } from '@opennextjs/cloudflare';

async function forward(request: Request): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('forwarded');
  headers.delete('x-forwarded-for');
  headers.delete('x-real-ip');
  const localDevelopment = process.env.NODE_ENV === 'development';
  const target = new URL(request.url);
  if (localDevelopment) target.host = 'localhost:4000';
  if (localDevelopment) target.protocol = 'http:';
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const forwarded = new Request(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    ...(hasBody && request.body ? { duplex: 'half' as const } : {}),
  } as RequestInit);
  if (localDevelopment) return fetch(forwarded);
  return getCloudflareContext().env.API.fetch(forwarded);
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const HEAD = forward;
export const OPTIONS = forward;
