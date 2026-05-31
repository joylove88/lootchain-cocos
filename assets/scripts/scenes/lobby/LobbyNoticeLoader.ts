import type { LobbyNoticeApi } from '../../api/LobbyNoticeApi';
import type { LobbyNoticePanelState } from '../../types/LobbyNoticeTypes';
import { LobbyNoticeState } from './LobbyNoticeState';

export interface LobbyNoticeLoaderHost {
  isLobbyViewActive(): boolean;
  refreshLobbyOverlay(): void;
}

/** 大厅公告只读加载器。 */
export class LobbyNoticeLoader {
  private readonly noticeState = new LobbyNoticeState();
  private loadTicket = 0;

  constructor(
    private readonly noticeApi: LobbyNoticeApi,
    private readonly host: LobbyNoticeLoaderHost,
  ) {}

  get loading(): boolean {
    return this.noticeState.snapshot().loading;
  }

  get loaded(): boolean {
    return this.noticeState.snapshot().loaded;
  }

  get version(): number {
    return this.noticeState.version;
  }

  cancel(): void {
    // 关闭场景或重新登录时让旧请求失效，防止接口慢响应覆盖新面板。
    this.loadTicket += 1;
  }

  resetForLogin(): void {
    this.cancel();
    this.noticeState.reset();
  }

  currentState(): LobbyNoticePanelState {
    return this.noticeState.snapshot();
  }

  async load(force = false): Promise<void> {
    if (this.loading) {
      return;
    }
    if (this.loaded && !force) {
      return;
    }
    const ticket = this.nextTicket();
    this.noticeState.startLoading();
    this.refreshIfActive();
    try {
      const notices = await this.noticeApi.lobbyNotices();
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.noticeState.applyLoaded(notices);
    } catch (error) {
      if (!this.isCurrentRequest(ticket)) {
        return;
      }
      this.noticeState.applyError(error);
      console.warn('[LootChain] lobby notices load failed:', error);
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
