import { HttpClient } from '../net/HttpClient';
import type {
  HeroCodexItemVO,
  UserHeroDetailVO,
  UserHeroFragmentVO,
  UserHeroListItemVO,
} from '../types/HeroTypes';

/** 英雄相关接口封装；当前大厅入口仍是占位，不在 Cocos-only 登录阶段主动调用。 */
export class HeroApi {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<UserHeroListItemVO[]> {
    return this.http.get<UserHeroListItemVO[]>('/api/player/heroes');
  }

  detail(heroId: number): Promise<UserHeroDetailVO> {
    return this.http.get<UserHeroDetailVO>(`/api/player/heroes/${heroId}`);
  }

  fragments(): Promise<UserHeroFragmentVO[]> {
    return this.http.get<UserHeroFragmentVO[]>('/api/player/heroes/fragments/list');
  }

  codex(): Promise<HeroCodexItemVO[]> {
    return this.http.get<HeroCodexItemVO[]>('/api/player/heroes/codex');
  }
}
