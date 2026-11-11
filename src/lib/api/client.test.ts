import { createApiClient, withCsrfHeader } from './client';

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
