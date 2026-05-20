import { HttpClient } from '../net/HttpClient';
import type {
  HeroCodexItemVO,
  UserHeroDetailVO,
  UserHeroFragmentVO,
  UserHeroListItemVO,
} from '../types/HeroTypes';

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
