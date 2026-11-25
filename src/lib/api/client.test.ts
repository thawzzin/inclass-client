import { createApiClient, getApiBaseUrl, withCsrfHeader } from './client';

describe('getApiBaseUrl', () => {
  it('uses the public backend URL from the build environment', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/api/v1');
    expect(getApiBaseUrl()).toBe('https://api.example.com/api/v1');
    vi.unstubAllEnvs();
  });

  it('requires a configured backend URL', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    expect(() => getApiBaseUrl()).toThrow('NEXT_PUBLIC_API_URL');
    vi.unstubAllEnvs();
  });
});

describe('createApiClient', () => {
  it('uses credentials and sends the CSRF token only for state-changing requests', async () => {
    const client = createApiClient(
      'http://localhost:4000/api/v1',
      () => 'csrf-token',
    );

    const getRequest = await client.getUri({ url: '/students' });

    expect(client.defaults.baseURL).toBe('http://localhost:4000/api/v1');
    expect(client.defaults.withCredentials).toBe(true);
    expect(getRequest).toBe('http://localhost:4000/api/v1/students');

    expect(withCsrfHeader('post', {}, 'csrf-token')).toEqual({
      'X-CSRF-Token': 'csrf-token',
    });
  });

  it('does not attach a CSRF header to a read request', () => {
    expect(withCsrfHeader('get', {}, 'csrf-token')).toEqual({});
  });
});
