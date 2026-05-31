import type { LobbyNoticePanelState, LobbyNoticeVO } from '../../types/LobbyNoticeTypes';

const FALLBACK_NOTICE: LobbyNoticeVO = {
  noticeNo: 'local-lobby-preview',
  noticeType: 'lobby',
  title: '大厅公告占位',
  content: '服务端公告暂不可用时，大厅会保留本地只读说明。该面板不会触发玩法、资源或账号状态变更。',
  priority: 0,
  startTime: null,
  endTime: null,
  publishTime: null,
};

/** 大厅公告只读状态。 */
export class LobbyNoticeState {
  private panelState: LobbyNoticePanelState = {
    loading: false,
    loaded: false,
    error: '',
    notices: [],
  };
  private revision = 0;

  get version(): number {
    return this.revision;
  }

  reset(): void {
    // 重新登录时清空上一位玩家看到的公告状态，避免错误提示或旧列表短暂残留。
    this.panelState = {
      loading: false,
      loaded: false,
      error: '',
      notices: [],
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

  applyLoaded(notices: LobbyNoticeVO[]): void {
    this.panelState = {
      loading: false,
      loaded: true,
      error: '',
      notices: notices.slice(0, 8),
    };
    this.revision += 1;
  }

  applyError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.panelState = {
      loading: false,
      loaded: false,
      error: message || '公告读取失败',
      notices: [],
    };
    this.revision += 1;
  }

  snapshot(): LobbyNoticePanelState {
    if (this.panelState.error && this.panelState.notices.length === 0) {
      return {
        ...this.panelState,
        notices: [FALLBACK_NOTICE],
      };
    }
    return {
      ...this.panelState,
      notices: [...this.panelState.notices],
    };
  }
}
