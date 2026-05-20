export interface Result<T> {
  code: number;
  data: T;
  msg: string;
}

export interface PlayerToken {
  tokenName: string;
  tokenValue: string;
}

export function defaultApiBaseUrl(): string {
  const { hostname, protocol } = window.location;
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8081';
  }
  return `${protocol === 'https:' ? 'https' : 'http'}://${hostname}:8081`;
}

export async function devLogin(apiBaseUrl: string, userId: number): Promise<PlayerToken> {
  const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/api/player/auth/dev-login`;
  const response = await fetch(endpoint, {
    body: JSON.stringify({ userId }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${endpoint}`);
  }

  const result = (await response.json()) as Result<PlayerToken>;
  if (result.code !== 0) {
    throw new Error(`${result.msg || '登录失败'} (${result.code}): ${endpoint}`);
  }
  return result.data;
}

export function savePlayerToken(token: PlayerToken): void {
  localStorage.setItem('lootchain.player.tokenName', token.tokenName);
  localStorage.setItem('lootchain.player.tokenValue', token.tokenValue);
}

export function loadPlayerToken(): PlayerToken | null {
  const tokenName = localStorage.getItem('lootchain.player.tokenName');
  const tokenValue = localStorage.getItem('lootchain.player.tokenValue');
  if (!tokenName || !tokenValue) {
    return null;
  }
  return { tokenName, tokenValue };
}

export function clearPlayerToken(): void {
  localStorage.removeItem('lootchain.player.tokenName');
  localStorage.removeItem('lootchain.player.tokenValue');
}
