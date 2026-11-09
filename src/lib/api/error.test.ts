import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { ApiError, normalizeApiError } from './error';

describe('normalizeApiError', () => {
  it('preserves a verified backend failure response', () => {
    const response: AxiosResponse = {
      data: {
        success: false as const,
        message: 'Validation failed',
        errors: [{ path: ['email'], message: 'Invalid email address' }],
      },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, response);

    const normalized = normalizeApiError(error);

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized).toMatchObject({
      message: 'Validation failed',
      status: 422,
      errors: [{ path: ['email'], message: 'Invalid email address' }],
    });
  });

  it('uses a safe message for unknown failures', () => {
    expect(normalizeApiError(new Error('socket unavailable'))).toMatchObject({
      message: 'Unable to reach the server. Please try again.',
      status: undefined,
      errors: [],
    });
  });
});
