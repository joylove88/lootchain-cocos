import type { LobbyCodexItemVO, LobbyCodexPanelState } from '../../types/LobbyCodexTypes';

/** 大厅图鉴只读状态。 */
export class LobbyCodexState {
  private panelState: LobbyCodexPanelState = {
    loading: false,
    loaded: false,
    error: '',
    items: [],
  };
  private revision = 0;

  get version(): number {
    return this.revision;
  }

  reset(): void {
    // 切换账号时清掉上一位玩家的图鉴拥有状态，避免短暂串号展示。
    this.panelState = {
      loading: false,
      loaded: false,
      error: '',
      items: [],
    };
    this.revision += 1;
  }

  startLoading(): void {
    this.panelState = {
      ...this.panelState,
      loading: true,
      error: '',
    };
    this.revision += 1;
  }

  applyLoaded(items: LobbyCodexItemVO[]): void {
    this.panelState = {
      loading: false,
      loaded: true,
      error: '',
      items: items.slice(0, 80),
    };
    this.revision += 1;
  }

  applyError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.panelState = {
      loading: false,
      loaded: false,
      error: message || '图鉴读取失败',
      items: [],
    };
    this.revision += 1;
  }

  snapshot(): LobbyCodexPanelState {
    return {
      ...this.panelState,
      items: [...this.panelState.items],
    };
  }
}
