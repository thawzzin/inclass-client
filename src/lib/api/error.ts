import { isAxiosError } from 'axios';

interface BackendFailure {
  success: false;
  message: string;
  errors: unknown[];
}

function isBackendFailure(value: unknown): value is BackendFailure {
  if (typeof value !== 'object' || value === null) return false;
  const response = value as Partial<BackendFailure>;
  return response.success === false && typeof response.message === 'string' && Array.isArray(response.errors);
}

export class ApiError extends Error {
  public readonly status: number | undefined;
  public readonly errors: unknown[];

  public constructor(message: string, status?: number, errors: unknown[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (isAxiosError(error) && isBackendFailure(error.response?.data)) {
    return new ApiError(error.response.data.message, error.response.status, error.response.data.errors);
  }

  return new ApiError('Unable to reach the server. Please try again.');
}
