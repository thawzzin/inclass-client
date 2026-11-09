import { createQueryClient } from './client';

describe('createQueryClient', () => {
  it('uses conservative defaults that avoid automatic mutation retries', () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions()).toMatchObject({
      queries: { retry: false, staleTime: 30_000 },
      mutations: { retry: false },
    });
  });
});
