import {
  Color,
  Label,
  Size,
} from 'cc';
import { rgba, type UiLayout } from './lobby/LobbyHudTypes';

export interface StatusPresenterHost {
  addLabel(text: string, x: number, y: number, size?: number, color?: Color, contentSize?: Size): Label;
  resolveLayout(): UiLayout;
  trimText(text: string): string;
}

/**
 * 统一管理底部状态文案。
 *
 * 视图重绘会销毁旧 Label，所以这里保存 Label 引用并在 root 清空 UI 时 reset，
 * 避免后续 setStatus 写到已经脱离节点树的组件上。
 */
export class StatusPresenter {
  private label: Label | null = null;

  constructor(private readonly host: StatusPresenterHost) {}

  reset(): void {
    // 只清引用，不销毁节点；节点销毁由 content root 统一处理。
    this.label = null;
  }

  add(text: string, layout?: UiLayout, y?: number): void {
    const currentLayout = layout ?? this.host.resolveLayout();
    const statusY = y ?? currentLayout.safeBottom + Math.max(8 * currentLayout.uiScale, currentLayout.safeHeight * 0.01);
    const centerX = (currentLayout.stageLeft + currentLayout.stageRight) / 2;
    this.label = this.host.addLabel(
      text,
      centerX,
      statusY,
      currentLayout.bodyFont,
      rgba(127, 214, 255),
      new Size(currentLayout.statusWidth, 48 * currentLayout.uiScale),
    );
  }

  set(text: string): void {
    if (!this.label || !this.label.node?.isValid) {
      this.add(text);
      return;
    }
    this.label.string = this.host.trimText(text);
  }
}
