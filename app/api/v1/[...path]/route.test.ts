import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const fetchBackend = vi.fn();
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: () => ({ env: { API: { fetch: fetchBackend } } }),
}));

import { GET, POST } from './route';

describe('same-origin API proxy', () => {
  beforeEach(() => fetchBackend.mockReset());
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('forwards cookies and responses without client-controlled proxy headers', async () => {
    const backendResponse = new Response('ok', {
      headers: {
        'set-cookie': 'inclass_access=token; HttpOnly; Secure; SameSite=Lax',
      },
    });
    fetchBackend.mockResolvedValue(backendResponse);
    const request = new NextRequest(
      'https://inclass-client.example.workers.dev/api/v1/auth/me',
      {
        headers: {
          cookie: 'inclass_access=token',
          'x-forwarded-for': 'spoofed',
        },
      },
    );

    const response = await GET(request);
    const forwarded = fetchBackend.mock.calls[0]?.[0] as Request;
    expect(forwarded.headers.get('cookie')).toBe('inclass_access=token');
    expect(forwarded.headers.has('x-forwarded-for')).toBe(false);
    expect(response.headers.get('set-cookie')).toBe(
      'inclass_access=token; HttpOnly; Secure; SameSite=Lax',
    );
  });

  it('forwards the request body and method', async () => {
    fetchBackend.mockResolvedValue(new Response(null, { status: 204 }));
    const request = new NextRequest(
      'https://inclass-client.example.workers.dev/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'test' }),
      },
    );

    await POST(request);
    const forwarded = fetchBackend.mock.calls[0]?.[0] as Request;
    expect(forwarded.method).toBe('POST');
    expect(await forwarded.text()).toContain('admin@example.com');
  });

  it('accepts a request object from a different Request implementation', async () => {
    fetchBackend.mockResolvedValue(new Response('ok'));
    const incoming = {
      url: 'https://inclass-client.example.workers.dev/api/v1/auth/me',
      method: 'GET',
      headers: new Headers({ cookie: 'inclass_access=token' }),
      body: null,
    } as Request;

    await GET(incoming);
    const forwarded = fetchBackend.mock.calls[0]?.[0] as Request;
    expect(forwarded.url).toBe(incoming.url);
    expect(forwarded.headers.get('cookie')).toBe('inclass_access=token');
  });

  it('forwards next dev requests to the local backend', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const localFetch = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', localFetch);
    const request = new NextRequest('http://localhost:4001/api/v1/auth/me');

    await GET(request);
    const forwarded = localFetch.mock.calls[0]?.[0] as Request;
    expect(forwarded.url).toBe('http://localhost:4000/api/v1/auth/me');
    expect(fetchBackend).not.toHaveBeenCalled();
  });
});
