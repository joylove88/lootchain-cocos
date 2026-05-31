import type { SpriteFrame, VideoClip } from 'cc';
import { LobbyResourceLoader } from './LobbyResourceLoader';
import type { LobbyLoadingState } from './LobbyLoadingRenderer';

const INITIAL_LOADING_PROGRESS = 0.04;
const PROGRESS_FRAME_DELAY_MS = 80;
const FALLBACK_TOKEN_NAME = 'player-token';

export interface LobbyLoadingFlowHost {
  showLobbyLoadingView(): void;
  refreshLobbyLoadingView(): void;
  setLobbyBackgroundResources(posterFrame: SpriteFrame, videoClip: VideoClip | null): void;
  enterLobbyView(): void;
}

/**
 * 大厅资源加载流程控制器。
 *
 * 通过 loadingTicket 防止旧加载流程覆盖新状态；资源加载完成后只通过 host 通知 root 写入背景资源并进入大厅。
 */
export class LobbyLoadingFlow {
  private readonly resourceLoader = new LobbyResourceLoader();
  private loadingTicket = 0;
  private currentState: LobbyLoadingState = {
    progress: 0,
    message: '准备进入游戏...',
    error: '',
  };

  constructor(private readonly host: LobbyLoadingFlowHost) {}

  get state(): LobbyLoadingState {
    return this.currentState;
  }

  start(tokenName: string): void {
    // 每次 start 都生成新 ticket，旧的异步回调会被 isCurrentTicket 拦截。
    const ticket = ++this.loadingTicket;
    this.currentState = {
      progress: INITIAL_LOADING_PROGRESS,
      message: `登录成功：${tokenName || FALLBACK_TOKEN_NAME}，准备资源清单...`,
      error: '',
    };
    this.host.showLobbyLoadingView();
    this.load(ticket).catch((error: unknown) => {
      this.fail(ticket, error);
    });
  }

  retry(tokenName: string): void {
    this.start(tokenName);
  }

  cancel(): void {
    // 根节点销毁或切换流程时让当前异步加载票据失效，避免旧回调再进入大厅。
    this.loadingTicket += 1;
  }

  private async load(ticket: number): Promise<void> {
    const loadedResources = await this.resourceLoader.load((progress, message) => this.setLoadingProgress(ticket, progress, message));
    if (!loadedResources || !this.isCurrentTicket(ticket)) {
      return;
    }

    // 资源写入前再次检查 ticket，避免快速重试时旧资源覆盖新流程。
    this.host.setLobbyBackgroundResources(loadedResources.posterFrame, loadedResources.videoClip);
    if (!await this.setLoadingProgress(ticket, 1, '资源加载完成，进入圣契大厅...')) {
      return;
    }
    if (!this.isCurrentTicket(ticket)) {
      return;
    }
    this.host.enterLobbyView();
  }

  private async setLoadingProgress(ticket: number, progress: number, message: string): Promise<boolean> {
    if (!this.isCurrentTicket(ticket)) {
      return false;
    }
    this.currentState = {
      progress,
      message,
      error: '',
    };
    this.host.refreshLobbyLoadingView();
    // 延迟一帧给 loading 界面刷新机会，避免进度直接跳到最终态。
    await this.delay(PROGRESS_FRAME_DELAY_MS);
    return this.isCurrentTicket(ticket);
  }

  private fail(ticket: number, error: unknown): void {
    if (!this.isCurrentTicket(ticket)) {
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    this.currentState = {
      progress: 0,
      message: '',
      error: `资源加载失败：${message}`,
    };
    this.host.refreshLobbyLoadingView();
  }

  private isCurrentTicket(ticket: number): boolean {
    return ticket === this.loadingTicket;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
