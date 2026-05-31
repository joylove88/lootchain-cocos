import {
  Button,
  Color,
  Graphics,
  Label,
  Size,
} from 'cc';
import { clamp, rgba, type UiLayout } from './LobbyHudTypes';

export interface LobbyLoadingState {
  progress: number;
  message: string;
  error: string;
}

export interface LobbyLoadingHost {
  addRect(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke?: Color, lineWidth?: number): Graphics;
  addBeveledPanel(name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Graphics;
  addLabel(text: string, x: number, y: number, size?: number, color?: Color, contentSize?: Size): Label;
  addProgressBar(x: number, y: number, width: number, height: number, progress: number): void;
  addGoldButton(text: string, x: number, y: number, callback: () => void, layout: UiLayout, width: number, height: number): Button;
  retryLobbyLoading(): void;
}

/** 只负责 loading 页面视觉渲染；进度推进和资源加载由 LobbyLoadingFlow 控制。 */
export class LobbyLoadingRenderer {
  constructor(private readonly host: LobbyLoadingHost) {}

  render(layout: UiLayout, state: LobbyLoadingState): void {
    const centerX = (layout.stageLeft + layout.stageRight) / 2;
    const centerY = (layout.stageTop + layout.stageBottom) / 2;

    this.host.addRect('LoadingMask', 0, 0, layout.width, layout.height, rgba(3, 3, 5, 210));
    // 面板尺寸跟随安全内容宽度收缩，保证窄屏预览不会溢出舞台。
    const panelWidth = Math.min(660 * layout.uiScale, layout.contentWidth * 0.72);
    const panelHeight = 260 * layout.uiScale;
    const panelY = centerY - 12 * layout.uiScale;
    this.host.addBeveledPanel('LoadingPanel', centerX, panelY, panelWidth, panelHeight, rgba(10, 8, 10, 232), rgba(214, 177, 94, 230), 18 * layout.uiScale);
    this.host.addLabel('资源加载中', centerX, panelY + 74 * layout.uiScale, 32 * layout.uiScale, rgba(245, 210, 122), new Size(panelWidth - 70 * layout.uiScale, 54 * layout.uiScale));
    this.host.addLabel(
      state.error || state.message,
      centerX,
      panelY + 26 * layout.uiScale,
      17 * layout.uiScale,
      state.error ? rgba(255, 107, 124) : rgba(215, 210, 198),
      new Size(panelWidth - 96 * layout.uiScale, 42 * layout.uiScale),
    );
    this.host.addProgressBar(centerX, panelY - 24 * layout.uiScale, panelWidth - 120 * layout.uiScale, 20 * layout.uiScale, clamp(state.progress, 0, 1));
    this.host.addLabel(
      `${Math.round(clamp(state.progress, 0, 1) * 100)}%`,
      centerX,
      panelY - 64 * layout.uiScale,
      18 * layout.uiScale,
      rgba(127, 214, 255),
      new Size(panelWidth - 110 * layout.uiScale, 34 * layout.uiScale),
    );
    if (state.error) {
      this.host.addGoldButton('重试加载', centerX, panelY - 104 * layout.uiScale, () => this.host.retryLobbyLoading(), layout, Math.min(260 * layout.uiScale, panelWidth - 130 * layout.uiScale), 46 * layout.uiScale);
    }
  }
}
