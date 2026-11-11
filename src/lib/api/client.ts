import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

const STATE_CHANGING_METHODS = new Set(['delete', 'patch', 'post', 'put']);

export type CsrfTokenProvider = () => string | null;

export function withCsrfHeader(
  method: string | undefined,
  headers: Record<string, string>,
  csrfToken: string | null,
): Record<string, string> {
  if (!csrfToken || !STATE_CHANGING_METHODS.has(method?.toLowerCase() ?? 'get'))
    return headers;
  return { ...headers, 'X-CSRF-Token': csrfToken };
}

function attachCsrfToken(
  config: InternalAxiosRequestConfig,
  getCsrfToken: CsrfTokenProvider,
) {
  const csrfToken = getCsrfToken();
  const headers = withCsrfHeader(
    config.method,
    config.headers.toJSON(true) as Record<string, string>,
    csrfToken,
  );
  config.headers.set(headers);

  return config;
}

export function createApiClient(
  baseURL: string,
  getCsrfToken: CsrfTokenProvider,
): AxiosInstance {
  const client = axios.create({ baseURL, withCredentials: true });
  client.interceptors.request.use((config) =>
    attachCsrfToken(config, getCsrfToken),
  );
  return client;
}

export function getApiBaseUrl(): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) throw new Error('NEXT_PUBLIC_API_URL must be configured.');
  return baseURL.replace(/\/$/, '');
}
