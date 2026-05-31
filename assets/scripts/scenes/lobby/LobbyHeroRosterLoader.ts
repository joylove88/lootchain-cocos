import type { LobbyHeroApi } from '../../api/LobbyHeroApi';
import type { LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';
import { LobbyHeroRosterState } from './LobbyHeroRosterState';

export interface LobbyHeroRosterLoaderHost {
  isLobbyViewActive(): boolean;
  refreshLobbyOverlay(): void;
}

/** 大厅英雄队列只读加载器。 */
export class LobbyHeroRosterLoader {
  private readonly rosterState = new LobbyHeroRosterState();
  private loadTicket = 0;
  private inFlightLoad: Promise<void> | null = null;

  constructor(
    private readonly heroApi: LobbyHeroApi,
    private readonly host: LobbyHeroRosterLoaderHost,
  ) {}

  get loading(): boolean {
    return this.rosterState.snapshot().loading;
  }

  get loaded(): boolean {
    return this.rosterState.snapshot().loaded;
  }

  get version(): number {
    return this.rosterState.version;
  }

  cancel(): void {
    // 销毁场景或重新登录时让旧请求失效，避免慢响应覆盖新玩家的英雄队列。
    this.loadTicket += 1;
    this.inFlightLoad = null;
  }

  resetForLogin(): void {
    this.cancel();
    this.rosterState.reset();
  }

  currentState(): LobbyHeroRosterPanelState {
    return this.rosterState.snapshot();
  }

  async load(force = false): Promise<void> {
    if (this.loading && this.inFlightLoad) {
      // 多个入口同时读取英雄队列时复用同一个请求，避免编队刚打开、战斗预演马上读取时拿到空阵容。
      return this.inFlightLoad;
    }
    if (this.loaded && !force) {
      return;
    }

    const ticket = this.nextTicket();
    this.rosterState.startLoading();
    this.refreshIfActive();

    let loadPromise: Promise<void> | null = null;
    loadPromise = (async () => {
      try {
        const heroes = await this.heroApi.lobbyHeroes();
        if (!this.isCurrentRequest(ticket)) {
          return;
        }
        this.rosterState.applyLoaded(heroes);
      } catch (error) {
        if (!this.isCurrentRequest(ticket)) {
          return;
        }
        this.rosterState.applyError(error);
        console.warn('[LootChain] lobby hero roster load failed:', error);
      } finally {
        if (this.inFlightLoad === loadPromise) {
          this.inFlightLoad = null;
        }
        if (this.isCurrentRequest(ticket)) {
          this.refreshIfActive();
        }
      }
    })();

    this.inFlightLoad = loadPromise;
    return loadPromise;
  }

  private nextTicket(): number {
    this.loadTicket += 1;
    return this.loadTicket;
  }

  private isCurrentRequest(ticket: number): boolean {
    return ticket === this.loadTicket;
  }

  private refreshIfActive(): void {
    if (this.host.isLobbyViewActive()) {
      this.host.refreshLobbyOverlay();
    }
  }
}
