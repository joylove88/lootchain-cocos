import {
  Button,
  Color,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  Sprite,
} from 'cc';
import { rgba, type UiLayout } from './lobby/LobbyHudTypes';

export const SCENE_BACK_BUTTON_ASSET = 'ui/common/scene_back_button/spriteFrame';

export interface SceneBackButtonHost {
  addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  addSprite?(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;
  addChildLabel?(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    contentSize: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/**
 * 全屏逻辑场景统一返回按钮。
 * 与 Gacha 预览页保持同一套位置、尺寸、标题和按压反馈。
 */
export function renderSceneBackButton(
  host: SceneBackButtonHost,
  parent: Node,
  layout: UiLayout,
  name: string,
  onClick: () => void,
  scale: number,
  titleText = '',
): Node {
  const buttonScale = Math.max(0.56, Math.min(1, scale));
  const buttonWidth = 96 * buttonScale;
  const buttonHeight = 46 * buttonScale;
  const button = host.addChildPlainNode(
    parent,
    name,
    layout.stageLeft + 58 * buttonScale,
    layout.stageTop - 42 * buttonScale,
    buttonWidth,
    buttonHeight,
  );
  button.addComponent(Button);
  button.on(Button.EventType.CLICK, onClick);
  host.applyImageButtonFeedback(button, 1.04, 0.96);

  const sprite = host.addSprite?.('SceneBackButtonArt', SCENE_BACK_BUTTON_ASSET, 0, 0, buttonWidth, buttonHeight, button);
  if (!sprite) {
    drawFallbackBackButton(button, buttonWidth, buttonHeight, buttonScale);
  }
  renderBackTitle(host, parent, layout, buttonScale, titleText);
  return button;
}

function renderBackTitle(host: SceneBackButtonHost, parent: Node, layout: UiLayout, scale: number, titleText: string): void {
  if (!titleText || !host.addChildLabel) {
    return;
  }
  const titleX = layout.stageLeft + 116 * scale;
  const titleY = layout.stageTop - 42 * scale;
  const titleWidth = Math.max(116 * scale, Math.min(320 * scale, layout.stageRight - titleX - 18 * scale));
  const title = host.addChildLabel(parent, 'SceneBackTitle', titleText, titleX, titleY + 1 * scale, 30 * scale, rgba(250, 222, 158), new Size(titleWidth, 44 * scale), HorizontalTextAlignment.LEFT);
  title.overflow = Label.Overflow.SHRINK;
  title.enableOutline = true;
  title.outlineColor = rgba(0, 0, 0, 220);
  title.outlineWidth = Math.max(1, 1.4 * scale);
}

function drawFallbackBackButton(button: Node, width: number, height: number, scale: number): void {
  const graphics = button.addComponent(Graphics);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  graphics.fillColor = rgba(18, 9, 7, 214);
  graphics.moveTo(-halfWidth + 10 * scale, 0);
  graphics.lineTo(-halfWidth + 30 * scale, halfHeight - 4 * scale);
  graphics.lineTo(halfWidth - 12 * scale, halfHeight - 4 * scale);
  graphics.lineTo(halfWidth - 4 * scale, 0);
  graphics.lineTo(halfWidth - 12 * scale, -halfHeight + 4 * scale);
  graphics.lineTo(-halfWidth + 30 * scale, -halfHeight + 4 * scale);
  graphics.close();
  graphics.fill();
  graphics.strokeColor = rgba(230, 180, 88, 232);
  graphics.lineWidth = Math.max(2, 2.2 * scale);
  graphics.stroke();
  graphics.strokeColor = rgba(255, 226, 144, 250);
  graphics.lineWidth = Math.max(2, 2.5 * scale);
  graphics.moveTo(13 * scale, 14 * scale);
  graphics.lineTo(-16 * scale, 0);
  graphics.lineTo(13 * scale, -14 * scale);
  graphics.moveTo(-11 * scale, 0);
  graphics.lineTo(24 * scale, 0);
  graphics.stroke();
}
