import { HttpClient } from '../net/HttpClient';
import { TokenStore } from '../store/TokenStore';
import type { PlayerTokenVO } from '../types/AuthTypes';

export class PlayerAuthApi {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenStore: TokenStore,
  ) {}

  async devLogin(userId: number): Promise<PlayerTokenVO> {
    const token = await this.http.post<PlayerTokenVO>('/api/player/auth/dev-login', { userId });
    this.tokenStore.save(token);
    return token;
  }

  logout(): void {
    this.tokenStore.clear();
  }
}
