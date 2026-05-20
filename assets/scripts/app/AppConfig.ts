function resolveDefaultApiBaseUrl(): string {
  const runtimeLocation = (globalThis as { location?: { hostname?: string; protocol?: string } }).location;
  const hostname = runtimeLocation?.hostname;
  if (!hostname) {
    return 'http://localhost:8081';
  }

  const protocol = runtimeLocation.protocol === 'https:' ? 'https' : 'http';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8081';
  }

  return `${protocol}://${hostname}:8081`;
}

export const AppConfig = {
  apiBaseUrl: resolveDefaultApiBaseUrl(),
  defaultDevUserId: 1,
  requestTimeoutMs: 15000,
  supportedTargets: ['web-desktop', 'h5'] as const,
  enableWriteActions: false,
};
