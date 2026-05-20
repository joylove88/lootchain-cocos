import { AppConfig } from '../app/AppConfig';
import type { ApiResult, QueryParams } from '../types/CommonTypes';
import { TokenStore } from '../store/TokenStore';

export class ApiError extends Error {
  readonly code: number;
  readonly requestUrl?: string;

  constructor(code: number, message: string, requestUrl?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.requestUrl = requestUrl;
  }
}

export class HttpClient {
  private baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly tokenStore: TokenStore,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  post<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('POST', path, body, query);
  }

  put<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('PUT', path, body, query);
  }

  request<T>(method: string, path: string, body?: unknown, query?: QueryParams): Promise<T> {
    const url = this.buildUrl(path, query);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.timeout = AppConfig.requestTimeoutMs;
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

      const auth = this.tokenStore.authHeader();
      if (auth) {
        xhr.setRequestHeader(auth.name, auth.value);
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new ApiError(xhr.status || -1, xhr.responseText || '网络请求失败', url));
          return;
        }
        try {
          const result = JSON.parse(xhr.responseText || '{}') as ApiResult<T>;
          if (result.code !== 0) {
            reject(new ApiError(result.code, result.msg || '业务请求失败', url));
            return;
          }
          resolve(result.data);
        } catch (error) {
          reject(error);
        }
      };
      xhr.onerror = () => reject(new ApiError(-1, '网络连接失败', url));
      xhr.ontimeout = () => reject(new ApiError(-2, '请求超时', url));
      xhr.send(body === undefined ? null : JSON.stringify(body));
    });
  }

  private buildUrl(path: string, query?: QueryParams): string {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (!query) {
      return url;
    }
    const pairs = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    return pairs.length > 0 ? `${url}?${pairs.join('&')}` : url;
  }
}
