import {
  Color,
  HorizontalTextAlignment,
  Label,
  Node,
  Size,
  Sprite,
} from 'cc';
import type { PlayerLobbyProfileVO } from '../../types/PlayerTypes';

export interface UiLayout {
  width: number;
  height: number;
  stageWidth: number;
  stageHeight: number;
  stageLeft: number;
  stageRight: number;
  stageTop: number;
  stageBottom: number;
  safeLeft: number;
  safeRight: number;
  safeTop: number;
  safeBottom: number;
  safeWidth: number;
  safeHeight: number;
  safeInsetX: number;
  safeInsetY: number;
  contentWidth: number;
  buttonHeight: number;
  uiScale: number;
}

export interface LobbyPlayerInfoLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LobbyResourceItem {
  key: 'stamina' | 'coin' | 'ruby' | 'crystal';
  label: string;
  value: string;
  tint: Color;
}

export type LobbySystemIconKey = 'friends' | 'mail' | 'settings' | 'menu';
export type LobbyActivityIconKey = 'event' | 'summon' | 'contract' | 'market' | 'gift';
export type LobbyNavIconKey = 'hero' | 'bag' | 'contract' | 'codex' | 'quest' | 'forge' | 'shop';

export interface LobbyActivityItemConfig {
  icon: LobbyActivityIconKey;
  title: string;
  subline: string;
  hot: boolean;
}

export interface LobbySceneHotspotConfig {
  label: string;
  x: number;
  y: number;
  width: number;
  hot: boolean;
  hitX: number;
  hitY: number;
  hitW: number;
  hitH: number;
}

export interface LobbyChallengeItemConfig {
  title: string;
  subline: string;
  tint: Color;
  hot: boolean;
}

export interface LobbyNavItemConfig {
  key: LobbyNavIconKey;
  label: string;
  hot: boolean;
}

export interface LobbyHudHost {
  node: Node;
  currentLobbyProfile(): PlayerLobbyProfileVO;
  openPlayerProfileDialog(): void;
  createUiNode(name: string): Node;
  addSprite(name: string, assetPath: string, x: number, y: number, width: number, height: number, parent?: Node): Sprite | null;
  addChildLabel(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: Color,
    contentSize?: Size,
    horizontalAlign?: HorizontalTextAlignment,
  ): Label;
  addChildPlainNode(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  addChildBeveledPanelNode(parent: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, stroke: Color, bevel?: number): Node;
  addLobbyAvatar(parent: Node, x: number, y: number, size: number, displayName: string): void;
  applyImageButtonFeedback(node: Node, hoverScale?: number, pressedScale?: number): void;
  applyPointerCursor(node: Node): void;
  setStatus(text: string): void;
  formatInteger(value: number | null | undefined): string;
  compactResourceValue(value: number | null | undefined): string;
}

export const LOBBY_PLAYER_INFO_PANEL_ASPECT = 540 / 218;
export const LOBBY_PLAYER_INFO_PANEL_ASSET = 'ui/lobby/lobby_player_info_panel/spriteFrame';

export function rgba(red: number, green: number, blue: number, alpha = 255): Color {
  return new Color(red, green, blue, alpha);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
