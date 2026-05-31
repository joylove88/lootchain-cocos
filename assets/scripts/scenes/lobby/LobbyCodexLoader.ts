import type { LobbyCodexApi } from '../../api/LobbyCodexApi';
import type { LobbyCodexPanelState } from '../../types/LobbyCodexTypes';
import { LobbyCodexState } from './LobbyCodexState';

export interface LobbyCodexLoaderHost {
  isLobbyViewActive(): boolean;
  refreshLobbyOverlay(): void;
}

/** 大厅图鉴只读加载器。 */
export class LobbyCodexLoader {
  private readonly codexState = new LobbyCodexState();
  private loadTicket = 0;

  constructor(
    private readonly codexApi: LobbyCodexApi,
    private readonly host: LobbyCodexLoaderHost,
  ) {}

  get loading(): boolean {
    return this.codexState.snapshot().loading;
  }

  get loaded(): boolean {
    return this.codexState.snapshot().loaded;
  }

  get version(): number {
    return this.codexState.version;
  }

  cancel(): void {
    // 销毁场景或重新登录时让旧请求失效，避免慢响应覆盖新玩家的图鉴状态。
    this.loadTicket += 1;
  }

  resetForLogin(): void {
    this.cancel();
    this.codexState.reset();
  }

  currentState(): LobbyCodexPanelState {
    return this.codexState.snapshot();
  }

  async load(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.loaded && !force) {
      return;
    }
    const ticket = this.nextTicket();
    this.codexState.startLoading();
    this.refreshIfActive();
    try {
      const items = await this.codexApi.lobbyCodex();
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.codexState.applyLoaded(items);
    } catch (error) {
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.codexState.applyError(error);
      console.warn('[LootChain] lobby codex load failed:', error);
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
