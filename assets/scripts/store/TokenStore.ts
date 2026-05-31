import { sys } from 'cc';
import type { PlayerTokenVO } from '../types/AuthTypes';

const TOKEN_NAME_KEY = 'lootchain.player.tokenName';
const TOKEN_VALUE_KEY = 'lootchain.player.tokenValue';

/** 本地 token 存储，供 HttpClient 拼接后端返回的动态 token header。 */
export class TokenStore {
  save(token: PlayerTokenVO): void {
    sys.localStorage.setItem(TOKEN_NAME_KEY, token.tokenName);
    sys.localStorage.setItem(TOKEN_VALUE_KEY, token.tokenValue);
  }

  clear(): void {
    sys.localStorage.removeItem(TOKEN_NAME_KEY);
    sys.localStorage.removeItem(TOKEN_VALUE_KEY);
  }

  tokenName(): string | null {
    return sys.localStorage.getItem(TOKEN_NAME_KEY);
  }

  tokenValue(): string | null {
    return sys.localStorage.getItem(TOKEN_VALUE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.tokenName() && !!this.tokenValue();
  }

  authHeader(): { name: string; value: string } | null {
    // 后端返回 tokenName/tokenValue，所以这里返回动态 header 名和值。
    const name = this.tokenName();
    const value = this.tokenValue();
    if (!name || !value) {
      return null;
    }
    return { name, value };
  }
}
