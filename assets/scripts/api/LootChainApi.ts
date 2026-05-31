import { AppConfig } from '../app/AppConfig';
import { HttpClient } from '../net/HttpClient';
import { TokenStore } from '../store/TokenStore';
import { BagApi } from './BagApi';
import { BattleApi } from './BattleApi';
import { GachaApi } from './GachaApi';
import { HeroApi } from './HeroApi';
import { LobbyCodexApi } from './LobbyCodexApi';
import { LobbyAdventureApi } from './LobbyAdventureApi';
import { LobbyHeroApi } from './LobbyHeroApi';
import { LobbyNoticeApi } from './LobbyNoticeApi';
import { PlayerAuthApi } from './PlayerAuthApi';
import { PlayerProfileApi } from './PlayerProfileApi';
import { ProtagonistApi } from './ProtagonistApi';

/**
 * 前端 API 聚合入口。
 *
 * 当前 Cocos 登录/大厅阶段只实际使用 auth、profile、protagonist、lobbyNotice、lobbyCodex、lobbyHero 和 lobbyAdventure；gacha/hero/bag 保留为历史接口封装，
 * 不代表当前大厅入口已经开放。
 */
export class LootChainApi {
  readonly tokenStore = new TokenStore();
  readonly http = new HttpClient(AppConfig.apiBaseUrl, this.tokenStore);
  readonly auth = new PlayerAuthApi(this.http, this.tokenStore);
  readonly profile = new PlayerProfileApi(this.http);
  readonly protagonist = new ProtagonistApi(this.http);
  readonly lobbyNotice = new LobbyNoticeApi(this.http);
  readonly lobbyCodex = new LobbyCodexApi(this.http);
  readonly lobbyHero = new LobbyHeroApi(this.http);
  readonly lobbyAdventure = new LobbyAdventureApi(this.http);
  readonly battle = new BattleApi(this.http);
  readonly gacha = new GachaApi(this.http);
  readonly hero = new HeroApi(this.http);
  readonly bag = new BagApi(this.http);

  setApiBaseUrl(baseUrl: string): void {
    this.http.setBaseUrl(baseUrl);
  }
}

export const lootChainApi = new LootChainApi();
