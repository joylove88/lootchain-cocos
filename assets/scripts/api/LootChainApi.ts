import { AppConfig } from '../app/AppConfig';
import { HttpClient } from '../net/HttpClient';
import { TokenStore } from '../store/TokenStore';
import { BagApi } from './BagApi';
import { GachaApi } from './GachaApi';
import { HeroApi } from './HeroApi';
import { PlayerAuthApi } from './PlayerAuthApi';

export class LootChainApi {
  readonly tokenStore = new TokenStore();
  readonly http = new HttpClient(AppConfig.apiBaseUrl, this.tokenStore);
  readonly auth = new PlayerAuthApi(this.http, this.tokenStore);
  readonly gacha = new GachaApi(this.http);
  readonly hero = new HeroApi(this.http);
  readonly bag = new BagApi(this.http);

  setApiBaseUrl(baseUrl: string): void {
    this.http.setBaseUrl(baseUrl);
  }
}

export const lootChainApi = new LootChainApi();
