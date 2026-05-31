import type { LobbyHeroItemVO, LobbyHeroRosterPanelState } from '../../types/LobbyHeroTypes';

/** 大厅英雄队列只读状态。 */
export class LobbyHeroRosterState {
  private panelState: LobbyHeroRosterPanelState = {
    loading: false,
    loaded: false,
    error: '',
    heroes: [],
  };
  private revision = 0;

  get version(): number {
    return this.revision;
  }

  reset(): void {
    // 切换账号时清空上一位玩家的英雄队列，避免主角卡短暂串号显示。
    this.panelState = {
      loading: false,
      loaded: false,
      error: '',
      heroes: [],
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

  applyLoaded(heroes: LobbyHeroItemVO[]): void {
    this.panelState = {
      loading: false,
      loaded: true,
      error: '',
      heroes: heroes.slice(0, 60),
    };
    this.revision += 1;
  }

  applyError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.panelState = {
      loading: false,
      loaded: false,
      error: message || '英雄队列读取失败',
      heroes: [],
    };
    this.revision += 1;
  }

  snapshot(): LobbyHeroRosterPanelState {
    return {
      ...this.panelState,
      heroes: [...this.panelState.heroes],
    };
  }
}
