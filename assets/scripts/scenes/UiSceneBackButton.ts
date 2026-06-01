import {
  Button,
  Graphics,
  Node,
} from 'cc';
import { rgba, type UiLayout } from './lobby/LobbyHudTypes';

export interface SceneBackButtonHost {
  addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
}

/**
 * 全屏逻辑场景统一返回按钮。
 * 与 Gacha 预览页保持同一套位置、尺寸、箭头线宽和按压反馈。
 */
export function renderSceneBackButton(
  host: SceneBackButtonHost,
  parent: Node,
  layout: UiLayout,
  name: string,
  onClick: () => void,
  scale: number,
): Node {
  const buttonScale = Math.max(0.56, Math.min(1, scale));
  const button = host.addChildPlainNode(
    parent,
    name,
    layout.stageLeft + 46 * buttonScale,
    layout.stageTop - 42 * buttonScale,
    60 * buttonScale,
    44 * buttonScale,
  );
  button.addComponent(Button);
  button.on(Button.EventType.CLICK, onClick);
  host.applyImageButtonFeedback(button, 1.04, 0.96);

  const graphics = button.addComponent(Graphics);
  graphics.strokeColor = rgba(218, 170, 84, 220);
  graphics.lineWidth = Math.max(2, 2 * buttonScale);
  graphics.moveTo(14 * buttonScale, 15 * buttonScale);
  graphics.lineTo(-13 * buttonScale, 0);
  graphics.lineTo(14 * buttonScale, -15 * buttonScale);
  graphics.stroke();
  return button;
}
