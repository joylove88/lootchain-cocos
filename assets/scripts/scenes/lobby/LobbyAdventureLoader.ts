import type { LobbyAdventureApi } from '../../api/LobbyAdventureApi';
import type { LobbyAdventurePanelState } from '../../types/LobbyAdventureTypes';
import { LobbyAdventureState } from './LobbyAdventureState';

export interface LobbyAdventureLoaderHost {
  isLobbyViewActive(): boolean;
  refreshLobbyOverlay(): void;
}

/** 大厅冒险主线只读加载器。 */
export class LobbyAdventureLoader {
  private readonly adventureState = new LobbyAdventureState();
  private loadTicket = 0;

  constructor(
    private readonly adventureApi: LobbyAdventureApi,
    private readonly host: LobbyAdventureLoaderHost,
  ) {}

  get loading(): boolean {
    return this.adventureState.snapshot().loading;
  }

  get loaded(): boolean {
    return this.adventureState.snapshot().loaded;
  }

  get version(): number {
    return this.adventureState.version;
  }

  cancel(): void {
    // 销毁场景或重新登录时让旧请求失效，避免慢响应覆盖新玩家的主线状态。
    this.loadTicket += 1;
  }

  resetForLogin(): void {
    this.cancel();
    this.adventureState.reset();
  }

  currentState(): LobbyAdventurePanelState {
    return this.adventureState.snapshot();
  }

  async load(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.loaded && !force) {
      return;
    }
    const ticket = this.nextTicket();
    this.adventureState.startLoading();
    this.refreshIfActive();
    try {
      const adventure = await this.adventureApi.lobbyAdventure();
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.adventureState.applyLoaded(adventure);
    } catch (error) {
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.adventureState.applyError(error);
      console.warn('[LootChain] lobby adventure load failed:', error);
    } finally {
      if (this.isCurrentRequest(ticket)) {
        this.refreshIfActive();
      }
    }
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
