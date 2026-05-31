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

// Cocos 前端运行配置。预览环境默认连接同主机 8081 的 game service。
export const AppConfig = {
  apiBaseUrl: resolveDefaultApiBaseUrl(),
  defaultDevUserId: 1,
  requestTimeoutMs: 15000,
  supportedTargets: ['cocos-web'] as const,
};
